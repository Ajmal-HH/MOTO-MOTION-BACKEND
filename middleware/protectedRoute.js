import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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
        return res.status(401).json({ message: `Auth failed: ${error.message}`, success: false });
    }
};

export default protectedRoute;



