import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique  :true   
    },
    password : {
        type : String,
        required : true
    },
    mobile : {
        type : Number,
        // required : true
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    date : {
        type : Date,
        default : Date.now()
    },
    account_status : {
        type : String,
        default : 'awaiting for document upload'
    },
    document : {
        type : Array,
        default : null
    },
    wallet : {
        type : Number,
        default : 0
    }
})

const User = mongoose.model('User',userSchema)

export default User