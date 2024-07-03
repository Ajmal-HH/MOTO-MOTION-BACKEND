import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userModel.js';

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
            res.cookie("jwt", "", {   
                httpOnly: false,
                expires: new Date(0),
              }); 
            return res.status(401).send({ message: "Auth failed", success: false });
        } else {
            next();
        }
    } catch (error) {
        console.log("Error =>",error.message);
        return res.status(401).send({ message: "Auth failed", success: false });
    }
};

const userAuth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send({ message: "Auth failed", success: false });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Auth failed", success: false });
            }
            req.userId = decoded.userId;
            next();
        });
    } catch (error) {
        console.log(error.message);
        return res.status(401).send({ message: "Auth failed", success: false });
    }
};

export { is_blocked, userAuth };
