const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User (doctor)
      ref: 'User',
      required: true,
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
    status: { type: String, enum:['Upcoming', 'Done', 'Not Available'], default: 'Upcoming' } 
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model('Schedule', scheduleSchema);