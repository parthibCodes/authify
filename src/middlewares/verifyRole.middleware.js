import { ApiError } from "../utils/ApiError.js"

export const verifyRoles = (...authorizedRoles)=>{
    
    return (req,res,next)=>{
//         console.log(req.user);
//         console.log("verifyRoles: role =", req.user?.role);
// console.log("verifyRoles: allowed =", authorizedRoles);

        if (!req.user || !req.user.role || !authorizedRoles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied");
        }        
        next();
    }
}