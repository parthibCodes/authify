import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users",userRoutes);
import adminRoutes from "./routes/admin.routes.js";
app.use("/api/v1/admin",adminRoutes);


export {app};