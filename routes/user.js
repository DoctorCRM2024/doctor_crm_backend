const express = require('express');
const { addUser, updateUser, deleteUser, getAllUsers, login, refreshAccessToken, logout } = require('../controllers/user.controller');
const router = express.Router();

router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);


router.post('/add', addUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/', getAllUsers);

module.exports = router;
