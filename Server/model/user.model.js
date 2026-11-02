const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: [
                /^\S+@\S+\.\S+$/,
                'Please fill a valid email address',
            ],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role:{
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        }
    },
    {timestamps: true}
)

// hashing the password 
// mthod to hash 
userSchema.methods.hashPassword = async function(password) {
    if (!password){
        return
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// pre-save with upper method
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    await this.hashPassword(this.password).then((hpass) => {
        this.password = hpass
    });
    next();
})



// compare password method
userSchema.methods.comparePassword = async function(pass) {
    return await bcrypt.compare(pass, this.password);
}

// method to get user data without password
userSchema.methods.toSafeObject = function(){
    return{
        id: this._id,
        username: this.username,
        email: this.email,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

module.exports = mongoose.model('User', userSchema);