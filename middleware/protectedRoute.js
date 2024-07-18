import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import BikeOwner from '../model/bikeOwnerModel.js';
import { tokenBlacklist } from '../Controller/BikeOwnerController.js';

dotenv.config();

const getBikeOwnerIdFromToken = (req) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        throw new Error('No authorization header present');
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token || tokenBlacklist.has(token)) {
        throw new Error('Token is missing or blacklisted');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.bikeOwnerId;
};

// Middleware for bike owner authentication via JWT
const protectedRoute = async (req, res, next) => {
    try {
        const bikeOwnerId = getBikeOwnerIdFromToken(req);
   

        req.bikeOwnerId = bikeOwnerId;  // Set the decoded bike owner ID from JWT
        next(); // Proceed to next middleware or route handler
    } catch (error) {
        console.log("Error in bikeOwnerAuth middleware:", error.message);
        return res.status(401).send({ message: `Auth failed: ${error.message}`, success: false });
    }
};

export default protectedRoute;



// import jwt from 'jsonwebtoken';
// import User from '../model/userModel.js';


// const protectedRoute = async (req, res, next) => {
//     try {
//         const authHeader = req.header('Authorization');
//         console.log(authHeader, "token in protected route ?????");

//         if (!authHeader) {
//             return res.status(401).json({ error: 'Unauthorized - no token provided' });
//         }

//         // Remove "Bearer " from the token
//         const token = authHeader.split(' ')[1];
//         console.log(token, "token after removing Bearer");

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded) {
//             return res.status(401).json({ error: 'Unauthorized - token is not valid' });
//         }

//         console.log(decoded, "decoded in protected route>><<<");

//         const user = await User.findById(decoded.userId).select("-password");

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.log('Error from protectedRoute middleware', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export default protectedRoute;
