import multer from 'multer'

//multer......

const productStorage = multer.diskStorage({ 
    destination: (req,file,callback)=>{
        callback(null,'public/admin-assets/uploads/')
    },

    //extention
    filename: (req,file,callback)=>{
        callback(null,Date.now()+file.originalname)

    }
})

//upload parameters for multer
const uploadprdt = multer({
    storage : productStorage,
    // limits : {
    //     fileSize : 1024*1024*5
    // }
})

export default uploadprdt