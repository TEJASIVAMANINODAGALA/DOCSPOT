import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/common/Home";
import Login from "./components/common/Login";
import Register from "./components/common/Register";
import UserHome from "./components/user/UserHome";
import AdminHome from "./components/admin/AdminHome";
import UserAppointments from "./components/user/UserAppointments";

function App() {
  const user = JSON.parse(localStorage.getItem("userData"));
  const userLoggedIn = !!user;

  return (
    <div className="App">
      <Router>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {userLoggedIn && user.type === "admin" && (
              <Route path="/adminHome" element={<AdminHome />} />
            )}

            {userLoggedIn && user.type === "user" && (
              <>
                <Route path="/userHome" element={<UserHome />} />
                <Route path="/userHome/userAppointments/:doctorId" element={<UserAppointments />} />
              </>
            )}

            {/* Optional fallback route */}
            <Route path="*" element={<h1 style={{ textAlign: "center" }}>404 Page Not Found</h1>} />
          </Routes>
        </div>

        <footer className="bg-light text-center text-lg-start">
          <div className="text-center p-3">© 2023 Copyright: MediCareBook</div>
        </footer>
      </Router>
    </div>
  );
}

export default App;
