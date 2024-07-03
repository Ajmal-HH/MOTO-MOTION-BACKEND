import express from 'express'
import protectedRoute from '../middleware/protectedRoute.js'
import { fetchChats, getReceiverData, getReciverDataOwner, sendMessage } from '../Controller/MessageController.js'
// import { getMessages, getReceiverData, messageSidebar, sendMessage} from '../Controller/MessageController.js'

const message_router = express.Router()


// message_router.get('/messages/:id',protectedRoute,getMessages)
// message_router.post('/send/:id',protectedRoute,sendMessage)
// message_router.get('/messagesidebar',protectedRoute,messageSidebar)
// message_router.get('/getreceiverdata',protectedRoute,getReceiverData)

message_router.post('/send',protectedRoute,sendMessage)
message_router.get('/fetchchats',protectedRoute,fetchChats)
message_router.get('/getreceiverdata',protectedRoute,getReceiverData)
message_router.get('/receiverdata/:receiverId',protectedRoute,getReciverDataOwner)



export default message_router