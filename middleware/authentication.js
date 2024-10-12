const {UnauthenticatedError}=require('../errors');
const jwt=require('jsonwebtoken');
const authentication=async(req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError('Authentication invalid');
    }
    const token=authHeader.split(' ')[1];

    try {  
        const payload=jwt.verify(token,process.env.JWT_SECRET);
        req.user={userID:payload.UserId,username:payload.UserName};
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }

  
}

module.exports = authentication;