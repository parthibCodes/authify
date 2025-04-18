import { connectDB } from "./db/db.js";
import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";

const PORT = process.env.PORT || 6000;

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is listening at port ${PORT}`);
    });
})
.catch((err)=>{
    console.log("Failed to start server due to DB connection error: ",err);
});