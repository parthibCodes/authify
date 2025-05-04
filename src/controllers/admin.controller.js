import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getAllUsers = asyncHandler(async(req,res,next)=>{
    const users = await User.find();
    return res.json(new ApiResponse(200, users, "Users fetched successfully"));
});

const deleteUsers = asyncHandler(async(req,res,next)=>{
    const userId = req.params.id;
    if(!userId){
        throw new ApiError(401,"User id is not found");
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if(!deletedUser){
        throw new ApiError(404,"User does not exist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"User deleted successfully"));
});

const changeRoleType = asyncHandler(async(req,res,next)=>{
    const userId = req.params.id;
    const { role } = req.body;
    if(!userId){
        throw new ApiError(401,"User id is not found");
    }
    if(!role || !["user","admin"].includes(role)){
        throw new ApiError(400,"Invalid role type");
    }
    const changedUser = await User.findByIdAndUpdate(userId,{role},{new:true,runValidators:true});
    if(!changedUser){
        throw new ApiError(404,"User does not exist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,changedUser,"User role modified successfully"));
});

export {getAllUsers,deleteUsers,changeRoleType};