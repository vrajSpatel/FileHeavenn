const express = require('express')
const router = express.Router()

const { signUp,
    login,
    getCurrentUser,
    refresh } = require('../controller/auth.controller')

const { authMiddleware } = require('../middleware/authMiddleware')

router.post('/register', signUp)
router.post('/login', login)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/refresh', refresh)

module.exports = router