const { BadRequestError,UnauthenticatedError } = require('../errors');
const User=require('../models/User');
const {StatusCodes}=require('http-status-codes');

// const jwt=require('jsonwebtoken');


const register=async (req,res)=>{
    const user=await User.create({...req.body});
    // const token=await jwt.sign({UserId:user._id,UserName:user.name},'jwtSecret',{expiresIn:'30d'});
    const token=user.createJwt();
    res.status(StatusCodes.CREATED).json({user:{name:user.name,id:user._id},token});
}

const login=async (req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        throw new BadRequestError('please enter email and password');
    }
    const user=await User.findOne({email});

    if(!user){
        throw new UnauthenticatedError('Invalid credentials'); 
    }

    const isPasswordCorrect=user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new UnauthenticatedError('Invalid credentials');
    }
    
    const token=await user.createJwt();
    res.status(StatusCodes.OK).json({user:{username:user.name},token});
    
}

module.exports={register,login};