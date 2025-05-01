import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

export const getTokenConfig = (role,tokenType)=>{
    const upperRole = role.toUpperCase();
    const uppertokenType = tokenType.toUpperCase();

    if(!(upperRole && uppertokenType)){
        throw new ApiError(401,"Unauthorized access");
    }
    
}
