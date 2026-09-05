const express = require('express');
const router = express.Router();
const { getDoctors, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getDoctors).post(authorize('Admin'), createDoctor);
router.route('/:id').put(authorize('Admin'), updateDoctor).delete(authorize('Admin'), deleteDoctor);

module.exports = router;
