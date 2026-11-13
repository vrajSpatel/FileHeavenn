const express = require('express')

const {
    shareItem,
    getSharedWithMe,
    getSharedByMe,
    updatePermission,
    removeShare,
    openSharedFolder,
    downloadSharedFile,
    renameSharedFile
} = require('../controller/fileShare.controller')

const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.post('/', shareItem)

router.get('/with-me', getSharedWithMe)

router.get('/by-me', getSharedByMe)

router.get('/folders/:id', openSharedFolder)

router.get('/files/:id/download', downloadSharedFile)

router.patch('/files/:id/rename', renameSharedFile)

router.patch('/:id', updatePermission)

router.delete('/:id', removeShare)

module.exports = router