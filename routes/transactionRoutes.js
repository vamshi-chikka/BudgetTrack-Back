import express from 'express'
import Addtran from '../models/TransactionSchema.js'
import protectRoute from '../middleware/protectRoute.js'
import mongoose from 'mongoose';
const app = express.Router();

app.get('/summary', protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page -1) *limit;

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const allData = await Addtran.find({userId:userId}).limit(limit).skip(skip);
    console.log(allData)
    const result = await Addtran.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);
    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach(item => {
      if (item._id === "Income") {
        totalIncome = item.total;
      } else if (item._id === "Expense") {
        totalExpense = item.total;
      }
    });

    res.send({
      status: "ok",
      data: {
        allData,
        totalIncome,
        totalExpense,
        balance: totalIncome + totalExpense,
        currentPage: page,
        totalPages:Math.ceil(allData.length / limit)
      }
    });

  } catch (error) {
    console.log("Error while getting summary", error);
    res.send({ status: 'error', data: error });
  }
});

app.delete('/delete/:id', protectRoute, async (req, res) => {
  try {
    const { id } = req.params;   // ✅ correct way
    console.log("Deleting id:", id);
    console.log("Deleting id:", req.user._id);
    const transaction = await Addtran.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: "Didn't find any transaction with that Id"
      });
    }
    console.log(transaction)
    res.json({
      status: 'ok',
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.log("Error while deleting transaction", error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/addtransaction', protectRoute ,async(req,res)=>{
    let{type,amount,title,category} = req.body;
    try{
        if(!type || !amount || !title || !category){
            return  res.send({status:'error',message:'All feilds are required'})
        }
        amount = Number(amount);
        if(type === "Expense"){
          amount = -Math.abs(amount);
        }else{
          amount = Math.abs(amount);
        }
        const newTransaction = await Addtran.create({
            type:type,
            amount:amount,
            title:title,
            category:category,
            userId:req.user._id,
        })
        res.send({status:'ok',message:"transaction details added successfully!!!"})
    }catch(error){
        res.send({status:'error',message:error})
    }
})

export default app;
