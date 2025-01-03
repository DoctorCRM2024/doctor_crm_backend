const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User (doctor)
      ref: 'User',
      required: true,
    },
    createdByDoctor: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the doctor who created the schedule
      ref: 'User',
      required: true, // If required, set to `true`. Otherwise, set to `false`.
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Hospital
      ref: 'Hospital',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    surgeryType: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    startDateTime : {
      type: Date,
      required: true,
    },
    endDateTime : {
      type: Date,
      required: true,
    },
    paymentReminderDate : {
      type: Date,
      required: true,
    },
    status: { type: String, enum:['Upcoming', 'Done', 'Not Available'], default: 'Upcoming' },
    isTransferred: { type: Boolean, default: false }, 

    paymentAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String, enum: ['Pending', 'Done'], default: 'Pending',
      required: true
    },
    amountReceived:{
      type: Number,
      // required: true
    },
    paymentMethod:{
      type: String,
      // required: true
    },
    documentProofNo: {
      type: String,
      // required: true
    },
    googleEventId: {
      type: String
    }

  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model('Schedule', scheduleSchema);
