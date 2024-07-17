import asyncHandler from 'express-async-handler'
import User from '../model/userModel.js'
import generateToken from '../utils/generateToken.js'
import bcrypt from 'bcrypt'
import bikeOwner from '../model/bikeOwnerModel.js'
import Booking from '../model/bookingModel.js'
import Bikes from '../model/bikeModel.js'

export const tokenBlacklist = new Set();


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const adminAuth = asyncHandler(async (req, res) => {
    const { email, password } = req.body
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
    const adminData = await User.findOne({ email })

    if (adminData) {
        if (adminData.isAdmin) {
            const matchPassword = await bcrypt.compare(password, adminData.password)

            if (matchPassword) {
                const admintoken = generateToken(adminData._id)
                // res.cookie('jwt-admin', token, {
                //     httpOnly: false,
                //     secure: false,
                //     sameSite: "strict",
                // })
                return res.status(200)
                    .json({ message: 'Login Successfully',admintoken })
            } else {
                res.status(401)
                    .json({ message: 'Invalid email or password' })
            }
        } else {
            res.status(400)
                .json({ message: 'You are not Admin' })
        }
    } else {
        res.status(400)
            .json({ message: 'You are not Admin' })
    }

})

const userList = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false })
        res.json(users)
    } catch (error) {
        console.log(error.message);
    }
}

const verifyDocumentList = async (req, res) => {
    try {
        const users = await User.find({ account_status: 'verifying document' })
        res.json(users)
    } catch (error) {
        console.log(error.message);
    }
}

const bikeOwnerList = async (req, res) => {
    try {
        const owners = await bikeOwner.find()
        res.json(owners)
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    const userId = req.query.id;
    try {
        const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: 1 } });
        res.status(200).json({ status: true });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const unblockUser = async (req, res) => {
    const userId = req.query.id;
    try {
        const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: 0 } });
        res.status(200).json({ status: true });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const blockOwner = async (req, res) => {
    const ownerId = req.query.id;
    try {
        await bikeOwner.findByIdAndUpdate({ _id: ownerId }, { $set: { is_blocked: 1 } });
        res.status(200).json({ status: true });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const unblockOwner = async (req, res) => {
    const ownerId = req.query.id;
    try {
        await bikeOwner.findByIdAndUpdate({ _id: ownerId }, { $set: { is_blocked: 0 } });
        res.status(200).json({ status: true });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addNewUser = async (req, res) => {
    const { name, email, password, mobile } = req.body
    const existUser = await User.findOne({ email })
    if (existUser) {
        res.status(400)
            .json({ message: 'User is already exist!!!' })
    } else {
        const spassword = await securePassword(password)
        const user = new User({
            name,
            email,
            password: spassword,
            mobile
        })
        const userDetails = await user.save()
        if (userDetails) {
            res.status(200)
                .json({ status: true })
        } else {
            res.status(400)
                .json({ message: 'New user adding failed' })
        }
    }
}

const loadAdminEditUser = async (req, res) => {
    try {
        const userId = req.query.userId
        const user = await User.findOne({ _id: userId })
        res.json(user)
    } catch (error) {
        console.log(error.message);
    }
}

const adminEdituser = async (req, res) => {
    try {
        const { _id, name, mobile } = req.body
        const user = await User.findByIdAndUpdate(
            _id,
            { $set: { name, mobile } }
        );

        if (user) {
            res.status(200)
                .json({ status: true })
        } else {
            res.status(400)
                .json({ message: 'Failed to update the user data' })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userDetails = async (req, res) => {
    const userId = req.query.userId
    const user = await User.findOne({ _id: userId })
    res.json({ user })
}

const verifyDocument = async (req, res) => {
    try {
        const userId = req.query.userId
        const user = await User.findByIdAndUpdate({ _id: userId }, {
            $set: {
                account_status: 'verified'
            }
        })
        if (user) {
            res.json({ user })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addbikeOwner = async (req, res) => {
    try {
        const { bikeowner_name, email, password, mobile } = req.body
        const existOwner = await bikeOwner.findOne({ email })
        if (existOwner) {
            res.status(400)
                .json({ message: 'Owner  is already exist!!!' })
        } else {
            const spassword = await securePassword(password)
            const owner = new bikeOwner({
                bikeowner_name,
                email,
                password: spassword,
                mobile
            })
            const ownerDetails = await owner.save()
            if (ownerDetails) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(400)
                    .json({ message: 'New Owner adding failed' })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadAdminOwnerEdit = async (req, res) => {
    try {
        const ownerId = req.query.ownerId
        const owner = await bikeOwner.findOne({ _id: ownerId })
        res.json(owner)
    } catch (error) {
        console.log(error.message);
    }
}

const adminEditOwer = async (req, res) => {
    try {
        const { _id, name, mobile } = req.body
        const owner = await bikeOwner.findByIdAndUpdate(
            _id,
            { $set: { bikeowner_name: name, mobile } }
        );

        if (owner) {
            res.status(200)
                .json({ status: true })
        } else {
            res.status(400)
                .json({ message: 'Failed to update the owner data' })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logoutAdmin = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        tokenBlacklist.add(token);
        res.status(200).json({ message: 'Admin logged out successfully' });
    } else {
        res.status(400).json({ message: 'No token provided' });
    }
}

const adminBookingList = async (req, res) => {
    try {
        const bookinglist = await Booking.find()

        let bookingsWithBikes = [];
        for (const item of bookinglist) {
            let bike = await Bikes.findById(item.bike_id);
            bookingsWithBikes.push({
                ...item._doc,  // Include all fields of booking
                bike,         // Include bike details
            });
        }
        res.json(bookingsWithBikes)
    } catch (error) {
        console.log(error.message);
    }
}

const adminBikeList = async (req, res) => {
    try {
        const bikeList = await Bikes.find()
        res.json(bikeList)
    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboard = async (req, res) => {
    try {
        const bookings = await Booking.find().count()
        const customers = await User.find().count()
        const bikeOwners = await bikeOwner.find().count()
        const bikes = await Bikes.find().count()
        const revenue = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_amount" }
                }
            }
        ]);
        const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

        //chart report

        const today1 = new Date();
        const currentMonth = today1.getMonth() + 1; // +1 because months are 0-based

        const monthlySales = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        $month: '$createdAt'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id': 1
                }
            }
        ]);

        const monthlySalesArray = Array.from({ length: currentMonth }, (_, index) => {
            const monthData = monthlySales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });


        //user growth..
        const usersGrowth = await User.aggregate([
            {
                $match: {
                    isBlocked: false, // filtered by checking blocked users
                },
            },
            {
                $project: {
                    month: { $month: '$date' }, // extract month from the date field
                },
            },
            {
                $group: {
                    _id: '$month',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1, // sort by month
                },
            },
        ]);
        
        const usersGrowthArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = usersGrowth.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });

        //partners growth...
        const partnersGrowth = await bikeOwner.aggregate([
            {
                $match: {
                    is_blocked: false, // filtered by checking blocked users
                },
            },
            {
                $project: {
                    month: { $month: '$created_On' }, // extract month from the date field
                },
            },
            {
                $group: {
                    _id: '$month',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1, // sort by month
                },
            },
        ]);
        
        const partnersGrowthArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = partnersGrowth.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });



        res.json({ bookings, customers, bikeOwners, bikes, totalRevenue, monthlySalesArray, usersGrowthArray,partnersGrowthArray })

    } catch (error) {
        console.log("error from adminDashboard", error.message);
    }
}


export {
    adminAuth,
    userList,
    verifyDocumentList,
    bikeOwnerList,
    blockUser,
    unblockUser,
    blockOwner,
    unblockOwner,
    addNewUser,
    loadAdminEditUser,
    adminEdituser,
    addbikeOwner,
    loadAdminOwnerEdit,
    adminEditOwer,
    userDetails,
    verifyDocument,
    adminBookingList,
    adminBikeList,
    logoutAdmin,
    adminDashboard
}