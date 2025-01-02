const Hospital = require('../models/hospital.model'); 
const User= require('../models/user.model');
const moment= require('moment')
const Schedule= require('../models/schedule.model')
const ExcelJS= require('exceljs');

// Add a new hospital
const addHospital = async (req, res) => {
    try {

        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;
        
        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the hospital already exists (based on email)
        const existingHospital = await Hospital.findOne({ hospitalEmailId });
        if (existingHospital) {
            return res.status(400).json({ message: 'Hospital with this email already exists.' });
        }

        const newHospital = new Hospital({
            hospitalName,
            hospitalEmailId,
            hospitalPhoneNo,
            adminFullName,
            adminPhoneNo,
        });

        await newHospital.save();

        return res.status(201).json({ message: 'Hospital added successfully.', hospital: newHospital });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Update an existing hospital
const updateHospital = async (req, res) => {
    try {

        // // Check if the user has the role 'Doctor'
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const { id } = req.params;
        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;

        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find hospital by ID and update
        const updatedHospital = await Hospital.findByIdAndUpdate(
            id,
            {
                hospitalName,
                hospitalEmailId,
                hospitalPhoneNo,
                adminFullName,
                adminPhoneNo,
            },
            { new: true } 
        );

        if (!updatedHospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        return res.status(200).json({ message: 'Hospital updated successfully.', hospital: updatedHospital });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Delete a hospital
const deleteHospital = async (req, res) => {
  try {

    
    //  // Check if the user has the role 'Doctor'
    // if (req.user.role !== 'Doctor') {
    //         return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
    // }

      const { id } = req.params; // Hospital ID from the URL

      // Find and delete the hospital by ID
      const deletedHospital = await Hospital.findByIdAndDelete(id);

      if (!deletedHospital) {
          return res.status(404).json({ message: 'Hospital not found.' });
      }

      return res.status(200).json({ message: 'Hospital deleted successfully.', hospital: deletedHospital });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};

// const getAllHospitals = async (req, res) => {
//     try {
//         // Fetch all hospitals with the total payment amount of their schedules and the count of 'Done' schedules
//         const hospitals = await Hospital.aggregate([
//             {
//                 $lookup: {
//                     from: 'schedules', // Name of the Schedule collection in MongoDB
//                     localField: '_id',  // The hospital's ID field
//                     foreignField: 'hospital', // The 'hospital' field in the Schedule collection
//                     as: 'schedules',
//                 },
//             },
//             {
//                 $addFields: {
//                     totalSchedulePayment: { $sum: '$schedules.paymentAmount' }, // Total payment amount for all schedules
//                     totalAmountReceived: { $sum: '$schedules.amountReceived' }, // Total received amount for all schedules
//                     // Count the 'Done' schedules
//                     doneScheduleCount: {
//                         $size: {
//                             $filter: {
//                                 input: '$schedules',
//                                 as: 'schedule',
//                                 cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
//                             },
//                         },
//                     },
//                 },
//             },
//             {
//                 $addFields: {
//                     // Calculate the remaining due amount
//                     totalDueAmount: { $subtract: ['$totalSchedulePayment', '$totalAmountReceived'] },
//                 },
//             },
//             {
//                 $project: {
//                     schedules: 0, // Exclude the schedules field from the response
//                 },
//             },
//         ]);

//         if (!hospitals.length) {
//             return res.status(404).json({ message: 'No hospitals found.' });
//         }

//         return res.status(200).json({
//             message: 'Hospitals retrieved successfully.',
//             hospitals,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'An error occurred.', error: error.message });
//     }
// };



const getAllHospitals = async (req, res) => {
    try {
        let hospitals; 

        // Check if the user has the role 'Admin'
        if (req.user.role !== 'Admin') {
            // Fetch hospitals without transaction details for normal users
            hospitals = await Hospital.aggregate([
                {
                    $lookup: {
                        from: 'schedules', // Name of the Schedule collection in MongoDB
                        localField: '_id',  // The hospital's ID field
                        foreignField: 'hospital', // The 'hospital' field in the Schedule collection
                        as: 'schedules',
                    },
                },
                {
                    $addFields: {
                        doneScheduleCount: {
                            $size: {
                                $filter: {
                                    input: '$schedules',
                                    as: 'schedule',
                                    cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        schedules: 0, // Exclude the schedules field from the response
                        totalSchedulePayment: 0, // Exclude total payment details
                        totalAmountReceived: 0, // Exclude total received amount
                        totalDueAmount: 0, // Exclude due amount
                    },
                },
            ]);
        } else {
            // Fetch all hospitals with transaction details for admin users
            hospitals = await Hospital.aggregate([
                {
                    $lookup: {
                        from: 'schedules', // Name of the Schedule collection in MongoDB
                        localField: '_id',  // The hospital's ID field
                        foreignField: 'hospital', // The 'hospital' field in the Schedule collection
                        as: 'schedules',
                    },
                },
                {
                    $addFields: {
                        totalSchedulePayment: { $sum: '$schedules.paymentAmount' }, // Total payment amount for all schedules
                        totalAmountReceived: { $sum: '$schedules.amountReceived' }, // Total received amount for all schedules
                        doneScheduleCount: {
                            $size: {
                                $filter: {
                                    input: '$schedules',
                                    as: 'schedule',
                                    cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        totalDueAmount: { $subtract: ['$totalSchedulePayment', '$totalAmountReceived'] }, // Calculate remaining due amount
                    },
                },
                {
                    $project: {
                        schedules: 0, // Exclude the schedules field from the response
                    },
                },
            ]);
        }

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found.' });
        }

        // Format response as requested
        const formattedHospitals = hospitals.map(hospital => ({
            _id: hospital._id,
            hospitalName: hospital.hospitalName,
            hospitalEmailId: hospital.hospitalEmailId,
            hospitalPhoneNo: hospital.hospitalPhoneNo,
            adminFullName: hospital.adminFullName,
            adminPhoneNo: hospital.adminPhoneNo,
            createdAt: hospital.createdAt,
            updatedAt: hospital.updatedAt,
            __v: hospital.__v,
            doneScheduleCount: hospital.doneScheduleCount,
            ...(req.user.role === 'Admin' ? {
                totalDueAmount: hospital.totalDueAmount,
                totalSchedulePayment: hospital.totalSchedulePayment,
                totalAmountReceived: hospital.totalAmountReceived,
            } : {}),
        }));

        return res.status(200).json({
            message: "Hospitals retrieved successfully.",
            hospitals: formattedHospitals,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};



const exportHospitalsToExcel = async (req, res) => {
    try {
        // Fetch all hospitals with the doneScheduleCount
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection
                    localField: '_id',  // The hospital's ID
                    foreignField: 'hospital', // The 'hospital' field in the Schedule collection
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    // Count the 'Done' schedules
                    doneScheduleCount: {
                        $size: {
                            $filter: {
                                input: '$schedules',
                                as: 'schedule',
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0, // Exclude _id if not needed, or include 1 to keep it
                    hospitalName: 1,
                    hospitalEmailId: 1,
                    hospitalPhoneNo: 1,
                    adminFullName: 1,
                    adminPhoneNo: 1,
                    createdAt: 1,
                    doneScheduleCount: 1, // Include doneScheduleCount explicitly
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found to export.' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Hospitals');

        // Define columns for the worksheet
        worksheet.columns = [
            { header: 'Hospital Name', key: 'hospitalName', width: 30 },
            { header: 'Hospital Email ID', key: 'hospitalEmailId', width: 30 },
            { header: 'Hospital Phone No', key: 'hospitalPhoneNo', width: 20 },
            { header: 'Admin Full Name', key: 'adminFullName', width: 25 },
            { header: 'Admin Phone No', key: 'adminPhoneNo', width: 20 },
            { header: 'Done Schedule Count', key: 'doneScheduleCount', width: 25 },
            { header: 'Created At', key: 'createdAt', width: 25 },
        ];

        // Add rows to the worksheet
        hospitals.forEach((hospital) => {
            worksheet.addRow({
                hospitalName: hospital.hospitalName,
                hospitalEmailId: hospital.hospitalEmailId,
                hospitalPhoneNo: hospital.hospitalPhoneNo,
                adminFullName: hospital.adminFullName,
                adminPhoneNo: hospital.adminPhoneNo,
                doneScheduleCount: hospital.doneScheduleCount || 0,
                createdAt: hospital.createdAt ? hospital.createdAt.toISOString() : 'N/A',
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Auto-filter and freeze header row
        worksheet.autoFilter = {
            from: 'A1',
            to: worksheet.columns[worksheet.columns.length - 1].letter + '1',
        };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Write workbook to a buffer and send it as a response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=hospitals.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting hospitals to Excel:', error);
        res.status(500).json({ message: 'An error occurred while exporting data.', error: error.message });
    }
};



const getHospitalDoneSchedules = async (req, res) => {
    try {
        // Fetch hospitals and count the 'Done' schedules for each hospital
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection
                    localField: '_id', // The hospital's ID
                    foreignField: 'hospital', // The hospital field in the Schedule collection
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    // Count the 'Done' schedules
                    doneScheduleCount: {
                        $size: {
                            $filter: {
                                input: '$schedules',
                                as: 'schedule',
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0, // Exclude _id if not needed, or include 1 to keep it
                    hospitalName: 1,
                    hospitalEmailId: 1,
                    hospitalPhoneNo: 1,
                    adminFullName: 1,
                    adminPhoneNo: 1,
                    createdAt: 1,
                    doneScheduleCount: 1, // Include doneScheduleCount explicitly
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found.' });
        }

        return res.status(200).json({
            message: 'Hospitals with Done schedules retrieved successfully.',
            hospitals,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Get total payment summary by userId (Doctor or Patient)
const getTotalPaymentSummary = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from URL parameters

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Initialize a variable to store the total payment
        let totalAmountReceived = 0;
        let totalDueAmount = 0;
        let totalPayment = 0;

        // Find the schedules based on whether the user is a doctor or a patient
        let schedules;
        if (user.role === 'Doctor') {
            // If the user is a doctor, fetch all schedules where the doctor is assigned
            schedules = await Schedule.find({ doctor: userId })
                .populate('doctor', 'fullName')  // Populate doctor's fullName
                .populate('hospital', 'hospitalName');  // Populate hospital's hospitalName
        } else {
            // If the user is a patient, fetch all schedules where the patient is assigned
            schedules = await Schedule.find({ patientName: user.name })
                .populate('doctor', 'fullName')  // Populate doctor's fullName
                .populate('hospital', 'hospitalName');  // Populate hospital's hospitalName
        }

        // If no schedules are found
        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found for this user.' });
        }

        // Format the schedules response and calculate total amounts
        const formattedSchedules = schedules.map(schedule => {
            const doctorName = schedule.doctor ? schedule.doctor.fullName : 'No doctor assigned';
            const hospitalName = schedule.hospital ? schedule.hospital.hospitalName : 'No hospital assigned';

            // Calculate due amount
            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);
            const paymentStatus = dueAmount <= 0 ? 'Done' : 'Pending';

            // Accumulate total amounts
            totalAmountReceived += schedule.amountReceived || 0;
            totalDueAmount += dueAmount;
            totalPayment += schedule.paymentAmount;

            return {
                _id: schedule._id,
                doctorName: doctorName,
                hospitalName: hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus: paymentStatus,
                amountReceived: schedule.amountReceived,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paymentMethod: schedule.paymentMethod || 'N/A',
                documentProofNo: schedule.documentProofNo || 'N/A',
                googleEventId: schedule.googleEventId || 'N/A',
            };
        });

        // Return the total payment summary
        res.status(200).json({
            message: `Total payment summary fetched successfully for ${user.name}`,
            totalPaymentSummary: {
                totalAmountReceived: totalAmountReceived,
                totalDueAmount: totalDueAmount,
                totalPayment: totalPayment,
            },
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching total payment summary:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get total payment summary by userId and date range
const getTotalPaymentSummaryByDate = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from URL parameters
        const { startDate, endDate } = req.query; // Extract date range from query parameters

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Validate date inputs
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide both startDate and endDate.' });
        }

        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the end of the day

        // Initialize variables to store total payments
        let totalAmountReceived = 0;
        let totalDueAmount = 0;
        let totalPayment = 0;

        // Find schedules within the date range based on user role
        let schedules;
        if (user.role === 'Doctor') {
            schedules = await Schedule.find({
                doctor: userId,
                startDateTime: { $gte: start, $lte: end },
            })
                .populate('doctor', 'fullName')
                .populate('hospital', 'hospitalName');
        } else {
            schedules = await Schedule.find({
                patientName: user.name,
                startDateTime: { $gte: start, $lte: end },
            })
                .populate('doctor', 'fullName')
                .populate('hospital', 'hospitalName');
        }

        // If no schedules are found
        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found for this user in the given date range.' });
        }

        // Format schedules response and calculate total amounts
        const formattedSchedules = schedules.map(schedule => {
            const doctorName = schedule.doctor ? schedule.doctor.fullName : 'No doctor assigned';
            const hospitalName = schedule.hospital ? schedule.hospital.hospitalName : 'No hospital assigned';

            // Calculate due amount
            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);
            const paymentStatus = dueAmount <= 0 ? 'Done' : 'Pending';

            // Accumulate total amounts
            totalAmountReceived += schedule.amountReceived || 0;
            totalDueAmount += dueAmount;
            totalPayment += schedule.paymentAmount;

            return {
                _id: schedule._id,
                doctorName: doctorName,
                hospitalName: hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus: paymentStatus,
                amountReceived: schedule.amountReceived,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paymentMethod: schedule.paymentMethod || 'N/A',
                documentProofNo: schedule.documentProofNo || 'N/A',
                googleEventId: schedule.googleEventId || 'N/A',
            };
        });

        // Return the total payment summary by date
        res.status(200).json({
            message: `Total payment summary fetched successfully for ${user.name} between ${startDate} and ${endDate}`,
            totalPaymentSummary: {
                totalAmountReceived: totalAmountReceived,
                totalDueAmount: totalDueAmount,
                totalPayment: totalPayment,
            },
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching total payment summary by date:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



module.exports = {
    addHospital,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    getHospitalDoneSchedules,
    exportHospitalsToExcel,
    getTotalPaymentSummary,
    getTotalPaymentSummaryByDate
};
