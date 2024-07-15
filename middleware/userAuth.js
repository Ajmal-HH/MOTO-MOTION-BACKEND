// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import User from '../model/userModel.js';
// import { tokenBlacklist } from '../Controller/UserController.js';

// dotenv.config();
// // Middleware for checking if user is blocked
// const is_blocked = async (req, res, next) => {
//     try {
//       const userId = req.session.userId;
//       console.log(userId, "id in middleware");
  
//       if (!userId) {
//         return res.redirect('/'); // Redirect or handle as per your application's logic
//       }
  
//       const findUser = await User.findById(userId);
//       if (findUser && findUser.isBlocked) {
//         req.session.userData = null
//         req.session.otp = null
//         req.session.userId = null
//         req.session.forgUserId = null
//         const token = req.headers.authorization?.split(' ')[1];
//         if (token) {
//           tokenBlacklist.add(token);
//         }
//         return res.status(401).send({ message: "User is Blocked", success: false });
//       } else {
//         next(); // Proceed to next middleware
//       }
//     } catch (error) {
//       console.log("Error in is_blocked middleware:", error.message);
//       return res.status(401).send({ message: "Auth failed", success: false });
//     }
//   };
  
//   // Middleware for user authentication via JWT
//   const userAuth = (req, res, next) => {
//     try {
//       const authorizationHeader = req.headers.authorization;
//       if (!authorizationHeader) {
//         console.log("No authorization header present");
//         return res.status(401).send({ message: "Auth failed: No authorization header", success: false });
//       }
  
//       const token = authorizationHeader.split(' ')[1];
//       console.log("Token received:", token);
  
//       if (!token || tokenBlacklist.has(token)) {
//         console.log("Token is missing or blacklisted");
//         return res.status(401).send({ message: "Auth failed: Token is missing or blacklisted", success: false });
//       }
  
//       jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//           console.log("JWT verification error:", err.message);
//           return res.status(401).send({ message: "Auth failed: JWT verification error", success: false });
//         }
//         req.userId = decoded.userId; // Set the decoded user ID from JWT
//         console.log("Token decoded successfully:", decoded);
//         next(); // Proceed to next middleware or route handler
//       });
//     } catch (error) {
//       console.log("Error in userAuth middleware:", error.message);
//       return res.status(401).send({ message: "Auth failed: Internal server error", success: false });
//     }
//   };
  
  

// export { is_blocked , userAuth };


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userModel.js';
import { tokenBlacklist } from '../controller/userController.js';

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
    return decoded.id;  // Ensure your token includes the user ID as 'id'
};

// Middleware for checking if user is blocked
const is_blocked = async (req, res, next) => {
    try {
        const userId = getUserIdFromToken(req);
        console.log(userId, "id in middleware");
  
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
