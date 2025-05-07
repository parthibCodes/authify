import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    fullname:{
        firstname:{
            type:String,
            required:[true,"Please enter your first name"],
            trim:true,
        },
        middlename:{
            type:String,
            trim:true,
        },
        lastname:{
            type:String,
            required:[true,"Please enter your last name"],
            trim:true,
        },
    },
    password:{
        type:String,
        required:[true, "password is required to create the account"],
        validate:{
            validator:(v)=>{
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{8,}$/.test(v);
            },
            message:"Password must contain 1 Uppercase, 1 Lowercase, 1 Special Character, 1 Number and the length must be 8 characters long",
        },
    },
    email:{
        type:String,
        required:true,
        validate:{
            validator:(v)=>{
                /^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(v);
            },
            message:"email is not valid",
        },
        unique:true,
    },
    refreshToken:{
        type:String,
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpires: {
        type: Date,
    }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function() {
    const isAdmin = this.role === "admin";
    return jwt.sign({
        id:this.id,
        role:this.role,
        username:this.username,
        email:this.email
    },isAdmin ? process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY : process.env.USER_ACCESS_TOKEN_SECRET_KEY,{expiresIn: isAdmin ? process.env.ADMIN_ACCESS_TOKEN_EXPIRY_TIME : process.env.USER_ACCESS_TOKEN_EXPIRY_TIME});
}

userSchema.methods.generateRefreshToken = async function(){
    const isAdmin = this.role === "admin";
    return jwt.sign({
        id:this.id,
    },isAdmin ? process.env.ADMIN_REFRESH_TOKEN_SECRET_KEY : process.env.USER_REFRESH_TOKEN_SECRET_KEY,{expiresIn:isAdmin ? process.env.ADMIN_REFRESH_TOKEN_EXPIRY_TIME : process.env.USER_REFRESH_TOKEN_EXPIRY_TIME});
}

userSchema.methods.generatePasswordResetToken = async function(){
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpires = Date.now() + 1000*60*15;

    return resetToken;
}

export const User = mongoose.model("User",userSchema);