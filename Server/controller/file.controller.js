const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const File = require('../model/file.model')
const Folder = require('../model/folder.model')
const { dir } = require("../config/storage.config")

// function to remove the file form storage, this will use inside the controllers so we can access req from the user and get req.file
function removeUploadedFile(req) {
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }
}

// uploading a file
async function uploadFile(req, res) {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "there is no file to upload"
            })
        }

        const { folder } = req.body
        let folderId = null

        if (folder) {

            const parentFolder = await Folder.findOne({
                _id: folder,
                owner: req.user._id,
                isTrashed: false
            })

            if (!parentFolder) {

                removeUploadedFile(req)

                return res.status(404).json({
                    success: false,
                    message: 'file parent folder not found',
                });
            }

            folderId = parentFolder._id
        }

        const file = await File.create({
            name: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            storedName: req.file.filename,
            owner: req.user._id,
            folder: folderId,
        })

        return res.status(201).json({
            success: true,
            message: "new file added",
            file
        })

    } catch (error) {

        removeUploadedFile(req)

        console.error('error while uploading the file', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// get files inside one folder
async function getFiles(req, res) {
    try {
        const folder = req.query.folder
        let folderId = null

        if (folder) {

            const parentFolder = await Folder.findOne({
                _id: folder,
                owner: req.user._id,
                isTrashed: false
            })

            if (!parentFolder) {
                return res.status(404).json({
                    success: false,
                    message: 'folder not found',
                })
            }

            folderId = parentFolder._id
        }

        const files = await File.find({
            owner: req.user._id,
            folder: folderId,
            isTrashed: false
        }).sort({ name: 1 })

        return res.status(200).json({
            success: true,
            count: files.length,
            files,
        })

    } catch (error) {
        console.error('error while fetching the fils all', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// move into another folder
async function moveFile(req, res) {
    try {

        const { id } = req.params
        const { folder } = req.body

        if (folder === undefined) {
            return res.status(400).json({
                success: false,
                message: 'folder is required',
            })
        }

        const file = await File.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: false
        })

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file not found',
            });
        }

        let folderId = null

        if (folder) {


            const target = await Folder.findOne({
                _id: folder,
                owner: req.user._id,
                isTrashed: false
            })

            if (!target) {
                return res.status(404).json({
                    success: false,
                    message: 'tarrget folder is not found',
                })
            }

            folderId = target._id
        }

        file.folder = folderId
        await file.save()

        return res.status(200).json({
            success: true,
            message: 'file moved into new foldwr',
            file,
        })

    } catch (error) {
        console.log('error while movin the file', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

async function SoftDeleteFile(req, res) {
    try {
        const { id } = req.params

        const file = await File.findOne({ _id: id, owner: req.user._id, isTrashed: false })

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file is not found',
            })
        }

        file.isTrashed = true
        file.trashedAt = new Date()
        await file.save()

        return res.status(200).json({
            success: true,
            message: 'fille is moved to bin',
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "problem while soft deleting file" })
    }
}

module.exports = {
    uploadFile,
    getFiles,
    moveFile,
    SoftDeleteFile
}

