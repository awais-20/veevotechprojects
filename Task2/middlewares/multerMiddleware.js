const path = require("path");
const multer = require('multer');


    const storage  = multer.diskStorage({
        destination: function(req, file, cb){
             cb(null, 'uploads/');
         },
        
        filename: function(req, file, cb){
            const filename = Date.now()+ path.extname(file.originalname);
            cb(null, file.fieldname + "-" + filename);
                 }
         });
         
   const upload = multer({storage});
         module.exports = {
            upload
         }
         