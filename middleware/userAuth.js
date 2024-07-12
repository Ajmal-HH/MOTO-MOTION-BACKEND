import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userModel.js';
import { tokenBlacklist } from '../Controller/UserController.js';

dotenv.config();

const is_blocked = async (req, res, next) => {
    try {
        const id = req.session.userId;
        if (!id) {
            return res.redirect('/');
        }

        const findUser = await User.findById(id);
        if (findUser && findUser.isBlocked) {
            req.session = null;
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                tokenBlacklist.add(token);
            }
            return res.status(401).send({ message: "User is Blocked", success: false });
        } else {
            console.log('hello');
            next();
        }
    } catch (error) {
        console.log("Error =>", error.message);
        return res.status(401).send({ message: "Auth failed", success: false });
    }
};



const userAuth = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.log("No authorization header present");
            return res.status(401).send({ message: "Auth failed: No authorization header", success: false });
        }

        const token = authorizationHeader.split(' ')[1];
        console.log("Token received:", token);

        if (!token || tokenBlacklist.has(token)) {
            console.log("Token is missing or blacklisted");
            return res.status(401).send({ message: "Auth failed: Token is missing or blacklisted", success: false });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("JWT verification error:", err.message);
                return res.status(401).send({ message: "Auth failed: JWT verification error", success: false });
            }
            req.userId = decoded.userId;
            console.log("Token decoded successfully:", decoded);
            next();
        });
    } catch (error) {
        console.log("Error in userAuth middleware:", error.message);
        return res.status(401).send({ message: "Auth failed: Internal server error", success: false });
    }
};


export { is_blocked , userAuth };
