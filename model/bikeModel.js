import mongoose from 'mongoose'

const bikeSchema = mongoose.Schema({
    bikeowner_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    bike_name: {
        type: String,
        required: true
    },
    bike_number: {
        type: String,
        required: true
    },
    bike_type: {
        type: String,
        required: true
    },
    bike_cc: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    availability: {
        type: Array,
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    image: {
        type: Array,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pinCode: {
        type: Number,
        required: true
    },
    reviews: [
        {
            username: {
                type: String,
                required: true

            },
            review: {
                type: String,
                required: true

            },
            date : {
                type : Date,
                required : true
            }
        }],
    created_On: {
        type: Date,
        default: Date.now()
    }

})

const Bike = mongoose.model('Bike', bikeSchema)

export default Bike