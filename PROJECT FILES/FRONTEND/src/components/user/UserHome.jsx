import React, { useEffect, useState } from 'react';
import { Badge, Row } from 'antd';
import Notification from '../common/Notification';
import axios from 'axios';
import { Container } from 'react-bootstrap';

import ApplyDoctor from './ApplyDoctor';
import UserAppointments from './UserAppointments';
import DoctorList from './DoctorList';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';

const UserHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [userdata, setUserData] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState(null); // changed from 'userappointments' to null

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      setUserData(user);
    }
  };

  const getUserData = async () => {
    try {
      await axios.post('http://localhost:5000/api/user/getuserdata', {}, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem('token'),
        },
      });
    } catch (error) {
      console.error("User data fetch error:", error);
    }
  };

  const getDoctorData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/getalldoctorsu', {
        headers: {
          Authorization: "Bearer " + localStorage.getItem('token'),
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error("Doctor data fetch error:", error);
    }
  };

  useEffect(() => {
    getUser();
    getUserData();
    getDoctorData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <div className='main'>
      <div className="layout">
        <div className="sidebar">
          <div className="logo">
            <h2>MediCareBook</h2>
          </div>
          <div className="menu">
            <div className={`menu-items ${activeMenuItem === null ? 'active' : ''}`} onClick={() => handleMenuItemClick(null)}>
              <HomeIcon className='icon' /> <span>Home</span>
            </div>
            <div className={`menu-items ${activeMenuItem === 'userappointments' ? 'active' : ''}`} onClick={() => handleMenuItemClick('userappointments')}>
              <CalendarMonthIcon className='icon' /> <span>Appointments</span>
            </div>
            {userdata?.isdoctor !== true && (
              <div className={`menu-items ${activeMenuItem === 'applyDoctor' ? 'active' : ''}`} onClick={() => handleMenuItemClick('applyDoctor')}>
                <MedicationIcon className='icon' /> <span>Apply Doctor</span>
              </div>
            )}
            <div className="menu-items" onClick={logout}>
              <LogoutIcon className='icon' /> <span>Logout</span>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="header">
            <div className="header-content">
              <Badge className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`} onClick={() => handleMenuItemClick('notification')} count={userdata?.notification?.length || 0}>
                <NotificationsIcon className="icon" />
              </Badge>
              <h3>{userdata?.isdoctor ? "Dr. " : ""}{userdata?.fullName || "User"}</h3>
            </div>
          </div>

          <div className="body">
            {activeMenuItem === 'applyDoctor' && <ApplyDoctor userId={userdata?._id} />}
            {activeMenuItem === 'notification' && <Notification />}
            {activeMenuItem === 'userappointments' && <UserAppointments />}
            {activeMenuItem === null && (
              <Container>
                <h2 className="text-center p-2">Home</h2>
                {userdata?.isdoctor !== true && (
                  <Row>
                    {doctors.map((doctor, i) => (
                      <DoctorList
                        userDoctorId={doctor.userId}
                        doctor={doctor}
                        userdata={userdata}
                        key={i}
                      />
                    ))}
                  </Row>
                )}
              </Container>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
