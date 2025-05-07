import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";
import {sendResetEmail} from "../utils/resetEmail.js"

export const handleForgotPassword = async(email)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404,"No account with that email address exists.");
    }
    const resetToken = await user.generatePasswordResetToken();
    await user.save();
    const resetURL = `http://localhost:5000/api/v1/users/change-password?token=${resetToken}`;
    await sendResetEmail(user.email,resetURL);
}