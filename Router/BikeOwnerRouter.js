import express from 'express'
import {    addBike, bikeList, bikeOwnerDashboard, bikeOwnerLogin, bikeOwnerSignup, bookingList, deleteBike, loadOwnerDetails, loadOwnerEditBike, logoutOwner, ownerEditBike } from '../Controller/BikeOwnerController.js'
import { bookingAction } from '../Controller/BookingController.js'
import uploadprdt from '../utils/multer.js'

const bikeowner_router = express.Router()

bikeowner_router.use(express.static('public'))


bikeowner_router.post('/bikeowner-signup',bikeOwnerSignup)
bikeowner_router.post('/bikeowner-login',bikeOwnerLogin)
bikeowner_router.post('/bikeowner-dashboard',bikeOwnerDashboard)
bikeowner_router.get('/loadowner-details',loadOwnerDetails)
bikeowner_router.post('/addbike',uploadprdt.array('image'),addBike)
bikeowner_router.get('/bike-list',bikeList)
bikeowner_router.get('/deletebike',deleteBike)
bikeowner_router.get('/bikeowner-loadbikeedit',loadOwnerEditBike)
bikeowner_router.post('/bikeowner-editbike',uploadprdt.array('image'),ownerEditBike)
bikeowner_router.post('/booking-list',bookingList)
bikeowner_router.get('/action-booking',bookingAction)
bikeowner_router.get('/owner-logout',logoutOwner)


    
export default bikeowner_router  