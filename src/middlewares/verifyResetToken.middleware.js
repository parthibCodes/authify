import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyResetToken = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is not expired
  });
  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }
  req.user = user;
  next();
});
