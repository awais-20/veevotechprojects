const express =require("express");
const app = express();
const isAuth = require('../middlewares/isAuth');
const {userRegister, userLogin, viewProfile, updateProfile, logout} = require('../Controllers/userController');
const router = express.Router();
const {upload} = require('../middlewares/multerMiddleware');
router.post('/register', upload.single("photo"), userRegister);
router.post('/login', userLogin);

router.get('/viewProfile', isAuth, viewProfile);
router.put('/updateProfile', upload.single("photo"),isAuth, updateProfile);
router.post('/logout', isAuth, logout);

module.exports = router