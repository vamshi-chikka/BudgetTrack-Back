import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';


const JWT_SECRET = process.env.JWT_SECRET;

const protectRoute = async(req,res,next) =>{
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(!authHeader){
        return res.send({status:'error',message :`Didn't receive token`})
    }
    const token = authHeader.split(" ")[1];
    try{
        const decodetoken = jwt.verify(token,JWT_SECRET);
        console.log(decodetoken);
        const user = await User.findById(decodetoken.documentId).select("-password")
        if(!user){
            return res.send({status:'error',data:'Token is not Vaild'})
        }
        req.user=user;
        next();
    }catch(error){
        console.log("Authentication error:",error);
        res.send({status:'error',message:"token invalid"})
    }
}

export default protectRoute;