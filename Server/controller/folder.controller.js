const mongoose = require('mongoose')
const Folder = require('../model/folder.model')

// just checck if the name is valid or not
function isValidName(naem) {
    if (typeof naem != 'String') {
        return false;
    }

    const Name = naem.trim()

    if (Name.length === 0 || Name.length > 100) {
        return false;
    }

    return true;
}


// use to check if there is a folder with same name
async function nameExists(ownerId, parentId, name, skipFolderId) {
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

        if (!isValidName(name)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid folder name'
            }
            )
        }

        let parentId = null
        if (parent) {

            if (!mongoose.Types.ObjectId.isValid(parent)) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect parent folder ID'
                })
            }

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

        const clnName = name.trim()

        const nameExist = await nameExists(req.user._id, parentId, clnName)

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

// get all folders
async function getFolders(req, res) {
    try {
        const parent = req.query.parent
        let parentId = null;

        if (parent) {

            if (!mongoose.Types.ObjectId.isValid(parent)) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect parent folder ID'
                })
            }

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
            isTranshed: false,
        }).sort({ name: 1 }) // inbuilt sorting method in mongoose

        return res.status(200).json({
            success: true,
            count: folder.length,
            folders,
        })

    } catch (error) {
        console.error('error while fetching all folders')
        return res.status(500).json({ success: false, message: 'internal server error' })
    }

}

// get one folder with its sub folders
async function getFolderById(req, res) {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                susscess: false,
                message: 'wrong folder id'
            })
        }

        const folder = await Folder.findOne({
            _id: id,
            owner: req.user._id,
            isTrashed: false,
        })

        if (!folder) {
            return res.status(400).json({
                susscess: false,
                message: 'folder is not found'
            })
        }

        const subFolders = await Folder.find({
            owner: req.user._id,
            parent: folder._id,
            isTrashed: false,
        }).sort({ name: 1 })

        /**
            create an list of object in an order for breadcrumb in the website for navigation.
            get a refrence from other projects
         */
        const breadCrumb = []
        let curr = folder;

        while (curr) {
            breadCrumb.unshift({
                _id: curr._id,
                name: curr.name
            })

            if (curr.parent) {
                curr = await Folder.findById(curr.parent);
            } else {
                curr = null
            }
        }


        return res.status(200).json({
            success: true,
            folder,
            subFolders,
            breadCrumb
        })

    } catch (error) {
        console.error('error while fetching all folders')
        return res.status(500).json({ success: false, message: 'internal server error' })
    }
}

// renaming the folder
async function renameFolder(req, res) {
    try {
        const { id } = req.params
        const { name } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'wrong folder id',
            });
        }

        if (!isValidName(name)) {
            return res.status(400).json({
                success: false,
                message: 'invalid folder naem',
            });
        }

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
        const nameExist = await nameExists(req.user._id, folder.parent, clnName, folder._id)

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'wrong folder id',
            });
        }

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
            if (!mongoose.Types.ObjectId.isValid(newParent)) {
                return res.status(400).json({
                    success: false,
                    message: 'invalid new parent folder id',
                });
            }

            const target = await Folder.findOne({
                _id: newParent,
                owner: req.user_id,
                isTrashed: false
            })

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

        const nameExist = await nameExists(req.user._id, newParentId, folder.name, folder._id)
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

module.exports = {
    createFolder,
    getFolders,
    getFolderById,
    renameFolder,
    moveFolder
}