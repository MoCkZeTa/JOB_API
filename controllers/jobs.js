const {StatusCodes}=require('http-status-codes');
const Job=require('../models/Job');
const {NotFoundError,BadRequestError}=require('../errors');


const createJob = async (req,res)=>{
    req.body.createdBy=req.user.userID;
    const job=await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({job});
};

const deleteJob = async (req,res)=>{
    const {id:jobId}=req.params;
    const job= await Job.deleteOne({_id:jobId,createdBy:req.user.userID});
    if(!job){
        throw new NotFoundError(`No job exists with the id ${jobId}`);
    }
    res.status(StatusCodes.OK).json({job});
};


const getAllJobs = async (req,res)=>{
    const jobs=await Job.find({createdBy: req.user.userID});
    res.status(StatusCodes.OK).json({jobs,count:jobs.length});  
}


const updateJob = async (req,res)=>{
    const {id:jobId}=req.params;
    const {company,position}=req.body;
    if(!company || !position){
        throw new BadRequestError('Company and position fields cannot be empty');
    }
    const job=await Job.findByIdAndUpdate({createdBy:req.user.userID,_id:jobId},req.body,{new:true,runValidators:true})
    if(!job){
        throw new NotFoundError(`No job exists with the id ${jobId}`);
    }
        res.status(StatusCodes.OK).json({job});
};

const getJob = async (req,res)=>{
    const {id:jobId}=req.params;
    const job= await Job.find({_id:jobId,createdBy:req.user.userID});
    res.status(StatusCodes.OK).json({job});
};

module.exports={createJob,
    deleteJob,
    getAllJobs,
    updateJob,
    getJob};

