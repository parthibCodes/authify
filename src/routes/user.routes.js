import { Router } from "express";
import { loginUser, logoutUser, registerUser, verifyEmail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRoles } from "../middlewares/verifyRole.middleware.js";
const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',verifyJWT,logoutUser);
router.get('/verify/:token',verifyEmail);

export default router;