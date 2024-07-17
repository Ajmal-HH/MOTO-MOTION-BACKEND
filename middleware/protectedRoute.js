import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'

const protectedRoute = async (req,res,next) =>{
    try {
        const token = req.header('Authorization');
        console.log(token,"token in protectedroute...");

        if(!token){
            res.status(401).json({error : 'Unauthorized-no token'})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            res.status(401).json({error : 'Unauthorized-no token'})
        }
        
        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            return res.status(404).json({error :  "user nor found"})
        }
        req.user = user
        next()
    } catch (error) {
        console.log('error from protectedRoute middleware',error.message)
        res.status(500).json({error : 'Internal server error'})
    }
}

export default protectedRoute;