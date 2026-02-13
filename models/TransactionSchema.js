import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        requires:true,
    },
    type:{
        type:String,
        enum:['Income','Expense'],
        required:true
    },
    category:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true});

export default mongoose.model('Transaction',transactionSchema)

