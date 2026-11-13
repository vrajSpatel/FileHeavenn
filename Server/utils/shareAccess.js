const File = require('../model/file.model')
const Folder = require('../model/folder.model')
const Share = require('../model/fileShare.model')

// it will verify if the user can access perticular itemm
async function getItemAccess(itemId, itemType, userId) {

    /**
     1. it will get itemid(file/folder), type, and userID
     2. search it on File or Folder model based on type , store in item
     3. check if it owner or not
     4. find share file or folder and return the role
     */

    let Model;
    if (itemType === 'file') {
        Model = File
    } else {
        Model = Folder
    }

    // file or folder based on itemtype
    const item = await Model.findOne({ _id: itemId, isTrashed: false })
    if (!item) {
        return { item: null, role: null }
    }
    if (item.owner.equals(userId)) {
        return { item: item, role: 'owner' }
    }



    let share = null
    let folderId = null

    if (itemType === 'file') {
        // if its file then it will store the sahre here
        share = await Share.findOne({
            item: item._id,
            itemModel: 'File',
            sharedWith: userId
        })
        folderId = item.folder
    } else {
        folderId = item._id
    }

    // check each parent folder one by one until it find a shared one or reach the top
    while (!share && folderId) {
        share = await Share.findOne({ item: folderId, itemModel: 'Folder', sharedWith: userId })

        const folder = await Folder.findById(folderId)
        folderId = folder ? folder.parent : null
    }

    if (share) {
        return { item: item, role: share.permission }
    }

    return { item: item, role: null }
}

module.exports = { getItemAccess }