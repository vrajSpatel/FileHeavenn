const fs = require('fs')
const path = require('path')

const User = require('../model/user.model')
const File = require('../model/file.model')
const Folder = require('../model/folder.model')
const Share = require('../model/fileShare.model')

const { dir } = require('../config/storage.config')
const { getItemAccess } = require('../utils/shareAccess')

// share a file or folder with another user using their email
async function shareItem(req, res) {
    try {
        const { itemId, itemType, email, permission, note } = req.body

        if (!itemId || !itemType || !email || !note) {
            return res.status(400).json({
                success: false,
                message: 'itemId, itemType, email and note are required'
            })
        }

        const { item, role } = await getItemAccess(itemId, itemType, req.user._id)

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'item not found'
            })
        }

        if (role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'only the owner can share this item'
            })
        }

        const receiver = await User.findOne({ email: email.toLowerCase() })

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'no user found with this email'
            })
        }

        // check if file is already shared with same user
        const modelName = itemType === 'file' ? 'File' : 'Folder'

        const alreadyShared = await Share.findOne({
            item: item._id,
            itemModel: modelName,
            sharedWith: receiver._id
        })
        if (alreadyShared) {
            return res.status(409).json({
                success: false,
                message: 'this item is already shared with this user'
            })
        }

        const share = await Share.create({
            item: item._id,
            itemModel: modelName,
            owner: req.user._id,
            sharedWith: receiver._id,
            permission: permission || 'viewer',
            note: note
        })

        return res.status(201).json({
            success: true,
            message: 'item shared',
            share
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while sharing the item' })
    }
}

// all items that other users shared with me
async function getSharedWithMe(req, res) {
    try {
        // populate will basicaclly join the two database here instead of just id now i will get whole data for item and username and eamil for owner
        const shares = await Share.find({ sharedWith: req.user._id })
            .populate('item')
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })

        // filter the deleted item
        const activeShares = shares.filter((share) => share.item && !share.item.isTrashed)

        return res.status(200).json({
            success: true,
            count: activeShares.length,
            shares: activeShares
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while getting items that shared with you' })
    }
}

// all items that i shared with others
async function getSharedByMe(req, res) {
    try {
        const shares = await Share.find({ owner: req.user._id })
            .populate('item')
            .populate('sharedWith', 'username email')
            .sort({ createdAt: -1 })

        const activeShares = shares.filter((share) => share.item && !share.item.isTrashed)

        return res.status(200).json({
            success: true,
            count: activeShares.length,
            shares: activeShares
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while getting items you shared' })
    }
}

// change permission (viewer or editor)
async function updatePermission(req, res) {
    try {
        const { id } = req.params
        const { permission } = req.body

        const share = await Share.findOne({ _id: id, owner: req.user._id })

        if (!share) {
            return res.status(404).json({
                success: false,
                message: 'share not found'
            })
        }

        share.permission = permission
        await share.save()

        return res.status(200).json({
            success: true,
            message: 'permission updated',
            share
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while updating permission' })
    }
}

// stop sharing : by owner or by the person whos shared with
async function removeShare(req, res) {
    try {
        const { id } = req.params

        const share = await Share.findOne({
            _id: id,
            $or: [{ owner: req.user._id }, { sharedWith: req.user._id }]
        })

        if (!share) {
            return res.status(404).json({
                success: false,
                message: 'share not found'
            })
        }

        await Share.deleteOne({ _id: share._id })

        return res.status(200).json({
            success: true,
            message: 'share removed'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while removing share' })
    }
}

// get sub folders and files
async function openSharedFolder(req, res) {
    try {
        const { id } = req.params

        const { item, role } = await getItemAccess(id, 'folder', req.user._id)
        const folder = item

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'folder not found'
            })
        }

        if (!role) {
            return res.status(403).json({
                success: false,
                message: 'you do not have access to this folder'
            })
        }

        const subFolders = await Folder.find({
            parent: folder._id,
            isTrashed: false
        }).sort({ name: 1 })

        const files = await File.find({
            folder: folder._id,
            isTrashed: false
        }).sort({ name: 1 })

        return res.status(200).json({
            success: true,
            role,
            folder,
            subFolders,
            files
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while opening shared folder' })
    }
}

// download a shared file, viewer and editor both can do this
async function downloadSharedFile(req, res) {
    try {
        const { id } = req.params

        const { item, role } = await getItemAccess(id, 'file', req.user._id)
        const file = item

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file not found'
            })
        }

        if (!role) {
            return res.status(403).json({
                success: false,
                message: 'you do not have access to this file'
            })
        }

        const filePath = path.join(dir, file.storedName)

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'file is missing from storage'
            })
        }

        // select parameter is the name that user see on the file after downling
        return res.download(filePath, file.name)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while downloading shared file' })
    }
}

// rename - only editor
async function renameSharedFile(req, res) {
    try {
        const { id } = req.params
        const { name } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'name is required'
            })
        }

        const { item, role } = await getItemAccess(id, 'file', req.user._id)
        const file = item
        
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file not found'
            })
        }

        if (role !== 'owner' && role !== 'editor') {
            return res.status(403).json({
                success: false,
                message: 'only owner or editor can rename this file'
            })
        }

        file.name = name.trim()
        await file.save()

        return res.status(200).json({
            success: true,
            message: 'file renamed',
            file
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'error while renaming shared file' })
    }
}

module.exports = {
    shareItem,
    getSharedWithMe,
    getSharedByMe,
    updatePermission,
    removeShare,
    openSharedFolder,
    downloadSharedFile,
    renameSharedFile
}