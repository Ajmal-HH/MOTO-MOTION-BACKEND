import asyncHandler from 'express-async-handler'
import bcrypt from 'bcrypt'
import bikeOwner from '../model/bikeOwnerModel.js'
import generateToken from '../utils/generateToken.js'
import Bike from '../model/bikeModel.js'
import Booking from '../model/bookingModel.js'
import cloudinary from '../utils/cloudinary.js'


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const bikeOwnerSignup = asyncHandler(async (req, res) => {
    try {
        const { bikeowner_name, email, password, mobile } = req.body
        const errorMessages = {};
        if (bikeowner_name.trim() === '') {
            errorMessages.name = 'Empty name field';
        } else if (bikeowner_name.length < 3) {
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
        if (mobile.length === 0) {
            errorMessages.mobile = 'Mobile number is required'
        } else if (mobile.length >= 11) {
            errorMessages.mobile = 'mobile number must be 10 digits'
        }

        if (Object.keys(errorMessages).length > 0) {
            return res.status(400).json({ messages: errorMessages });
        }
        const ownerExist = await bikeOwner.findOne({ email })
        if (ownerExist) {
            res.status(400)
                .json({ message: 'This email is already exist Please Login' })
        } else {
            const spassword = await securePassword(password)

            const bikeowner = new bikeOwner({
                bikeowner_name,
                email,
                password: spassword,
                mobile
            })
            const bikeOwnerDetails = await bikeowner.save()
            if (bikeOwnerDetails) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(400)
                    .json({ message: 'Registration failed' })
            }
        }

    } catch (error) {
        console.log(error.message);
    }
})

const bikeOwnerLogin = asyncHandler(async (req, res) => {
    try {
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

        const bikeOwnerData = await bikeOwner.findOne({ email })
        req.session.ownerId = bikeOwnerData._id

        if (bikeOwnerData) {
            const passwordMatch = await bcrypt.compare(password, bikeOwnerData.password)
            if (passwordMatch) {
                if (!bikeOwnerData?.is_blocked) {
                    const ownerToken = generateToken(bikeOwnerData._id)
                    // res.cookie('bikeOwner-jwt', token, {
                    //     httpOnly: false,
                    //     secure: false,
                    //     sameSite: "strict",
                    // })
                    return res.status(200)
                        .json({
                            bikeOwnerData,
                            ownerToken
                        })
                } else {
                    res.status(403)
                        .json({ message: 'User is blocked by admin' })
                }
            } else {
                res.status(401)
                    .json({ message: 'Incorrect password' })
            }
        } else {
            res.status(401)
                .json({ message: 'Unauthorized user please signUp' })
        }
    } catch (error) {
        console.log(error.message);
    }
})

const loadOwnerDetails = async (req, res) => {
    console.log("entered to load owner detatils..");
    const ownerData = req.body
    console.log(ownerData,"ownerData......");
    const owner = await bikeOwner.findOne({ _id: ownerData._id })
    if (owner) {
        res.json(owner)
    } else {
        res.status(400)
            .json({ message: 'Error to fetch bike owner details' })
    }
}


const addBike = asyncHandler(async (req, res) => {
    try {
        const bikeowner_id = req.session.ownerId
        const { bikeName, bikeNO, location,
            bikeCC, rent, bikeType, details, address, pinCode } = req.body

            //   const imagePaths = req.files.map(file => file.filename);

         const images = req.files
         const uploadedImages = [];
         for (const image of images) {
             const result = await cloudinary.uploader.upload(image.path, {
                 folder: "MOTO MOTION"
             });
             uploadedImages.push(result.secure_url);
         }

        const existBike = await Bike.findOne({ bikeNO })
        if (existBike) {
            res.status(400)
                .json({ message: 'This bike is already exist' })
        } else {
            const bike = new Bike({
                bikeowner_id,
                bike_name: bikeName,
                bike_number: bikeNO,
                bike_type: bikeType,
                bike_cc: bikeCC,
                location,
                price: rent,
                details,
                address,
                pinCode,            
                image:uploadedImages
            })
            const bikeDetails = await bike.save()
            if (bikeDetails) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(400)
                    .json({ message: 'Bike adding failed' })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
})


const bikeList = async (req, res) => {
    try {
        const bikeOwnerId = req.session.ownerId
        const bike = await Bike.find({ bikeowner_id: bikeOwnerId })
        res.json(bike)
    } catch (error) {
        console.log(error.message);
    }
}

const deleteBike = async (req, res) => {
    try {
        const bikeId = req.query.id;
        try {
            const bike = await Bike.findByIdAndUpdate({ _id: bikeId }, { $set: { is_deleted: 1 } });
            res.status(200).json({ status: true });
        } catch (error) {
            console.error('Error Deleting bike:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {

    }
}

const loadOwnerEditBike = async (req, res) => {
    try {
        const bikeId = req.query.bikeId
        const bike = await Bike.findOne({ _id: bikeId })
        res.json(bike)
    } catch (error) {
        console.log(error.message);
    }
}

const ownerEditBike = async (req, res) => {
    try {
        const { _id, bikeName, bikeNO, locations,
            bikeCC, rent, bikeType, details, address, pinCode } = req.body

        const imagePaths = req.files.map(file => file.filename);

        if (imagePaths.length >= 3) {
            const bike = await Bike.findByIdAndUpdate(
                _id,
                {
                    $set: {
                        bike_name: bikeName,
                        bike_number: bikeNO,
                        bike_type: bikeType,
                        bike_cc: bikeCC,
                        location: locations,
                        price: rent,
                        details,
                        address,
                        pinCode,
                        image: imagePaths
                    }
                }
            );
            if (bike) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(400)
                    .json({ message: 'Failed to update the bike data' })
            }
        } else {
            const bike = await Bike.findByIdAndUpdate(
                _id,
                {
                    $set: {
                        bike_name: bikeName,
                        bike_number: bikeNO,
                        bike_type: bikeType,
                        bike_cc: bikeCC,
                        location: locations,
                        price: rent,
                        details,
                        address,
                        pinCode,
                    }
                }
            );
            if (bike) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(400)
                    .json({ message: 'Failed to update the bike data' })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logoutOwner = async (req, res) => {
    req.session.ownerId = null
    res.cookie("bikeOwner-jwt", "", {
        httpOnly: false,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Bike Owner logged out" });
}

const bookingList = async (req, res) => {
    try {
        const bikeOwnerId = req.session.ownerId
        const bookinglist = await Booking.find({ bikeOwner_id: bikeOwnerId })

        let bookingsWithBikes = [];
        for (const item of bookinglist) {
            let bike = await Bike.findById(item.bike_id);
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

const bikeOwnerDashboard = async (req, res) => {
    try {
        const ownerData = req.body
        console.log(ownerData,"ownerData......");

        const bookings = await Booking.find({ bikeOwner_id: id });
        const owner = await bikeOwner.findOne({ _id: id });
        const bikes = await Bike.find({ bikeowner_id: id });
        const totolBikes = bikes.length;
        const totalBookings = bookings.length;

        const revenue = await Booking.aggregate([
            {
                $match: { bikeOwner_id: id }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_amount" }
                }
            }
        ]);

        const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

        // Chart report
        const today1 = new Date();
        const currentMonth = today1.getMonth() + 1; // +1 because months are 0-based

        const monthlySales = await Booking.aggregate([
            {
                $match: { bikeOwner_id: id }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id.month': 1
                }
            }
        ]);


        // Initialize the structure to store monthly sales
        const monthlySalesArray = Array.from({ length: 12 }, () => 0);

        // Populate the structure
        monthlySales.forEach(({ _id, count }) => {
            const { month } = _id;
            monthlySalesArray[month - 1] = count; // month - 1 to make it 0-based index
        });

        // Slice to get only the months up to the current month
        const currentYearSalesArray = monthlySalesArray.slice(0, currentMonth);


        res.json({ totalBookings, totolBikes, owner, totalRevenue, monthlySales: currentYearSalesArray });
    } catch (error) {
        console.log("error in bikeOwnerDashboard", error.message);
        res.status(500).send("Internal Server Error");
    }
};




export {
    bikeOwnerSignup,
    bikeOwnerLogin,
    addBike,
    bikeList,
    deleteBike,
    loadOwnerEditBike,
    ownerEditBike,
    loadOwnerDetails,
    logoutOwner,
    bookingList,
    bikeOwnerDashboard

}