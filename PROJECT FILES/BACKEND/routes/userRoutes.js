const express = require("express");
const multer = require("multer");

const {
  registerController,
  loginController,
  authController,
  docController,
  deleteallnotificationController,
  getallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
} = require("../controllers/userC");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/getuserdata", authMiddleware, authController);
router.post("/registerdoc", authMiddleware, docController);
router.get("/getalldoctorsu", authMiddleware, getAllDoctorsControllers);

router.post("/getappointment", upload.single("image"), authMiddleware, appointmentController);
router.post("/getuserappointments", authMiddleware, getAllUserAppointments); // FIXED from GET to POST

router.post("/getallnotification", authMiddleware, getallnotificationController);
router.post("/deleteallnotification", authMiddleware, deleteallnotificationController);
router.get("/getDocsforuser", authMiddleware, getDocsController);

module.exports = router;
