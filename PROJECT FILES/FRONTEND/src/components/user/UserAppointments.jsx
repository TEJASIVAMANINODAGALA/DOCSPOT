import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card } from 'react-bootstrap';
import { message } from 'antd';

const UserAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.post(
        'http://localhost:8001/api/user/getuserappointments',
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        message.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
    }
  }, [user]);

  return (
    <Card className='p-4 m-3'>
      <h4 className='mb-3'>My Appointments</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Document</th> {/* New column */}
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <tr key={index}>
                <td>{appointment.docName}</td>
                <td>{appointment.date}</td>
                <td>{appointment.status}</td>
                <td>
                  {appointment.document?.path ? (
                    <a
                      href={`http://localhost:8001${appointment.document.path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "No document"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className='text-center'>No appointments found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default UserAppointments;
