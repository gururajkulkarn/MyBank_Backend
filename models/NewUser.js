const mongoose = require('mongoose')

const RegisterSchema = new mongoose.Schema({
        fname: String,
        lname:String,
        mobile: String,
        email: String,
        password:String,
        role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' }
})

const RegisterModel = mongoose.model("registers", RegisterSchema)
module.exports = RegisterModel




