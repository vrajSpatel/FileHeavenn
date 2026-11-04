const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            requiered: true,
            trim: true,
            maxlength: 255,
        },

        size: {
            type: Number,
            required: true,
        },

        mimeType: {
            type: String,
            default: 'application/octet-stream', // similar to null but it will help to download it
        },

        storedName: {
            type: String,
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        folder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },

        isTrashed: {
            type: Boolean,
            default: false,
        },
        trashedAt: {
            type: Date,
            default: null
        },

        isStarred: {
            type: Boolean,
            default: false,
        },

        tags: {
            type: [String],
            default: []
        },
        lastOpenedAt: {
            type: Date,
            default: null
        },

        expiryDate: {
            type: Date,
            default: null
        }

    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('File', fileSchema)