const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    adminno: String,
    fname: String,
    lname: String,
    mobile: String,
    email: String,
    password:String,
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' }
})

const AdminModel = mongoose.model("admins", AdminSchema)
module.exports = AdminModel





