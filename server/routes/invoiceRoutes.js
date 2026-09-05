const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, payInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id/pay').patch(payInvoice);
router.route('/:id').put(updateInvoice).delete(deleteInvoice);

module.exports = router;
