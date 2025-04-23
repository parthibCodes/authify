import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dataValidator } from "../utils/dataValidator.js";

const registerUser = asyncHandler(async (req,res,next)=>{
    const {username,fullname,password,email} = req.body;
    if(!dataValidator(req.body,["username","fullname","password","email"])){
        return;
    }
    const userExists = await User.findOne({$or:[{username},{email}]});
    if(userExists){
        throw new ApiError(409,"User with email or username already exists");
        // return res.status(409).json(new ApiResponse(409,"User with email or username already exists"));
    }
    const createUser = await User.create({
        username:username.toLowerCase(),password,fullname,email
    });
    const createdUser = await User.findById(createUser.id).select("-password");
    if(!createdUser){
        throw new ApiError(500,"Something went wrong during creation of new User");
    }
    return res.status(201).json(
        new ApiResponse(200,"User registered successfully",createdUser)
    );
});

export {registerUser};