const docSchema = require("../schemas/docModel");
const userSchema = require("../schemas/userModel");
const appointmentSchema = require("../schemas/appointmentModel");

const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userSchema.find({});
    return res.status(200).send({
      message: "Users data list",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

// ✅ Updated with error logs
const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({});
    console.log("Fetched doctors:", docUsers);

    return res.status(200).send({
      message: "Doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console.error("getAllDoctorsControllers Error:", error.message);
    return res.status(500).send({ message: "Error fetching doctors", success: false, error: error.message });
  }
};

const getStatusApproveController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;
    const doctor = await docSchema.findOneAndUpdate({ _id: doctorId }, { status });

    const user = await userSchema.findOne({ _id: userid });
    const notification = user.notification;
    notification.push({
      type: "doctor-account-approved",
      message: `Your Doctor account has ${status}`,
      onClickPath: "/notification",
    });

    user.isdoctor = status === "approved" ? true : false;
    await user.save();
    await doctor.save();

    return res.status(201).send({
      message: "Successfully updated approve status of the doctor!",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Approval Error:", error.message);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const getStatusRejectController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;
    const doctor = await docSchema.findOneAndUpdate({ _id: doctorId }, { status });

    const user = await userSchema.findOne({ _id: userid });
    const notification = user.notification;
    notification.push({
      type: "doctor-account-approved",
      message: `Your Doctor account has ${status}`,
      onClickPath: "/notification",
    });

    await user.save();
    await doctor.save();

    return res.status(201).send({
      message: "Successfully updated reject status of the doctor!",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Rejection Error:", error.message);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const displayAllAppointmentController = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema.find();
    return res.status(200).send({
      success: true,
      message: "Successfully fetched all appointments",
      data: allAppointments,
    });
  } catch (error) {
    console.error("Appointment Fetch Error:", error.message);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

module.exports = {
  getAllDoctorsControllers,
  getAllUsersControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController,
};
