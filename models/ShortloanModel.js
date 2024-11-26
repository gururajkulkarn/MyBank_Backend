const mongoose = require('mongoose')

const ShortLoanSchema = new mongoose.Schema({
        memberno: String,
        fullname:String,
        month: String,
        year: String,
        loanamount:String,
        duration: Number,
        emiamount: String,
        interest: String
        

})

const ShortloanModel = mongoose.model("shortloans", ShortLoanSchema)
module.exports = ShortloanModel





