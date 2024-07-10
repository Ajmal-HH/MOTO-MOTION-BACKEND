import express from 'express';
import {
  addDocument,
  bikeDetails,
  bikeReview,
  editUser,
  filterBikes,
  googleAuth,
  loadBikes,
  loadEditUser,
  loadHomePage,
  logoutUser,
  resendOTP,
  setNewPassword,
  userBookingList,
  userProfile,
  verifyEmailForgotPass,
  verifyForgPasOTP,
  verifyLogin,
  verifyOTP,
  verifyUser,
  wallet
} from '../Controller/UserController.js';
import { cancelBooking, checkAvailibility, checkoutDetails, conformBooking } from '../Controller/BookingController.js';
import { is_blocked, userAuth } from '../middleware/userAuth.js';
import multer from 'multer';

const user_router = express.Router();

user_router.use(express.static('public'));

// multer configuration
const productStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/admin-assets/uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  }
});

const uploadprdt = multer({
  storage: productStorage,
});

// Routes
user_router.post('/verifyuser', verifyUser);
user_router.get('/resentOTP', resendOTP);
user_router.post('/verifyOTP', verifyOTP);
user_router.post('/login', verifyLogin);
user_router.post('/google-auth', googleAuth);
user_router.get('/load-home', loadHomePage);
user_router.get('/bikes', loadBikes);
user_router.get('/bike-details', bikeDetails);
user_router.get('/userprofile', userAuth, is_blocked, userProfile);
user_router.post('/add-document', uploadprdt.array('document'), addDocument);
user_router.get('/load-edituser', userAuth, loadEditUser);
user_router.post('/edituser', userAuth, editUser);
user_router.get('/user-logout', logoutUser);
user_router.post('/forgot-password', verifyEmailForgotPass);
user_router.post('/verify-forgOTP', verifyForgPasOTP);
user_router.post('/set-newpass', setNewPassword);
user_router.post('/checkavailibility', userAuth, checkAvailibility);
user_router.get('/checkout', userAuth, is_blocked, checkoutDetails);
user_router.post('/bike-booking', userAuth, conformBooking);
user_router.get('/user-bookinglist', userAuth, userBookingList);
user_router.get('/filterbikes', filterBikes);
user_router.post('/bike-review', bikeReview);
user_router.get('/wallet', wallet);
user_router.get('/cancel-booking', cancelBooking);

export default user_router;
