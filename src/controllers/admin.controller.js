import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getAllUsers = asyncHandler(async(req,res,next)=>{
    const users = await User.find();
    return res.json(new ApiResponse(200, users, "Users fetched successfully"));
});



export {getAllUsers};