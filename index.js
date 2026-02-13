import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import authRoute from './routes/authRoutes.js';
import transactionRoute from './routes/transactionRoutes.js'
import job from './utils/cron.js'

dotenv.config();
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 5001;
connectDB();

job.start();

     
app.get("/",(req,res)=>{
    res.send("It's working");
});


app.use('/api/auth',authRoute);

app.use('/api/tran',transactionRoute);

app.listen(PORT,()=>{
    console.log(`your are running on ${PORT}`)
});