import  mongoose  from "mongoose";

const bikeOwnerSchema = mongoose.Schema({
    bikeowner_name :{
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String ,
        required : true
    },
    mobile : {
        type : Number,
        required : true
    },
    is_blocked : {
        type : Boolean,
        default : false
    },
    created_On : {
        type : Date,
        default : Date.now()
    }
})

const bikeOwner = mongoose.model('bikeOwner',bikeOwnerSchema)

export default bikeOwner