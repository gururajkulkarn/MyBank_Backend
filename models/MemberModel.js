const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
    memberno: String,
    fullname: String,
    tsamount: Number,
    msamount: Number,
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' }

})

const MemberModel = mongoose.model("members", MemberSchema)
module.exports = MemberModel





