const User = require('../model/user.model')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')

// creating token payload to send it 
function createPayload(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        username: user.username
    }
}

// creating login token and send it without password
function authRessponsse(user) {
    const payload = createPayload(user)
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
            return res.status(400).json({ message: 'username, email or password are missing' })
        }

        const isUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        })

        if (isUser) {
            return res.status(400).json({ message: 'user with email or username already exists' })
        }

        const user = await User.create({
            email: email.toLowerCase().trim(),
            username: username.trim(),
            password
        })

        return res.status(201).json({
            sucess: true,
            message: 'User created',
            ...authRessponsse(user)
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
            return res.status(400).json({ message: 'email or password are missing' })
        }

        const cemail = email.toLowerCase()
        const user = await User.findOne({ email: cemail })

        if (!user) {
            return res.status(400).json({ message: 'invalid email or password' })
        }

        const isRight = await user.comparePassword(password)

        if (!isRight) {
            return res.status(400).json({ message: 'wronng password' })
        }

        return res.status(200).json({
            sucess: true,
            message: 'User logged in',
            ...authRessponsse(user)
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'internal server error' })
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
async function refresh(req, res) {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({ message: 'refresh token is missing' })
        }

        let decoded;

        try {
            decoded = await verifyRefreshToken(refreshToken)
        } catch (error) {
            return res.status(401).json({ message: 'refresh Token is invalid' })
        }

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        const accessToken = signAccessToken(createPayload(user))

        return res.status(200).json({
            success: true,
            msg: "Access token created",
            accessToken
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'internal server error' })
    }
}

module.exports = {
    signUp,
    login,
    getCurrentUser,
    refresh
}
