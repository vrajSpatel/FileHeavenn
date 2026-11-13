const path = require('path')
const multer = require('multer')
const { dir } = require('../config/storage.config')

// store file with unique name without changing extenstion
/**
 boiler-plate code from multer website
 cb: it is a callback that give answer to multer(here) if there is no error
 cb(error,answer) 
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1000000000);
        cb(null, uniqueName + path.extname(file.originalname)); // extname will give the extention
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
})

// upload.single will return a funtion that we use in main function 
const singleFile = upload.single('file') // file is sended in from the frontend it should match the name

function savveFile(req, res, next) {
    singleFile(req, res, function (error) {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        next()
    })
}

module.exports = { savveFile }