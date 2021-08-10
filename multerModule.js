const multer = require('multer');

const storagePath = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'photo');
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+'_'+file.originalname);
    }
});

const Filter = (req, file, cb) => {
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
        cb(null, true);
    else
        cb(null, false);
 }

 module.exports = multer({storage: storagePath, fileFilter: Filter}).single('image');