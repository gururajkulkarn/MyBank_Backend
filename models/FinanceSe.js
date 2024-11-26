const mongoose = require('mongoose')

const FinanceSchema = new mongoose.Schema({
    interest: Number,
    investment: String
})

const FinanceModel = mongoose.model("finances", FinanceSchema)
module.exports = FinanceModel





