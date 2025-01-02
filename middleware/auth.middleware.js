// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// require('dotenv').config();

// const authenticateToken = (req, res, next) => {
//     const token = req.header('Authorization')?.split(' ')[1];  // Assuming the token is sent as "Bearer <token>"

//     if (!token) {
//         return res.status(401).json({ message: 'Access Denied. No token provided.' });
//     }

//     try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         console.log('Decoded token:', decoded);  
//         req.user = decoded;

//         // Ensure that the role exists
//         if (!req.user.role) {
//             return res.status(400).json({ message: 'Invalid token: missing role' });
//         }

//         next();
//     } catch (error) {
//         return res.status(403).json({ message: 'Invalid token', error: error.message });
//     }
// };

// module.exports = authenticateToken;

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token:', decoded); // Log the decoded token
        req.user = decoded; // Attach the decoded data to req.user

        if (!req.user.id) { // Ensure that 'id' exists in the token
            return res.status(400).json({ message: 'Invalid token: missing id field' });
        }

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid token', error: error.message });
    }
};

module.exports = authenticateToken;
