


import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log(authHeader, "token in protected route ?????");

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized - no token provided' });
        }

        // Remove "Bearer " from the token
        const token = authHeader.split(' ')[1];
        console.log(token, "token after removing Bearer");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized - token is not valid' });
        }

        console.log(decoded, "decoded in protected route>><<<");

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Error from protectedRoute middleware', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default protectedRoute;
