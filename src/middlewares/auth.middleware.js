import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }

        const decodeUnverified = jwt.decode(token);
        if(!decodeUnverified || !decodeUnverified.role){
            throw new ApiError(401,"Invalid token payload");
        }

        const isAdmin = decodeUnverified.role === "admin";
        const decodedToken = jwt.verify(token,isAdmin ? process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY : process.env.USER_ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token");
    }
});

