const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");

// Register Controller
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res.status(200).send({ message: "User already exists", success: false });
    }
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    await new userSchema(req.body).save();
    res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// Login Controller
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) return res.status(200).send({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(200).send({ message: "Invalid credentials", success: false });

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    user.password = undefined;
    res.status(200).send({ message: "Login successful", success: true, token, userData: user });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// Auth Controller
const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    if (!user) return res.status(200).send({ message: "User not found", success: false });
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    res.status(500).send({ message: "Auth error", success: false, error });
  }
};

// Doctor Registration
const docController = async (req, res) => {
  try {
    const { doctor, userId } = req.body;
    const newDoctor = new docSchema({ ...doctor, userId: userId.toString(), status: "pending" });
    await newDoctor.save();

    const adminUser = await userSchema.findOne({ type: "admin" });
    if (!adminUser) return res.status(404).send({ success: false, message: "Admin not found" });

    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.fullName} has applied for doctor registration`,
      data: {
        userId: newDoctor._id,
        fullName: newDoctor.fullName,
        onClickPath: "/admin/doctors",
      },
    });

    await adminUser.save();

    res.status(201).send({ success: true, message: "Doctor application submitted" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error while applying", error: error.message });
  }
};

// Notifications
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.seennotification.push(...user.notification);
    user.notification = [];
    await user.save();
    res.status(200).send({ success: true, message: "Marked all as read", data: user });
  } catch (error) {
    res.status(500).send({ message: "Error", success: false, error });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    await user.save();
    res.status(200).send({ success: true, message: "Notifications cleared", data: user });
  } catch (error) {
    res.status(500).send({ message: "Error", success: false, error });
  }
};

// Get All Approved Doctors
const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await docSchema.find({ status: "approved" });
    res.status(200).send({ success: true, message: "Approved doctors", data: doctors });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching doctors", error });
  }
};

// Book Appointment with document upload
const appointmentController = async (req, res) => {
  try {
    const userInfo = JSON.parse(req.body.userInfo);
    const doctorInfo = JSON.parse(req.body.doctorInfo);

    const documentData = req.file ? {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    } : null;

    const appointment = new appointmentSchema({
      userId: req.body.userId,
      doctorId: req.body.doctorId,
      userInfo,
      doctorInfo,
      date: req.body.date,
      document: documentData,
      status: "pending",
    });

    await appointment.save();

    // Save uploaded document in user profile
    if (documentData) {
      await userSchema.updateOne(
        { _id: req.body.userId },
        { $push: { documents: documentData } }
      );
    }

    const doctorUser = await userSchema.findOne({ _id: doctorInfo.userId });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "New Appointment",
        message: `Appointment request from ${userInfo.fullName}`,
      });
      await doctorUser.save();
    }

    res.status(200).send({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Booking failed", error: error.message });
  }
};

// Get All User Appointments
const getAllUserAppointments = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema.find({ userId: req.body.userId });
    const doctorIds = allAppointments.map((a) => a.doctorId);

    const doctors = await docSchema.find({ _id: { $in: doctorIds } });

    const appointmentsWithDoctor = allAppointments.map((appointment) => {
      const doctor = doctors.find(doc => doc._id.toString() === appointment.doctorId.toString());
      return {
        ...appointment.toObject(),
        docName: doctor ? doctor.fullName : "Unknown",
      };
    });

    res.status(200).send({ success: true, message: "Appointments retrieved", data: appointmentsWithDoctor });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching appointments", error });
  }
};

// Get Uploaded Docs
const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const allDocs = user.documents || [];
    res.status(200).send({ success: true, message: "User docs", data: allDocs });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching docs", error: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
};
