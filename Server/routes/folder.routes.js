const express = require('express')

const {
    createFolder,
    getFolders,
    renameFolder,
    moveFolder,
    softDeleteFolder
} = require('../controller/folder.controller')

const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

// this will check before every route
router.use(authMiddleware)

router.post('/', createFolder)
router.get('/', getFolders)

router.patch('/:id', renameFolder)

router.patch('/:id/move', moveFolder)

router.delete('/:id', softDeleteFolder)

module.exports = router;
