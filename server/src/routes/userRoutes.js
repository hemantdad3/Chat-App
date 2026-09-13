const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users
router.get('/', protect, getUsers);

module.exports = router;
