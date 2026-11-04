const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/databasecheck', (req, res) => {
    // readyState 1 means connected to dataset
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
        success: true,
        db: dbConnected ? 'connected' : 'disconnected',
    });
});

// all auth routes
const authRoutes = require('./routes/auth.routes')
app.use('/api/auth', authRoutes)

const folderRoutes = require('./routes/folder.routes')
app.use('/api/folders', folderRoutes)


module.exports = app;