const express =require("express");
const app = express();
const isAuth = require('../middlewares/isAuth');
const {userRegister, userLogin, viewProfile, updateProfile, logout, fileupload, sendData, users} = require('../Controllers/userController');
const{verifyotp, dashboard} = require('../utilities/otp_service');
const router = express.Router();
const {upload} = require('../middlewares/multerMiddleware');
router.post('/register', upload.single("photo"), userRegister);
router.post('/login',  upload.none(), userLogin);
router.get('/users', users);

router.get('/viewProfile', isAuth, viewProfile);
router.put('/updateProfile', upload.single("photo"),isAuth, updateProfile);
router.post('/logout', isAuth, logout);
router.post('/otpVerify', verifyotp)
router.get("/dashboard", isAuth, dashboard);

router.post('/send-data',sendData);
router.post('/excelupload', isAuth, upload.single('ExcelFile'), fileupload);


module.exports = router

