const express = require('express');
const router = express.Router();
const { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getMedicalRecords).post(createMedicalRecord);
router.route('/:id').put(updateMedicalRecord).delete(deleteMedicalRecord);

module.exports = router;
