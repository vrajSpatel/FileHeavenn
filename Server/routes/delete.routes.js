const express = require('express')
const router = express.Router()

const {
    getTrash,
    restoreFile,
    restoreFolder,
    deleteFileForever,
    deleteFolderForever,
    emptyTrash,
} = require('../controller/delete.controller')

const { authMiddleware } = require('../middleware/authMiddleware')


router.use(authMiddleware)


router.get('/', getTrash)
router.delete('/', emptyTrash)

router.patch('/files/:id/restore', restoreFile)

router.patch('/folders/:id/restore', restoreFolder)

router.delete('/files/:id', deleteFileForever)

router.delete('/folders/:id', deleteFolderForever)

module.exports = router

