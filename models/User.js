const mongoose=require('mongoose');
require('dotenv');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const UserSchema= new mongoose.Schema({
    name:{
        type: String,
        required: [true,'please provide mame'],
        minlength:3,
        maxlenght:12,
    },
    email:{
        type: String,
        required:[true,'please provide email'],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'],
        unique:true,
    },
    password:{
        type: String,
        required: [true,'please provide password'],
        minlength:3,
        // maxlenght:20,
        
    }
})
3
UserSchema.pre('save',async function(next){
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
})

UserSchema.methods.createJwt=function(){
    return jwt.sign({UserId:this._id,UserName:this.name},process.env.JWT_SECRET,{expiresIn:'30d'});
}

UserSchema.methods.comparePassword=async function(candidatePassword){
    return bcrypt.compare(candidatePassword,this.password);
}

module.exports= mongoose.model('User',UserSchema);