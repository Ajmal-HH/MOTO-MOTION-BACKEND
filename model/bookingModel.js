import mongoose from 'mongoose'

const bookingSchema = mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
         required : true
    },
    bike_id : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    bikeOwner_id : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    pickup_date : {
        type : Date,
        required : true
    },
    dropoff_date : {
        type : Date,
        required : true
    },
    booking_status : {
        type : String,
        required  : true
    },
    total_amount : {
        type : Number,
        required : true
    },
    payment_id : {
        type : String,
        required : true, 
    },
    day : {
        type : Number,
        required : true
    }

},{timestamps : true})

const Booking =   mongoose.model('Booking',bookingSchema)

export default Booking