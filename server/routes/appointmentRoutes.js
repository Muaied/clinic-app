const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id/status').patch(updateAppointmentStatus);
router.route('/:id').put(updateAppointment).delete(deleteAppointment);

module.exports = router;
