require('dotenv').config()

const app = require('./app')
const connectDB = require('./config/db.config')

const PORT = process.env.PORT

const start = async () => {
    await connectDB()

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

start()