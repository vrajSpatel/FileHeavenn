const User = require('../model/user.model')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')

// build token payload
function buildTokenPayload(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        username: user.username
    }
}

// create login token and send it without password
function buildAuthResponse(user) {
    const payload = buildTokenPayload(user)
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ id: payload.id })

    return {
        accessToken,
        refreshToken,
        user: user.toSafeObject()
    }
}


// sign up logic and also return jwt
async function signUp(req, res) {
    try {
        const { email, username, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email or password are missing' })
        }

        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        })

        if (existingUser) {
            return res.status(400).json({ message: 'User with email or username already exists' })
        }

        const user = await User.create({
            email: email.toLowerCase().trim(),
            username: username.trim(),
            password
        })

        return res.status(201).json({
            sucess: true,
            message: 'User created',
            ...buildAuthResponse(user)
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// login 
async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email or password are missing' })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const passCheck = await user.comparePassword(password)

        if (!passCheck) {
            return res.status(400).json({ message: 'wrong password' })
        }

        return res.status(200).json({
            sucess: true,
            message: 'User logged in',
            ...buildAuthResponse(user)
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// return authenticated user
async function getCurrentUser(req, res) {
    return res.status(200).json({
        success: true,
        user: req.user.toSafeObject(),
    })
}

// give new access token using refresh token
async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is missing' })
        }

        let decoded;

        try {
            decoded = await verifyRefreshToken(refreshToken)
        } catch (error) {
            return res.status(401).json({ message: 'Refresh Token is invalid' })
        }

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const accessToken = signAccessToken(buildTokenPayload(user))

        return res.status(200).json({
            success: true,
            msg: "Access token created",
            accessToken
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = {
    signUp,
    login,
    getCurrentUser,
    refresh
}