const Hospital = require('../models/hospital.model'); 
const User= require('../models/user.model');
const moment= require('moment')
const Schedule= require('../models/schedule.model')
const ExcelJS= require('exceljs');
const { Types } = require('mongoose');

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
        console.log(req.user.id, req.user.id )
        // if (req.user.role !== 'Admin') {
        //     let doctor_id = new Types.ObjectId(req.user.id);
        //     // Fetch hospitals for a doctor with filtered schedule details
        //     hospitals = await Hospital.aggregate([
        //         {
        //             $lookup: {
        //                 from: 'schedules', // Name of the Schedule collection
        //                 let: { hospitalId: '$_id' }, // Pass the hospital ID
        //                 pipeline: [
        //                     {
        //                         $match: {
        //                             $expr: {
        //                                 $and: [
        //                                     { $eq: ['$hospital', '$$hospitalId'] }, // Match hospital
        //                                     { $eq: ['$doctor', doctor_id] } // Match doctor
        //                                 ]
        //                             }
        //                         }
        //                     }
        //                 ],
        //                 as: 'filteredSchedules' // Only schedules for the specific doctor
        //             }
        //         },
        //         {
        //             $addFields: {
        //                 doneScheduleCount: {
        //                     $size: {
        //                         $filter: {
        //                             input: '$filteredSchedules',
        //                             as: 'schedule',
        //                             cond: { $eq: ['$$schedule.status', 'Done'] } // Count 'Done' schedules
        //                         }
        //                     }
        //                 },
        //                 totalSchedulePayment: {
        //                     $sum: '$filteredSchedules.paymentAmount' // Sum of paymentAmount for the doctor
        //                 },
        //                 totalAmountReceived: {
        //                     $sum: '$filteredSchedules.amountReceived' // Sum of amountReceived for the doctor
        //                 },
        //                 totalDueAmount: {
        //                     $subtract: ['$totalSchedulePayment', '$totalAmountReceived'] // Calculate pending amount
        //                 }
        //             }
        //         },
        //         {
        //             $project: {
        //                 filteredSchedules: 0 // Exclude schedules from final output
        //             }
        //         }
        //     ]
        //     );

        // Fetch all hospitals with full transaction details for admin
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
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Count schedules with 'Done' status
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
            totalDueAmount: hospital.totalDueAmount,
            totalSchedulePayment: hospital.totalSchedulePayment,
            totalAmountReceived: hospital.totalAmountReceived,
        }));

        return res.status(200).json({
            message: "Hospitals retrieved successfully.",
            hospitals: formattedHospitals,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
}


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


const getTotalPaymentSummary = async (req, res) => {
    try {
        const userId = req.user.id; // Make sure the field is '_id' or 'id' based on token
        const userRole = req.user.role;

        console.log('User ID:', userId); // Log the user ID to verify it's set correctly
        console.log('User Role:', userRole); // Log the user role

        let totalAmountReceived = 0;
        let totalDueAmount = 0;
        let totalPayment = 0;

        let schedules;

        // Check user role and modify the query accordingly
        if (userRole === 'Admin') {
            // Admin can see all schedules (doctor and patient)
            schedules = await Schedule.find({})
            .populate('doctor', 'fullName')
            .populate('hospital', 'hospitalName');
        } else if (userRole === 'Doctor') {
            // Doctor can only see their own schedules (doctor)
            schedules = await Schedule.find({ doctor: userId })
            .populate('doctor', 'fullName')
            .populate('hospital', 'hospitalName');
        } else {
            return res.status(403).json({ message: "Access denied. Only Admin and Doctor roles are allowed." });
        }

        // Log the schedules to verify if they are fetched
        console.log('Schedules:', schedules);

        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found for the user.' });
        }

        // Format schedules and calculate totals
        const formattedSchedules = schedules.map(schedule => {
            const doctorName = schedule.doctor?.fullName || 'No doctor assigned';
            const hospitalName = schedule.hospital?.hospitalName || 'No hospital assigned';

            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);
            const paymentStatus = dueAmount <= 0 ? 'Done' : 'Pending';

            // Accumulate total amounts
            totalAmountReceived += schedule.amountReceived || 0;
            totalDueAmount += dueAmount > 0 ? dueAmount : 0;
            totalPayment += schedule.paymentAmount;

            return {
                _id: schedule._id,
                doctorName,
                hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus,
                amountReceived: schedule.amountReceived || 0,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paymentMethod: schedule.paymentMethod || 'N/A',
                documentProofNo: schedule.documentProofNo || 'N/A',
                googleEventId: schedule.googleEventId || 'N/A',
            };
        });

        // Send the response with the formatted data
        res.status(200).json({
            message: `Schedules fetched successfully for ${req.user.fullName}`,
            totalPaymentSummary: {
                totalAmountReceived,
                totalDueAmount,
                totalPayment
            },
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching payment summary:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



// Get total payment summary for all users by date range
const getTotalPaymentSummaryByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Extract date range from query parameters

        // Validate date inputs
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide both startDate and endDate.' });
        }

        // Parse and format dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the end of the day

        let totalAmountReceived = 0;
        let totalDueAmount = 0;
        let totalPayment = 0;

        // Fetch schedules within the date range
        const schedules = await Schedule.find({
            startDateTime: { $gte: start, $lte: end },
        })
            .populate('doctor', 'fullName')
            .populate('hospital', 'hospitalName');

        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found in the given date range.' });
        }

        // Format schedules and calculate totals
        const formattedSchedules = schedules.map(schedule => {
            const doctorName = schedule.doctor?.fullName || 'No doctor assigned';
            const hospitalName = schedule.hospital?.hospitalName || 'No hospital assigned';

            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);
            const paymentStatus = dueAmount <= 0 ? 'Done' : 'Pending';

            // Accumulate total amounts
            totalAmountReceived += schedule.amountReceived || 0;
            totalDueAmount += dueAmount;
            totalPayment += schedule.paymentAmount;

            return {
                _id: schedule._id,
                doctorName,
                hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus,
                amountReceived: schedule.amountReceived,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paymentMethod: schedule.paymentMethod || 'N/A',
                documentProofNo: schedule.documentProofNo || 'N/A',
                googleEventId: schedule.googleEventId || 'N/A',
            };
        });

        res.status(200).json({
            message: `Total payment summary fetched successfully for all users between ${startDate} and ${endDate}`,
            totalPaymentSummary: {
                totalAmountReceived,
                totalDueAmount,
                totalPayment,
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
