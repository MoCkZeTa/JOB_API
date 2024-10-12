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

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
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
    getJob,
    showStats};

