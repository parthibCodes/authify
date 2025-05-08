import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyOldPassword = asyncHandler(async(req,res,next)=>{
    const {password} = req.body;

    const user = await User.findOne({password});
    if(!user){
        throw new ApiError(404,"User is not found");
    }
    return password;
    next();
});