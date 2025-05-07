import { Router } from "express";
import { loginUser, logoutUser, registerUser, resendLink, verifyEmail ,forgotPassword, resetPassword} from "../controllers/user.controller.js";
import { verifyResetToken } from "../middlewares/verifyResetToken.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRoles } from "../middlewares/verifyRole.middleware.js";
const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',verifyJWT,logoutUser);
router.get('/verify/:token',verifyEmail);
router.get('/resend-verify',resendLink);
router.post('/forgot-password',forgotPassword);
router.get('/change-password', verifyResetToken, (req, res) => {
    return res.status(200).json({
      message: "Reset token is valid. You can now submit your new password.",
    });
  });
  
router.post('/change-password',verifyResetToken,resetPassword);

export default router;