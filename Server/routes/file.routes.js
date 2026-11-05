const express = require('express')

const {
    uploadFile,
    getFiles,
    moveFile
} = require('../controller/file.controller')

const { authMiddleware } = require('../middleware/authMiddleware')
const { savveFile } = require('../middleware/upload')

const router = express.Router()

// use it before every route call
router.use(authMiddleware);

//upload the file
router.post('/upload', savveFile, uploadFile)

// get all files inside a folder
router.get('/', getFiles)

// move the location of the file
router.patch('/:id/move', moveFile)


module.exports = router