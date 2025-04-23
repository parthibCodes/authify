import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      firstname: {
        type: String,
        required: [true, "Please enter your first name"],
        trim: true,
      },
      middlename: {
        type: String,
        trim: true,
      },
      lastname: {
        type: String,
        required: [true, "Please enter your last name"],
        trim: true,
      },
    },
    password: {
      type: String,
      required: [true, "password is required to create the account"],
      validate: {
        validator: (v) => {
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{8,}$/.test(
            v
          );
        },
        message:
          "Password must contain 1 Uppercase, 1 Lowercase, 1 Special Character, 1 Number and the length must be 8 characters long",
      },
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          /^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(
            v
          );
        },
        message: "email is not valid",
      },
    },
    refreshToken:{
      type:String,
    }
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      id: this.id,
      username: this.username,
      email: this.email,
    },
    process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY_TIME }
  );
};

adminSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.ADMIN_REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY_TIME }
  );
};

export const Admin = mongoose.model("Admin", adminSchema);
