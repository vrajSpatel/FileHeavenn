const mongoose = require('mongoose')

const File = require('../model/file.model')
const Folder = require('../model/folder.model')

const { forverDelete, deleteWithSubthings } = require('../utils/delleteHelper')

// restore from the recycle bin with all its sub folders and files
async function restoreWithsubs(folderId, ownerId) {

    // same logic as deleting
    const folderIds = [folderId]

    for (let i = 0; i < folderIds.length; i++) {
        const subs = await Folder.find({ parent: folderIds[i], owner: ownerId })

        for (const child of subs) {
            folderIds.push(child._id)
        }
    }

    // update all files from isTrashed:true to false
    await File.updateMany({ folder: { $in: folderIds }, owner: ownerId }, { isTrashed: false, trashedAt: null })

    // same like upper but for folders
    await Folder.updateMany({ _id: { $in: folderIds }, owner: ownerId }, { isTrashed: false, trashedAt: null })
}


// gett all trash
async function getTrash(req, res) {
    try {
        const folders = await Folder.find({
            owner: req.user._id,
            isTrashed: true
        }).sort({ trashedAt: -1 })

        const files = await File.find({
            owner: req.user._id,
            isTrashed: true
        }).sort({ trashedAt: -1 })

        return res.status(200).json({
            success: true,
            folders,
            files,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while getting all trash" })
    }
}

// restore a file from bin
async function restoreFile(req, res) {

    try {
        const { id } = req.params

        const file = await File.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: true
        })

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file not found in bin',
            })
        }

        // if file's parent folder is missing or in trashed then it will move to the root folder(null parent)
        if (file.folder) {
            const folder = await Folder.findOne({
                _id: file.folder,
                owner: req.user._id,
                isTrashed: false
            })

            if (!folder) {
                file.folder = null
            }
        }

        file.isTrashed = false
        file.trashedAt = null

        await file.save()

        return res.status(200).json({
            success: true,
            message: 'file restored',
            file,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while resotring file" })
    }
}

async function restoreFolder(req, res) {
    try {
        const { id } = req.params

        const folder = await Folder.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: true
        })

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'no folder in bin',
            })
        }

        // same logic as above but for folder -- if no parent found then in root
        if (folder.parent) {
            const parent = await Folder.findOne({
                _id: folder.parent,
                owner: req.user._id,
                isTrashed: false
            })

            if (!parent) {
                folder.parent = null
            }
        }

        // handle same name problem
        const sameName = await Folder.findOne({
            owner: req.user._id,
            parent: folder.parent,
            name: folder.name,
            isTrashed: false,
        })

        if (sameName) {
            folder.name = folder.name + ' (restored)'
        }

        folder.isTrashed = false;
        folder.trashedAt = null;

        await folder.save()

        await restoreWithsubs(folder._id, req.user._id)

        return res.status(200).json({
            success: true,
            message: 'folder got restored',
            folder,
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while resotring folder" })
    }
}


// delete one trashed file forever
async function deleteFileForever(req, res) {
    try {
        const { id } = req.params

        const file = await File.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: true
        })
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'file not found in bin',
            })
        }

        await forverDelete(file)

        return res.status(200).json({
            success: true,
            message: 'file deleted for forever',
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while deleting file forever" })
    }
}

// delete one trashed folder with everything inside it forever
async function deleteFolderForever(req, res) {
    try {
        const { id } = req.params

        const folder = await Folder.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: true
        })
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'folder not found in trash',
            })
        }

        const deletedCount = await deleteWithSubthings(folder._id, req.user._id);

        return res.status(200).json({
            success: true,
            message: 'folder deleted forever with sub itms',
            deletedCount,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while deleting file forever" })
    }
}

// delete everything from bin forever
async function emptyTrash(req, res) {
    try {

        const folders = await Folder.find({
            owner: req.user._id,
            isTrashed: true
        })
        const files = await File.find({
            owner: req.user._id,
            isTrashed: true
        })

        const totalFolders = folders.length
        const totalFiles = files.length

        for (const folder of folders) {
            // check for the sub folders that got removed with their parent folder -- skip that folder from the list
            const stillThere = await Folder.findById(folder._id)

            if (stillThere) {
                await deleteWithSubthings(folder._id, req.user._id)
            }
        }

        // not need to do for loop to check for upper condition, foreverDelete already handle that
        for (const file of files) {
            await forverDelete(file)
        }

        return res.status(200).json({
            success: true,
            message: 'all items removed from bin',
            totalFolders,
            totalFiles,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "error while emting trash" })
    }
}

module.exports = {
    getTrash,
    restoreFile,
    restoreFolder,
    deleteFileForever,
    deleteFolderForever,
    emptyTrash,
}
