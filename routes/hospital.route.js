const express= require('express');
const router= express.Router();
const { addHospital, updateHospital, deleteHospital, getAllHospitals, getHospitalDoneSchedules, exportHospitalsToExcel, getTotalPaymentSummary, getTotalPaymentSummaryByDate }= require('../controllers/hospital.controller');
const authenticateToken= require('../middleware/auth.middleware');

router.post('/add', authenticateToken, addHospital);
router.put('/update/:id', authenticateToken, updateHospital);
router.delete('/delete/:id', authenticateToken, deleteHospital);
router.get('/', authenticateToken, getAllHospitals);

router.get('/done-schedules',authenticateToken, getHospitalDoneSchedules);

router.get('/export', exportHospitalsToExcel);  // exporting hospitals to excel

router.get('/total-payments',authenticateToken, getTotalPaymentSummary) // payment summary
router.get('/total-payments/datewise',authenticateToken, getTotalPaymentSummaryByDate) // datewise


module.exports= router;