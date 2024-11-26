const mongoose = require('mongoose')

const LongLoanSchema = new mongoose.Schema({
        memberno: String,
        fullname:String,
        month: String,
        year: String,
        loanamount:String,
        duration: Number,
        principal:Number,
        inamount:Number,
        emiamount: String,
        interest: String
        

})

const LongloanModel = mongoose.model("longloans", LongLoanSchema)
module.exports = LongloanModel





