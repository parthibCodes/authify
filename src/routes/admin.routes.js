import { getAllUsers } from "../controllers/admin.controller.js";
import { Router } from "express";
import { verifyRoles } from "../middlewares/verifyRole.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/users',verifyJWT,verifyRoles("admin"),getAllUsers);     

export default router;