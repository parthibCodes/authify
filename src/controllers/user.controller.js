import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dataValidator } from "../utils/dataValidator.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { successMail } from "../utils/successMailMessage.js";

const options = {
    httpOnly:true,
    secure:true
}

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } 
    catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req,res,next)=>{
    const {username,fullname,password,email,role} = req.body;
    if(!dataValidator(req.body,["username","fullname","password","email"])){
        throw new ApiError(400, "Missing required fields");
    }
    const userExists = await User.findOne({$or:[{username},{email}]});
    if(userExists){
        throw new ApiError(409,"User with email or username already exists");
        // return res.status(409).json(new ApiResponse(409,"User with email or username already exists"));
    }
    const createUser = await User.create({
        username:username.toLowerCase(),password,fullname,email,role:role
    });
    const createdUser = await User.findById(createUser.id).select("-password");
    if(!createdUser){
        throw new ApiError(500,"Something went wrong during creation of new User");
    }

    await sendEmail(email,createUser.id);

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    );
});

const loginUser = asyncHandler(async(req,res,next)=>{
    const {username,password,email,role} = req.body;
    if(!dataValidator(req.body,["username","password","email"])){
        throw new ApiError(400, "Missing required fields");
    }
    const checkUser = await User.findOne({$or:[{username},{email}]});
    if(!checkUser){
        throw new ApiError(404,"User doesn't exist");
    }
    const isPasswordValid = await checkUser.comparePassword(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials");
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(checkUser.id);
    const loggedInUser = await User.findById(checkUser.id).select("-password -refreshToken");

    

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken:accessToken,refreshToken:refreshToken},"User loggedin successfully"));
});

const logoutUser = asyncHandler(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{refreshToken:undefined},{new:true});
    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User log out")
    )
});

const verifyEmail = asyncHandler(async(req,res,next)=>{
    const { token } = req.params;
    if(!token){
        throw new ApiError(401,"Token is not found");
    }
    await jwt.verify(token,process.env.USER_ACCESS_TOKEN_SECRET_KEY,async(err,decoded)=>{
        if(err){
            throw new ApiError(401,"Email verification failed possibly due to the link is invalid or expired");
        }
        const userId = decoded?.id;
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }

        await successMail(user.email);

        return res.status(200).json(new ApiResponse(200,{},"Email verified successfully"));
    });
});

export {registerUser,loginUser,logoutUser,verifyEmail};