import User from '../model/userModel.js'
import Bikes from '../model/bikeModel.js'
import Booking from '../model/bookingModel.js'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




const checkAvailibility = async (req, res) => {
    try {
        const userId = req.userId
        const userVerified = await User.findOne({ _id: userId })
        if (userVerified.account_status === 'verified') {
            const { pickupDate, dropoffDate, id } = req.body
            let bookingDate = []
            bookingDate.push(pickupDate)
            bookingDate.push(dropoffDate)
            const bike = await Bikes.findOne({ _id: id })
            let availabe = false
            if (bike.availability.length > 0) {
                for (let i = 0; i < bike.availability.length; i++) {
                    if (pickupDate > bike.availability[i][1]) {
                        availabe = true
                    }
                    else if (pickupDate < bike.availability[i][0] && dropoffDate < bike.availability[i][0]) {
                        availabe = true
                    } else {
                        availabe = false
                    }
                }
            } else {
                availabe = true
            }
            if (availabe) {
                res.status(200)
                    .json({ status: true })
            } else {
                res.status(404)
                    .json({ message: 'Bike is not available on selected date.' })
            }
        }
        else if (userVerified.account_status === 'verifying document') {
            res.status(401)
                .json({ message: 'Documents are not verified Please try again later.' })
        } else {
            res.status(401)
                .json({ message: 'awaiting for document upload' })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const checkoutDetails = async (req, res) => {
    try {
        const bikeId = req.query.bikeId
        const bikeDetails = await Bikes.findById({ _id: bikeId })
        res.json(bikeDetails)
    } catch (error) {
        console.log(error.message);
    }
}
const conformBooking = async (req, res) => {
    try {
        const { pickUp, dropOff, bikeId, grandTotal, day } = req.body;
        const bookingDate = [pickUp, dropOff];
        const user_id = req.userId;

        const user = await User.findById(user_id);
        const bike = await Bikes.findById(bikeId);
        const bikeOwner_id = bike.bikeowner_id;

        console.log(process.env.CLIENT_SITE_URL.split(',')[0] ,"2 url....");

        // Determine the correct client site URL dynamically
        const clientSiteUrl = process.env.CLIENT_SITE_URL.includes(',')
            ? process.env.CLIENT_SITE_URL.split(',')[0] // Pick the first URL
            : process.env.CLIENT_SITE_URL;

        const sessionData = {
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: user.email,
            client_reference_id: bikeOwner_id.toString(), 
            line_items: [{
                price_data: {
                    currency: "INR",
                    product_data: {
                        name: bike.bike_name,
                        images: [bike.image[0]] 
                    },
                    unit_amount: grandTotal * 100,
                },
                quantity: 1
            }],
            success_url: `${clientSiteUrl}/booking-success`,
            cancel_url: `${clientSiteUrl}/bikes`,
        };

        await Bikes.findByIdAndUpdate(bikeId, {
            $push: { availability: bookingDate }
        });

        const session = await stripe.checkout.sessions.create(sessionData);

        const booking = new Booking({
            user_id,
            bike_id: bikeId,
            bikeOwner_id,
            pickup_date: pickUp,
            dropoff_date: dropOff,
            booking_status: 'confirmed',
            total_amount: grandTotal,
            payment_id: session.id,
            day
        });

        const booked = await booking.save();
        if (booked) {
            res.status(200).json({ status: true, url: session.url });
        } else {
            res.status(404).json({ message: 'An error occurred in booking. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




const bookingAction = async (req, res) => {
    try {
        const bookingId = req.query.bookingId
        const action = req.query.action
        const bookings = await Booking.findByIdAndUpdate(bookingId, {
            $set: {
                booking_status : action   
            }
        })
        res.status(200)
        .json({status : true})

    } catch (error) {

    }
}      

const cancelBooking = async(req,res) =>{
    try {
        const bookingId = req.query.bookingId
        const userId = req.session.userId
    
        const booking = await Booking.findByIdAndUpdate(bookingId, {
            $set: {
                booking_status : 'canceled'   
            }
        })

        await User.findByIdAndUpdate( { _id: userId },
            { $inc: { wallet: booking.total_amount } },
            { upsert: true, new: true }
          );

        res.status(200)
        .json({status : true}) 
    } catch (error) {
        console.log(error.message);
    }
}
    
export {
    checkAvailibility,
    checkoutDetails,
    conformBooking,
    bookingAction,
    cancelBooking
}