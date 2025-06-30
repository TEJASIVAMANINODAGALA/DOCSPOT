import React, { useEffect, useState } from 'react';
import { Button, Container, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No auth token found.");
        return;
      }

      const res = await axios.get('http://localhost:5000/api/admin/getalldoctors', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        console.log("Fetched Doctors:", res.data.data);
        setDoctors(res.data.data);
      } else {
        message.error(res.data.message || "Failed to fetch doctors.");
      }
    } catch (error) {
      console.error("Fetch Doctors Error:", error);
      const errorMsg = error?.response?.data?.message || error.message;
      message.error(`Error fetching doctors: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (doctorId, status, userId, endpoint) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/${endpoint}`, {
        doctorId, status, userid: userId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        message.success(res.data.message);
        getDoctors(); // Refresh after update
      } else {
        message.error(res.data.message || "Failed to update doctor status.");
      }
    } catch (error) {
      console.error(`${endpoint} Error:`, error);
      const errorMsg = error?.response?.data?.message || error.message;
      message.error(`Error during ${endpoint}: ${errorMsg}`);
    }
  };

  const handleApprove = (id, userId) => updateDoctorStatus(id, 'approved', userId, 'getapprove');
  const handleReject = (id, userId) => updateDoctorStatus(id, 'rejected', userId, 'getreject');

  useEffect(() => {
    getDoctors();
  }, []);

  return (
    <div>
      <h2 className='p-3 text-center'>All Doctors</h2>
      <Container>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && doctors.length > 0 ? (
              doctors.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.status === 'pending' ? (
                      <>
                        <Button
                          onClick={() => handleApprove(user._id, user.userId)}
                          className='mx-1'
                          size='sm'
                          variant="outline-success"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(user._id, user.userId)}
                          className='mx-1'
                          size='sm'
                          variant="outline-danger"
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span style={{ textTransform: 'capitalize' }}>{user.status}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan={5}>
                  <Alert variant="info" className="text-center">
                    <Alert.Heading>No Doctors to show</Alert.Heading>
                  </Alert>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="text-center">Loading...</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

export default AdminDoctors;
