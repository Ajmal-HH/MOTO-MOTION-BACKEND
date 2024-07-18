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
    
      const { id,myId } = req.query; //userId
     
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
        console.log(receiverId,"receiverId");
        const receiverData =  await bikeOwner.findOne({_id : receiverId})
        console.log(receiverData,"receiverData");
        res.json(receiverData)
    } catch (error) {
      console.log("Error in getReceiverData : ", error.message );  
    }
}


const getReciverDataOwner = async (req,res) =>{
  try {
    const { receiverId } = req.params;
    const ownerData = req.body.bikeOwnerData
    console.log(ownerData,"Ownerdata");
    const senderId = ownerData._id
    const receiverData = await User.findOne({_id : receiverId})
    // res.json({receiverData,senderId})
    res.json({receiverData})
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



