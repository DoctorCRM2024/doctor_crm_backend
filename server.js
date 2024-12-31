const express= require('express');
const app= express();
const cors= require('cors');
const path= require('path');
require('dotenv').config();

// middleware
app.use(express.json());
// app.use(cors());

// Configure CORS middleware
const corsOptions = {
    origin: 'http://localhost:5173', // Specify your frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  };
  app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

// Serve the uploads directory as a static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const port= process.env.PORT || 6000

app.get('/', (req, res)=>{
    res.send('Welcome to the Doctors-Appointment-Booking-CRM');
});

require('./db/DB');

// routes
app.use('/api/users', require('./routes/user'));
app.use('/api/hospitals', require('./routes/hospital.route'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/schedules', require('./routes/schedule'));

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})