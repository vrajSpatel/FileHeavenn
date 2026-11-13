const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// all auth routes
const authRoutes = require('./routes/auth.routes')
app.use('/api/auth', authRoutes)

const folderRoutes = require('./routes/folder.routes')
app.use('/api/folders', folderRoutes)

const fileRoute = require('./routes/file.routes')
app.use('/api/files', fileRoute)

const deleteRoutes = require('./routes/delete.routes')
app.use('/api/delete', deleteRoutes)

const shareRoutes = require('./routes/fileShare.routes')
app.use('/api/share', shareRoutes)

module.exports = app