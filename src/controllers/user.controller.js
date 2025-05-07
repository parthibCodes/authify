import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dataValidator } from "../utils/dataValidator.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { successMail } from "../utils/successMailMessage.js";
import {handleForgotPassword} from "../utils/authService.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, fullname, password, email, role, isVerified } = req.body;
  if (!dataValidator(req.body, ["username", "fullname", "password", "email"])) {
    throw new ApiError(400, "Missing required fields");
  }
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    throw new ApiError(409, "User with email or username already exists");
    // return res.status(409).json(new ApiResponse(409,"User with email or username already exists"));
  }
  const createUser = await User.create({
    username: username.toLowerCase(),
    password,
    fullname,
    email,
    role: role,
    isVerified,
  });
  const createdUser = await User.findById(createUser.id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong during creation of new User");
  }

  await sendEmail(email, createUser.id);

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { username, password, email, role, isVerified } = req.body;
  if (!dataValidator(req.body, ["username", "password", "email"])) {
    throw new ApiError(400, "Missing required fields");
  }

  const checkUser = await User.findOne({ $or: [{ username }, { email }] });

  if (!checkUser) {
    throw new ApiError(404, "User doesn't exist");
  }
  if (!checkUser.isVerified) {
    throw new ApiError(403, "Please verify your email first");
  }
  const isPasswordValid = await checkUser.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    checkUser.id
  );
  const loggedInUser = await User.findById(checkUser.id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User loggedin successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { refreshToken: undefined },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User log out"));
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError(401, "Token is not found");
  }

  let decodedToken;

  /*jwt.verify(token,isAdmin ? process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY : process.env.USER_ACCESS_TOKEN_SECRET_KEY,async(err,decoded)=>{
        if(err){
            throw new ApiError(401,"Email verification failed possibly due to the link is invalid or expired");
        }
        const userId = decoded?.id;
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }

        user.isVerified = true;
        await user.save({validateBeforeSave:false});
        await successMail(user.email);
        // res.redirect("https://chatgpt.com");
        return res.status(200).json(new ApiResponse(200,{},"Email verified successfully"));
    });
    */
  try {
    decodedToken = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET_KEY);
  } catch (error) {
    try {
      decodedToken = jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY
      );
    } catch (error) {
      throw new ApiError(
        401,
        "Email verification failed. The link may be invalid or expired."
      );
    }
  }
  const userId = decodedToken?.id;
  if (!userId) {
    throw new ApiError(400, "Invalid token payload");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User is not found");
  }
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });
  await successMail(user.email);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendLink = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(401, "Email is not found");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User is not found");
  }
  await generateAccessAndRefreshToken(user.id);
  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User is already verified"));
  }
  if(Date.now()-user.updatedAt.getTime() < 5*60*1000 ){
    throw new ApiError(429,"You can not request before 5 minutes");
  }
  await sendEmail(email, user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

const forgotPassword = asyncHandler(async(req,res,next)=>{
  const {email} = req.body;
  try{
    await handleForgotPassword(email);
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Reset email sent to the email"));
  }
  catch(error){
    throw new ApiError(500,"",error);
  }
});

const resetPassword = asyncHandler(async(req,res,next)=>{
  const {newPassword} = req.body;
  if(!newPassword){
    throw new ApiError(400,"New Password is required");
  }
  const user = req.user;

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password has been successfully reset."));
})

export { registerUser, loginUser, logoutUser, verifyEmail, resendLink,forgotPassword,resetPassword };