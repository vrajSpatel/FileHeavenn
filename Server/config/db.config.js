const mongoose = require('mongoose')

async function connectDB() {
    const uri = process.env.MONGO_URI

    if (!uri) {
        console.error('MongoDB URI is in env')
        process.exit(1); // Exit without breaking server
    }

    try {
        const conn = await mongoose.connect(uri)
        console.log(`Database is connected`)
    } catch (err) {
        console.error('MongoDB connection failed')
        process.exit(1)
    }
}

module.exports = connectDB