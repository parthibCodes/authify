import { ApiError } from "../utils/ApiError.js";

const dataValidator = (incomingData,requiredFields,responseObj)=>{
    const missingFields = requiredFields.filter((field)=>{
        return !Object.keys(incomingData).includes(field);
    }).map((field)=>field);

    if(missingFields.length > 0){
        throw new ApiError(400,`Missing required field(s): ${missingFields.join(', ')}`);
    }
    return true;
}

export {dataValidator};