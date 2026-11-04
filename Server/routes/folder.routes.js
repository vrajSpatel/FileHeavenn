const express = require('express')

const {
    createFolder,
    getFolders,
    getFolderById,
    renameFolder,
    moveFolder
} = require('../controller/folder.controller')

const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

// this will check before every route
router.use(authMiddleware)

router.post('/', createFolder)
router.get('/', getFolders)

router.get('/:id', getFolderById)
router.patch('/:id', renameFolder)

router.patch('/:id/move', moveFolder)

module.exports = router;
