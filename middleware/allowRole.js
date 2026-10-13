import {ApiResponse} from '../utils/respatterns.js'

export default function allowRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {   
            return res.status(403).json(new ApiResponse(false, null, "Access denied. You do not have permission to perform this action."));
        }
        next();
    };
};  