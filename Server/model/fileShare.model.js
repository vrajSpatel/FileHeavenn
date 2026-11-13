const mongoose = require("mongoose")

const fileShareSchema = mongoose.Schema(
    {
        // it will check both file and folder model with the help of itemModel
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'itemModel',
        },

        itemModel: {
            type: String,
            required: true,
            enum: ['File', 'Folder'],
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        sharedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        permission: {
            type: String,
            enum: ['viewer', 'editor'],
            default: 'viewer',
        },

        note: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Share', fileShareSchema)