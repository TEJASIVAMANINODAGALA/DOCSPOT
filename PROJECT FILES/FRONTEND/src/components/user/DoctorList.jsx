// ✅ DoctorList.jsx
import { message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Modal } from 'react-bootstrap';

const DoctorList = ({ userDoctorId, doctor, userdata }) => {
  const [dateTime, setDateTime] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [show, setShow] = useState(false);

  const currentDate = new Date().toISOString().slice(0, 16);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (event) => {
    setDateTime(event.target.value);
  };

  const handleDocumentChange = (event) => {
    setDocumentFile(event.target.files[0]);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      if (!dateTime) return message.error("Please select a date and time");
      if (!documentFile) return message.error("Please upload a document");

      const formattedDateTime = dateTime.replace('T', ' ');

      const formData = new FormData();
      formData.append('document', documentFile); // ✅ Use 'document' instead of 'image'
      formData.append('date', formattedDateTime);
      formData.append('userId', userDoctorId);
      formData.append('doctorId', doctor._id);
      formData.append('userInfo', JSON.stringify(userdata));
      formData.append('doctorInfo', JSON.stringify(doctor));

      const res = await axios.post('http://localhost:8001/api/user/book-appointment', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        message.success(res.data.message);
        setShow(false);
        setDateTime('');
        setDocumentFile(null);
      } else {
        message.error(res.data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking Error:", error.response?.data || error.message);
      message.error("Something went wrong while booking");
    }
  };

  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Card.Body>
        <Card.Title>Dr. {doctor.fullName}</Card.Title>
        <Card.Text><b>Phone:</b> {doctor.phone}</Card.Text>
        <Card.Text><b>Address:</b> {doctor.address}</Card.Text>
        <Card.Text><b>Specialization:</b> {doctor.specialization}</Card.Text>
        <Card.Text><b>Experience:</b> {doctor.experience} Yrs</Card.Text>
        <Card.Text><b>Fees:</b> ₹{doctor.fees}</Card.Text>
        <Card.Text><b>Timing:</b> {doctor.timings[0]} - {doctor.timings[1]}</Card.Text>

        <Button variant="primary" onClick={handleShow}>Book Now</Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Book Appointment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleBook}>
            <Modal.Body>
              <Row className='mb-3'>
                <Col md={{ span: 10, offset: 1 }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date and Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      min={currentDate}
                      value={dateTime}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Document</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleDocumentChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Close</Button>
              <Button type="submit" variant="primary">Book</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default DoctorList;
