const User = require('../model/user.model');
const { verifyAccessToken } = require('../utils/jwt');

async function authMiddleware(req, res, next) {
    try {
        const authHeadwer = req.headers.authorization || ''
        const token = authHeadwer.startsWith('Bearer') ? authHeadwer.split(' ')[1] : null

        if (!token) {
            return res.status(401).json({ message: 'No token' })
        }

        const decod = verifyAccessToken(token)
        const user = await User.findById(decod.id)

        if (!user) {
            return res.status(401).json({ message: 'user not found' })
        }

        req.user = user
        next()

    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: 'error while authrizing' });
    }
}

module.exports = { authMiddleware };