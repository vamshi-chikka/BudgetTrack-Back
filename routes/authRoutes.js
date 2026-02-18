import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/UserSchema.js'
import jwt from 'jsonwebtoken';
import {transporter} from '../config/mailer.js';

const app = express.Router();


const JWT_SECRET = process.env.JWT_SECRET;

app.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    console.log(req.body);
    if(!email || !password){
        return res.status(400).json({message:"All fields are requied"})
    }
    try{
        const oldUser = await User.findOne({email:email.toLowerCase()})
        if(!oldUser || !oldUser.isVerified){
            return res.send({status:'error',data:"Invalid User Credentials "})
        }
        const documentId = oldUser._id;
        if(await bcrypt.compare(password,oldUser.password)){
            const token = jwt.sign({documentId},JWT_SECRET);
            console.log(token);
            if(res.status(201)){
                return res.send({status:'ok',data:{token,oldUser}})
            }else{
                return res.send({status:'error'})
            }
        }
    }catch(error){
        console.log("error while logging",error)
        res.send({status:'error',data:error})
    }
})

app.post('/register',async (req,res)=>{
    const {name,email,mobile,password} = req.body;
    if(!name || !email || !mobile || !password){
        return res.send({status:error,data:"All fields are Mandatory"})
    }
    try{
        const lowerCaseEmail = email.toLowerCase();
        const oldUser = await User.findOne({email:lowerCaseEmail})
        if(oldUser && oldUser.isVerified){
            return res.send({status:'error',data:"User already exists!!"})
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const encryptedPassword = await bcrypt.hash(password,10);
        await User.findOneAndUpdate({email},{
                name:name,
                email:email,
                mobile:mobile,
                password:encryptedPassword,
                otp:otp,
                otpExpiresAt: Date.now() + 10*60*1000, //10 mins
        },{
            upsert:true, new :true
        });
        await transporter.sendMail({
            from :process.env.EMAIL_USER,
            to:lowerCaseEmail,
            subject:'Verify your email',
            text:`Your Verification code is ${otp}`
        });
        res.send({status:'ok',data:"Otp sent to your email successfully!!"})
    }catch(error){
        res.send({status:'error',data:error})
        console.log(error)
    }
});

app.post('/verifyEmail',async(req,res)=>{
    const {email,otp} = req.body;
    console.log(req.body)
    try{
        const oldUser = await User.findOne({email:email.toLowerCase()});
        if(!oldUser){
            return res.send({status:'error',message:'User doesnot exists!!'})
        }
        if(oldUser.otp !== otp){
            return res.send({status:'error',message:'Invalid Otp exists!!'})
        }
        if(oldUser.otpExpiresAt <Date.now()){
            return res.send({status:'error',message:'OTP has expired'})
        }
        oldUser.isVerified = true;
        oldUser.otp = null;
        oldUser.otpExpiresAt = null;
        await oldUser.save();
        res.send({status:'ok',message:'Email verified Successfully'})

    }catch(error){
        res.send({status:'error',message:'OTP invalid'})
    }
})
export default app;
