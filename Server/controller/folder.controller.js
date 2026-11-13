const mongoose = require('mongoose')
const Folder = require('../model/folder.model')
const File = require('../model/file.model')


// use to check if there is a folder with same name
async function isAlrdyName(ownerId, parentId, name, skipFolderId) {
    const folder = await Folder.findOne({
        owner: ownerId,
        parent: parentId,
        name: name,
        isTrashed: false
    })

    if (!folder) {
        return false
    }

    // bug solver, when save the name without rename itt
    /**
     Learned something new here,
     --> when we compare two objectId which are basiclly object and even if they are same, they will not same becuase they are stored in different memory, so we have to convert them into string to compare it

     equal() method: it do the same thing and we don't have to convert them into string manually
     */
    if (folder._id.equals(skipFolderId)) {
        return false
    }

    return true
}

// creating new folder
async function createFolder(req, res) {
    try {
        const { name, parent } = req.body


        let parentId = null
        if (parent) {

            const parentFolder = await Folder.findOne({
                _id: parent,
                owner: req.user._id,
                isTrashed: false
            })

            if (!parentFolder) {
                return res.status(404).json({
                    success: false,
                    message: 'parent folder is not founded'
                })
            }

            parentId = parentFolder._id;
        }

        const clnName = name.trim()

        const nameExist = await isAlrdyName(req.user._id, parentId, clnName)

        if (nameExist) {
            return res.status(409).json({
                success: false,
                message: "this named folder already exists"
            })
        }

        const newFolder = await Folder.create({
            name: clnName,
            owner: req.user._id,
            parent: parentId
        })

        return res.status(201).json({
            success: true,
            message: "folder created",
            newFolder
        })

    } catch (error) {
        console.error('error while creating folder:', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// get all folders -- if there is only / not ?parent then it will fetch root folders
async function getFolders(req, res) {
    try {
        const parent = req.query.parent
        let parentId = null;

        if (parent) {


            const parentFolder = await Folder.findOne({
                _id: parent,
                owner: req.user._id,
                isTrashed: false
            })

            if (!parentFolder) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent folder is not founded'
                })
            }

            parentId = parentFolder._id;
        }

        const folders = await Folder.find({
            owner: req.user._id,
            parent: parentId,
            isTrashed: false,
        }).sort({ name: 1 }) // inbuilt sorting method in mongoose

        console.log(folders)

        return res.status(200).json({
            success: true,
            count: folders.length,
            folders,
        })

    } catch (error) {
        console.log(error)
        console.error('error while fetching all folders')
        return res.status(500).json({ success: false, message: 'internal server error' })
    }

}

// renaming the folder
async function renameFolder(req, res) {
    try {
        const { id } = req.params
        const { name } = req.body


        const folder = await Folder.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: false
        })

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'no folder found',
            })
        }

        const clnName = name.trim();
        const nameExist = await isAlrdyName(req.user._id, folder.parent, clnName, folder._id)

        if (nameExist) {
            return res.status(409).json({
                success: false,
                message: 'there is already a folder with this name',
            });
        }

        folder.name = clnName
        await folder.save()

        return res.status(200).json({
            success: true,
            message: 'folder name changed',
            folder,
        })
    } catch (error) {
        console.error('error while renaming the folder', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// move the folder to another place
async function moveFolder(req, res) {
    try {
        const { id } = req.params
        const { newParent } = req.body


        if (newParent === undefined) { // because we use null then it will use a root folder reference
            return res.status(400).json({
                success: false,
                message: 'new parent is required'
            })
        }

        const folder = await Folder.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: false
        })

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'folder not found',
            })
        }

        let newParentId = null
        if (newParent) {
            // console.log(newParent)
            // console.log(req.user._id)

            const target = await Folder.findOne({
                _id: newParent,
                owner: req.user._id,
                isTrashed: false
            })
            console.log(target)

            if (!target) {
                return res.status(404).json({
                    success: false,
                    message: "new folder location not found"
                })
            }

            /**
             this is a mandatory thing to take care of which is you can not move a folder into its subfolder
             */
            let current = target
            while (current) {
                if (current._id.equals(folder._id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'you cannot move a folder into his subfolder'
                    })
                }
                if (current.parent) {
                    current = await Folder.findById(current.parent)
                } else {
                    current = null
                }
            }

            newParentId = target._id
        }

        const nameExist = await isAlrdyName(req.user._id, newParentId, folder.name, folder._id)
        if (nameExist) {
            return res.status(409).json({
                success: false,
                message: 'you can not move thiss folder into new location with the same name, because this name already exist in new folder'
            })
        }

        // actual small logic : lol
        folder.parent = newParentId
        await folder.save()

        return res.status(200).json({
            success: true,
            message: 'folder moved to new location',
            folder
        })


    } catch (error) {
        console.error('error while moving the folder', error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// after adding delete functionality
// tells how many folders has bined
async function softDeteteFolderTree(folderId, ownerId, date) {
    const folderIds = [folderId]

    for (let i = 0; i < folderIds.length; i++) {
        const subs = await Folder.find({ parent: folderIds[i], owner: ownerId })

        for (const child of subs) {
            folderIds.push(child._id)
        }
    }

    // find and update isTrashed to true just softdelete it
    await File.updateMany({ folder: { $in: folderIds }, owner: ownerId }, { isTrashed: true, trashedAt: date })

    await Folder.updateMany({ _id: { $in: folderIds }, owner: ownerId }, { isTrashed: true, trashedAt: date })

    return folderIds.length
}

// move folder to bin
async function softDeleteFolder(req, res) {
    try {
        const { id } = req.params;

        const folder = await Folder.findOne({ _id: id, owner: req.user._id, isTrashed: false })

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'folder not found',
            })
        }

        const totalCount = await softDeteteFolderTree(folder._id, req.user._id, new Date())// this will give use current date and time

        return res.status(200).json({
            success: true,
            message: 'folder is moved to bin',
            totalCount,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "problem while soft deleting the folder" })
    }
}

module.exports = {
    createFolder,
    getFolders,
    renameFolder,
    moveFolder,
    softDeleteFolder
}