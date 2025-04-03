const mongoose = require('mongoose');

const monthlyDataSchema = new mongoose.Schema({
    memberno:String, 
    fullname: String, 
    totalShareAmount:Number, 
    monthlyShareAmount:Number, 
    shortLoanAmount:  Number,
    shortLoanMonth: String,
    shortLoanYear: String, 
    shortLoanDuration: Number, 
    shortLoanInterest: Number, 
    shortLoanEmi:  Number, 
    shortloanStatus: String,
    longLoanAmount:  Number, 
    longLoanMonth: String,
    longLoanYear: String,
    longLoanDuration:  Number, 
    longLoanInterest:  Number, 
    longLoanEmi:  Number, 
    longLoanOuts: Number,
    longLoanStatus: String,
    penaltyFee:  Number,
    cmonthYear: String 
    
});

const MonthlyDataModel = mongoose.model("monthlydatas", monthlyDataSchema)

module.exports = MonthlyDataModel

