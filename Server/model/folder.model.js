const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },

    isTrashed: {
        type: Boolean,
        default: false
    },
    trashedAt: {
        type: Date,
        default: null
    },

    isStarred: {
        type: Boolean,
        default: false
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
}, {
    timestamps: true
}

)

module.exports = mongoose.model('Folder', folderSchema)