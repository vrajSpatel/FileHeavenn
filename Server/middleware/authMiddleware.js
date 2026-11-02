const User = require('../model/user.model');
const { verifyAccessToken } = require('../utils/jwt');

async function authMiddleware(req, res, next) {
    try {
        const authHeadwer = req.headers.authorization || ''
        const token = authHeadwer.splitWith('Bearer') ? authHeadwer.split(' ')[1] : null

        if (!token) {
            return res.status(401).json({ message: 'No token' })
        }

        const decod = verifyAccessToken(token)
        const user = await User.findById(decod.id)

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user.toSafeObject()
        next()

    } catch (err) {
        return res.status(401).json({ message: 'Not authorized' });
    }
}

module.exports = { authMiddleware };