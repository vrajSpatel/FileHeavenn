const express = require('express')

const {
    uploadFile,
    getFiles,
    moveFile,
    SoftDeleteFile
} = require('../controller/file.controller')

const { authMiddleware } = require('../middleware/authMiddleware')
const { savveFile } = require('../middleware/upload')

const router = express.Router()

router.use(authMiddleware);

//upload the file
router.post('/upload', savveFile, uploadFile)

// get all files inside a folder
router.get('/', getFiles)

// move the location of the file
router.patch('/:id/move', moveFile)

router.delete('/:id', SoftDeleteFile)

module.exports = router