import asyncHandler from 'express-async-handler'
import User from '../model/userModel.js'
import Bikes from '../model/bikeModel.js'
import generateToken from '../utils/generateToken.js'
import { sendMail } from '../utils/nodemailer.js'
import bcrypt from 'bcrypt'
import Booking from '../model/bookingModel.js'
import jwt from 'jsonwebtoken'
import Bike from '../model/bikeModel.js'

export const tokenBlacklist = new Set();



const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);    
    }   
}

const verifyUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body
        const errorMessages = {};
        if(name.trim() === ''){
            errorMessages.name = 'Empty name field';
        }else if(name.length<3){
            errorMessages.email = 'Name must be atleast 3 characters'
        }
        if (email.trim() === '') {
            errorMessages.email = 'Empty email field';
        } else if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(email)) {
            errorMessages.email = 'Please enter a valid gmail address (e.g., example@gmail.com).';
        }
        if (password.trim() === '') {
            errorMessages.password = 'Empty password field';
        } else if (password.length < 6) {
            errorMessages.password = 'Password must be at least 6 characters long';
        }
        if(mobile.length ===0){
            errorMessages.mobile = 'Mobile number is required'
        }else if(mobile.length>=11){
            errorMessages.mobile  ='mobile number must be 10 digits'
        }

        if (Object.keys(errorMessages).length > 0) {
            return res.status(400).json({ messages: errorMessages });
        }

        const userExist = await User.findOne({ email })
        if (userExist) {
            res.status(400).json({message:'User is already exists..'})
        }else{
            sendMail(email, req)
            .then(generatedOTP => {
                const OTP = parseInt(generatedOTP, 10);
                res.status(200)
                .json({OTP})
            })
            .catch(error => {
                console.error("Error sending mail:", error);
            });
               
    } 
    } catch (error) {
        console.log(error.message);
    }
})

const resendOTP = async(req,res)=>{
    const userData = req.body
    const {name,email} = userData
    sendMail(email,name,req)
    res.status(200)

}

const verifyOTP = asyncHandler(async(req,res)=>{
    const enteredOTP = req.body.otp
    const generatedOTP = req.body.generatedOTP
    const userData = req.body.userData
    const OTP = parseInt(enteredOTP)
    const GOTP = parseInt(generatedOTP)
    
    if(OTP===GOTP){
        const {name,email, password, mobile } = userData
        const spassword = await securePassword(password)
        const user = new User({
            name,
            email,
            password : spassword,
            mobile
        })
        const userDetails =  await user.save()
        if(userDetails){
            res.status(200)
            .json({status : true})
        }else{
            res.status(400)
            .json({message:'Registration failed'})
        }
    }else{
        res.status(400)
        .json({message : 'Invalid OTP'})
    }
})


const verifyLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const errorMessages = {};

        if (email.trim() === '') {
            errorMessages.email = 'Empty email field';
        } else if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(email)) {
            errorMessages.email = 'Please enter a valid gmail address (e.g., example@gmail.com).';
        }

        if (password.trim() === '') {
            errorMessages.password = 'Empty password field';
        } 

        if (Object.keys(errorMessages).length > 0) {
            return res.status(400).json({ messages: errorMessages });
        }

        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(401).json({ message: 'Unauthorized user please signUp' });
        }


        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        if (userData?.isBlocked) {
            return res.status(403).json({ message: 'User is blocked by admin' });
        }


        const token = generateToken(userData._id);

        return res.status(200).json({ status: true, token });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const loadHomePage = async (req,res) =>{
    try {
        const bikes = await Bike.find()
        res.json(bikes)
    } catch (error) {
        console.log("error from loadHomePage",error.message);
    }
}

const loadBikes = asyncHandler(async(req,res)=>{
    try {
        const bikes = await Bikes.find({is_deleted : false})
        res.json(bikes)
    } catch (error) {
        console.log(error.message);  
        res.status(500)
    }
})
 
const bikeDetails = asyncHandler(async(req,res)=>{
    const bikeId = req.query.bikeId
    const bikeDetails = await Bikes.findById({_id : bikeId})
    res.json(bikeDetails)   
})

const userProfile = async(req,res) =>{
    const userId = req.userId
    const user = await User.findOne({_id : userId})
    res.status(200).json(user)
}

const addDocument = async(req,res)=>{
    const userId = req.query.userId
    const documentPaths = req.files.map(file => file.filename);
    if(documentPaths){
        const user = await User.findByIdAndUpdate({_id : userId},{
            $set : {
                document : documentPaths,
                account_status : 'verifying document'
            }
        })
            res.status(200).json({status : true})
    }else{
        res.status(500)
        .json({message : 'Internal server error'})
    }
}

const loadEditUser = async (req,res) =>{
    const userId = req.query.userId
    const user = await User.findOne({_id : userId})
    res.json(user)
}

const editUser = async(req, res) =>{
    try {
        const {_id, name, mobile} = req.body
        const user = await User.findByIdAndUpdate(
            _id,
            { $set: { name, mobile } } 
        );
        
        if(user){
            res.status(200)
            .json({status : true})
        }else{
            res.status(400)
            .json({message : 'Failed to update the user data'})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const logoutUser = asyncHandler(async (req, res) => {
    req.session.userData = null
    req.session.otp = null
    req.session.userId = null
    req.session.forgUserId = null
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        tokenBlacklist.add(token);
        res.status(200).json({ message: 'User logged out successfully' });
    } else {
        res.status(400).json({ message: 'No token provided' });
    }
  });   



  const verifyEmailForgotPass = async (req,res) =>{
    const {email} =  req.body
    const user = await User.findOne({email})
    if(user){
        const forgUserId = user._id 
        sendMail(email,req)
        res.status(200)
        .json(forgUserId)
    }else{  
        res.status(401)  
        .json({message : 'Unauthorized user.'})
    }        
  }

  const verifyForgPasOTP = async (req,res)=>{
    const enteredOTP = req.body.otp
    const generatedOTP = req.body.generatedOTP
    const OTP = parseInt(enteredOTP)
    const GOTP = parseInt(generatedOTP)
    if(OTP === GOTP){
        res.status(200)
        .json({status : true})
    }else{
        res.status(400)
        .json({message : 'Invalid OTP'})
    }
  }

  const setNewPassword = async (req,res) =>{
        try {
            const {password} = req.body
            const userId =  req.session.forgUserId
            const spassword = await securePassword(password)
            const user = await User.findByIdAndUpdate(userId,
              {  $set : {
                    password : spassword
              } } )
              if(user){   
                res.status(200)
                .json({status : true})
              }else{
                res.status(400)
                json({message:'Failed update user password please try again later'})
              }
        } catch (error) {
            console.log(error.message);
        }
  }

  const googleAuth =async (req,res)=>{
    const {name,email} = req.body
    const userData = await User.findOne({email})
    if(userData){
        req.session.userId = userData._id
        if(!userData?.isBlocked ){
            const token = generateToken(userData._id);
            res.cookie('jwt',token,{
                httpOnly : false,
                secure : false,
                sameSite : "strict",
            })
               res.status(200)
              .json({status : true})
        }else{
            res.status(403)
            .json({message : 'User is blocked by admin'})
        }
    }else{
        const password = process.env.USER_PASSWORD
        const user = new User({
            name,
            email,
            password
        })
        const userDetails =  await user.save()
        if(userDetails){
            req.session.userId = userDetails._id
            const token = generateToken(userDetails._id);
            res.cookie('jwt',token,{
                httpOnly : false,
                secure : false,
                sameSite : "strict",
            })
            res.status(200)
            .json({status : true})
        }else{
            res.status(400)
            json({message:'Authentication failed'})
        }
    }
  }


const userBookingList = async (req, res) => {
    try {
      const userId = req.userId;
      const bookinglist = await Booking.find({ user_id: userId });
  
      let bookingsWithBikes = [];
      for (const item of bookinglist) {
        let bike = await Bikes.findById(item.bike_id);
        bookingsWithBikes.push({
          ...item._doc,  // Include all fields of booking
          bike,         // Include bike details
        });
      }
  
      res.json(bookingsWithBikes);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
 

  const filterBikes = async (req,res) =>{
    try {
        const { price, location, biketype } = req.query;
        let query = {};

        if (location) query.location = location;
        if (biketype) query.bike_type = biketype;

        let bikes;
        if (price === 'Low-High') {
            bikes = await Bikes.find(query).sort({ price: 1 });
        } else if (price === 'High-Low') {
            bikes = await Bikes.find(query).sort({ price: -1 });
        } else {
            bikes = await Bikes.find(query);
        }

        res.json(bikes);
    } catch (error) {
        console.error(error);
        res.status(500)
    }
}

const bikeReview = async(req,res) =>{
    try {
        const {review,bikeId} = req.body
        if(review.trim().length !=0){
        const userId = req.userId
        const user = await User.findOne({_id : userId})
        const userReview = {
            username: user.name,
            review: review,
            date : Date.now()
        };
        const bike = await Bikes.findByIdAndUpdate(bikeId,
            { $push: { reviews: userReview } },
            { new: true });

            res.status(200)
            .json({message: 'Review added successfully', username: user.name, date : userReview.date});
        }
  
    } catch (error) {
        console.log(error.message);
    }
}
  
const wallet = async (req,res) =>{
    try {
        const userId = req.userId
        const user = await User.findOne({_id : userId})
        res.json(user.wallet)
    } catch (error) {
        console.log(error.message);
    }
}


  


export { 
    verifyUser,
    resendOTP,
    verifyOTP,
    verifyLogin,
    logoutUser ,
    loadHomePage,
    loadBikes,
    bikeDetails,
    userProfile,
    addDocument,
    loadEditUser, 
    editUser,
    verifyEmailForgotPass,
    verifyForgPasOTP,
    setNewPassword,
    googleAuth,
    userBookingList,
    filterBikes,
    bikeReview,
    wallet
}