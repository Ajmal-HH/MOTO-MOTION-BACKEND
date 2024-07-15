
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userModel.js';
import { tokenBlacklist } from '../Controller/UserController.js';

dotenv.config();

const getUserIdFromToken = (req) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        throw new Error('No authorization header present');
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token || tokenBlacklist.has(token)) {
        throw new Error('Token is missing or blacklisted');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; 
};

// Middleware for checking if user is blocked
const is_blocked = async (req, res, next) => {
    try {
        const userId = getUserIdFromToken(req);
  
        const findUser = await User.findById(userId);
        if (findUser && findUser.isBlocked) {
            req.session.userData = null;
            req.session.otp = null;
            req.session.userId = null;
            req.session.forgUserId = null;
            return res.status(401).send({ message: "User is Blocked", success: false });
        } else {
            next(); // Proceed to next middleware
        }
    } catch (error) {
        console.log("Error in is_blocked middleware:", error.message);
        return res.status(401).send({ message: "Auth failed", success: false });
    }
};

// Middleware for user authentication via JWT
const userAuth = (req, res, next) => {
    try {
        const userId = getUserIdFromToken(req);
        req.userId = userId;  // Set the decoded user ID from JWT
        next(); // Proceed to next middleware or route handler
    } catch (error) {
        console.log("Error in userAuth middleware:", error.message);
        return res.status(401).send({ message: `Auth failed: ${error.message}`, success: false });
    }
};

export { is_blocked, userAuth };
