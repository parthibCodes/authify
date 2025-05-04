import { getAllUsers,deleteUsers,changeRoleType } from "../controllers/admin.controller.js";
import { Router } from "express";
import { verifyRoles } from "../middlewares/verifyRole.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/users',verifyJWT,verifyRoles("admin"),getAllUsers);     
router.delete('/users/:id',verifyJWT,verifyRoles("admin"),deleteUsers);
router.patch('/users/:id/role',verifyJWT,verifyRoles("admin"),changeRoleType);

export default router;