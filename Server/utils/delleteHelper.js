const fs = require('fs')
const path = require('path')
const Folder = require('../model/folder.model')
const File = require('../model/file.model')

const { dir } = require('../config/storage.config')

// pass the data of the file
async function forverDelete(file) {

    // create a path till real file
    const fileLocation = path.join(dir, file.storedName);

    //THIS will delete actual file from storage
    if (fs.existsSync(fileLocation)) {
        fs.unlinkSync(fileLocation);
    }

    // delete data from database
    await File.deleteOne({ _id: file._id });
}

async function deleteWithSubthings(folderId, ownerId,) {
    /*
    logic inside :
    allfolderIds' length will be 1 on start, for loop to get all folder ids inside that folder, if its push id length will increase

    $in is used to find anything whose value is in this list

    first we have to delete file then folders

   --> got refrence but create on my own
    */
    const allfolderIds = [folderId]

    for (let i = 0; i < allfolderIds.length; i++) {
        const subs = await Folder.find({ parent: allfolderIds[i], owner: ownerId })

        for (const child of subs) {
            allfolderIds.push(child._id)
        }
    }

    const subfils = await File.find({ folder: { $in: allfolderIds }, owner: ownerId })
    for (const file of subfils) {
        await forverDelete(file)
    }

    await Folder.deleteMany({ _id: { $in: allfolderIds }, owner: ownerId })

    return allfolderIds.length
}

module.exports = { forverDelete, deleteWithSubthings }