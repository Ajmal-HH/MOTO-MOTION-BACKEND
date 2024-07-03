import Conversation from "../model/conversationModel.js"
import Message from "../model/messageModel.js"
import bikeOwner from '../model/bikeOwnerModel.js'
import User from "../model/userModel.js";


const sendMessage = async (req, res) => {
  try{    
        
    const { message , userId,senderId } = req.body;
    const myId=senderId
      if (!message) {
      return res.status(400).json({ error: 'Message is required' });
      }
      let chatId
      let chat = await Conversation.findOne({
          participants:{$all:[myId,userId]}
      });


      if(!chat){ 
          chat = await Conversation.create({
              participants :[myId,userId]
          })
      }
      chatId=chat._id 

      const newMessage = new Message({
        conversationId:chatId,
        senderId: myId ,
        receiverId: userId ,
        message ,
      })
      await newMessage.save();
      res.status(201).json({ message:"message created successfully"});
  }
  catch(error){
      console.log("error while creating message",error)
      res.status(500).json({error:"Internal server Error"})
  } 
};

//fetch all chats to a particular user

const fetchChats = async (req, res) => {
  try {
    
      const { id,myId } = req.query; //studentId
     
      const chat = await Conversation.findOne({
        participants: { $all: [myId, id] },
      }); 
      
      
      
      if (!chat) {return res.status(200).json([])};
      
      const messageData = await Message.find({conversationId:chat._id})
      res.status(200).json({messageData,message:"ChatMessages"});
  } catch (error) {
      console.error("Error in fetchChats:", error);
      res.status(500).json({ error, message: "Error while fetching messages" });
  }
};

const getReceiverData = async (req,res) =>{
    try {
        const {receiverId} = req.query
        const receiverData =  await bikeOwner.findOne({_id : receiverId})
        res.json(receiverData)
    } catch (error) {
      console.log("Error in getReceiverData : ", error.message );  
    }
}


const getReciverDataOwner = async (req,res) =>{
  try {
    const { receiverId } = req.params;
    const senderId = req.session.ownerId
    const receiverData = await User.findOne({_id : receiverId})
    res.json({receiverData,senderId})
  } catch (error) {
    console.log(error.message);
  }
}
export {
    sendMessage,
      fetchChats,    
      getReceiverData,
      getReciverDataOwner
      };





// import Conversation from "../model/conversationModel.js"
// import Message from "../model/messageModel.js"
// import User from "../model/userModel.js"
// import bikeOwner from '../model/bikeOwnerModel.js'
// // import { getReceiverSocket,io } from "../socket/socket.js"



// const sendMessage = async (req, res) => {
//     try {
//         const { message } = req.body
//         const { id: receiverId } = req.params
//         const senderId = req.user._id.toString() // changed

//         console.log("Messagessssss",message);
//         console.log(typeof receiverId, receiverId, "Type and Value of receiverId");
// console.log(typeof senderId, senderId, "Type and Value of senderId"); 

//         let conversation = await Conversation.findOne({
//             participants: { $all: [senderId, receiverId] }
//         })

//         if (!conversation) {
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId]
//             })
//         }

//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             message
//         })


//         if (newMessage) {
//             conversation.messages.push(newMessage._id)
//         }

//         await Promise.all([conversation.save(), newMessage.save()])

//         // SOCKET IO FUNCTIONALITY WILL GO HERE
//         const receiverSocketId = getReceiverSocketId(receiverId);
//         console.log(receiverSocketId,"receiverSocketIddddddd");

//         if (receiverSocketId) {
//             // io.to(<socket_id>).emit() used to send events to specific client
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }
//         res.status(201).json(newMessage)
//     } catch (error) {
//         console.log("error in sendMessage controller", error.message);
//         res.status(500).json({ error: 'Internal server error' })
//     }
// }

// const getMessages = async (req, res) => {
//     try {
//         const { id: userToChatId } = req.params;
//         const senderId = req.user._id

//         const conversation = await Conversation.findOne({
//             participants: { $all: [senderId, userToChatId] }
//         }).populate("messages")

//         if (!conversation) return res.status(200).json([])

//         const messages = conversation.messages

//         res.status(200).json(messages)
//     } catch (error) {
//         console.log("error in sendMessage controller", error.message);
//         res.status(500).json({ error: 'Internal server error' })
//     }
// }

// const messageSidebar = async (req, res) => {
//     try {
//         const logedInUser = req.user._id
//         const filteredUsers = await User.find({ _id: { $ne: logedInUser } }).select("-password")
//         // const filteredUsers =await bikeOwner.find().select("-password")
//         console.log(filteredUsers)
//         res.status(200).json(filteredUsers)
//     } catch (error) {
//         console.log('error in messagesidebar', error.message);
//         res.status(500).json({ error: 'Internal server error' })
//     }
// }

// const getReceiverData = async (req,res) =>{
//     try {
//         const {receiverId} = req.query
//         const receiverData =  await bikeOwner.findOne({_id : receiverId})
//         res.json(receiverData)
//     } catch (error) {
//       console.log("Error in getReceiverData : ", error.message );  
//     }
// }

// export {
//     sendMessage,
//     getMessages,
//     messageSidebar,
//     // sendMessage1,
//     getReceiverData
// }

