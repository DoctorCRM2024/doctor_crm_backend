const express = require('express');
const router = express.Router();
const authenticateToken= require('../middleware/auth.middleware');
const { createSchedule, updateSchedule, deleteSchedule, getAllSchedules, 
      toggleScheduleStatus, transferAppointment, getUpcomingSchedules, 
      getDoneSchedules, getTransferredAppointments, retakeTransferredAppointment, 
      getSchedulesByDateRange, getTransferredAppointmentsByDateRange, updatePaymentDetails, exportSchedulesToExcel , getSchedulesByUserId} = require('../controllers/schedule.controller');


router.post('/create', authenticateToken, createSchedule);
router.put('/update/:scheduleId', authenticateToken,  updateSchedule);
router.delete('/delete/:scheduleId', authenticateToken, deleteSchedule)
router.get('/', authenticateToken, getAllSchedules)
router.get('/date-range',authenticateToken, getSchedulesByDateRange); // fetch schedules date wise

router.put("/:scheduleId/status", toggleScheduleStatus);  // Toggle status (Done or Upcoming) / Not Available
router.put('/:scheduleId',authenticateToken, transferAppointment);  // Route for transferring an appointment (update doctor or hospital)
router.get('/transferred',authenticateToken, getTransferredAppointments);  // fetching transferred appointments
router.get('/transferred/date-range', authenticateToken, getTransferredAppointmentsByDateRange);  // fetching transferred appointments by date range
router.put('/retake/:scheduleId', authenticateToken, retakeTransferredAppointment);  // retake transferred appointments


router.get('/upcoming-status',authenticateToken, getUpcomingSchedules);  // Route to fetch all upcoming schedules
router.get('/done-status', authenticateToken, getDoneSchedules);     // Route to fetch all done schedules
router.put('/:scheduleId/payment', authenticateToken, updatePaymentDetails);

router.get('/export-excel', exportSchedulesToExcel);  

router.get('/transactions/:userId', getSchedulesByUserId);

module.exports = router;

