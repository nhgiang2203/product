const md5 = require("md5");
const User = require('../../models/user.model');
const ForgotPassword = require('../../models/forgot-password.model');
const Cart = require('../../models/cart.model');

const generateHelper = require('../../helpers/generate');
const sendMailHelper = require('../../helpers/sendMail');

//[GET] /user/register
module.exports.register = (req, res) => {
    res.render('client/pages/user/register', {
        pageTitle: "Đăng kí tài khoản"
    });
}

//[POST] /user/register
module.exports.registerPost = async(req, res) => {
    const emailExist = await User.findOne({
        email: req.body.email
    });
    if(emailExist){
        req.flash('error', 'Email đã tồn tại!');
        res.redirect('back');
        return;
    }
    
    req.body.password = md5(req.body.password);
    
    const user = new User(req.body);
    await user.save()

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/");
    
}

//[GET] /user/login
module.exports.login = (req, res) => {
    res.render('client/pages/user/login', {
        pageTitle: "Đăng nhập"
    });
}

//[POST] /user/login
module.exports.loginPost = async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        req.flash('error', 'Email không tồn tại!');
        res.redirect('back');
        return;
    }
    if(md5(password) !== user.password){
        req.flash('error', 'Sai mật khẩu');
        res.redirect('back');
        return;
    }
    if(user.status == 'inactive'){
        req.flash('error', 'Tài khoản đang bị khóa!');
        res.redirect('back');
        return;
    }

    const cart =  await Cart.findOne({
        user_id: user.id
    });

    if(cart){
        res.cookie("cartId", cart.id);
    } else {
        await Cart.updateOne({
            _id: req.cookies.cartId
        }, {
            user_id: user.id
        });
    }

    res.cookie("tokenUser", user.tokenUser);

    await User.updateOne({
        tokenUser: user.tokenUser
    }, {
        statusOnline: "online"
    });

    _io.once('connection', (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_STATUS_ONLINE", {
            userId: user.id,
            status: "online"
        });
    });
    res.redirect('/');
}

//[GET] /user/logout
module.exports.logout = async(req, res) => {
    await User.updateOne({
        tokenUser: req.cookies.tokenUser
    }, {
        statusOnline: "offline"
    });
    _io.once('connection', (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_STATUS_ONLINE", {
            userId: res.locals.user.id,
            status: "offline"
        });
    })
    res.clearCookie("tokenUser");
    res.clearCookie("cartId");
    res.redirect('/');
}

//[GET]/user/password/forgot
module.exports.forgotPassword = (req, res) => {
    res.render('client/pages/user/forgot-password', {
        pageTitle: 'Lấy lại mật khẩu'
    })
}

//[POST]/user/password/forgot
module.exports.forgotPasswordPost = async(req, res) => {
    const email = req.body.email;
    const user = await  User.findOne({
        email: email,
        deleted: false
    });
    if(!user){
        req.flash('error', 'Email không tồn tại!');
        res.redirect('back');
        return;
    }

    //Lưu vào DB
    const otp = generateHelper.generateRandomNumber(8);

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    } 

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    const subject = "Mã OTP xác minh";
    const html = `Mã OTP xác minh là <b>${otp}</b>. Thời hạn sử dụng là 3 phút`;
    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp?email=${email}`);

    
}

//[GET] user/password/otp
module.exports.otpPassword = (req, res) => {
    const email = req.query.email;

    res.render('client/pages/user/otp-password', {
        pageTitle: 'Nhập mã OTP',
        email: email
    });
}

//[POST] user/password/otp
module.exports.otpPasswordPost = async(req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword({
        email: email,
        otp: otp
    });

    if(!result){
        req.flash('error', 'OTP không hợp lệ');
        res.redirect('back');
        return;
    }

    const user = await User.findOne({
        email: email
    });
    res.cookie("tokenUser", user.tokenUser);

    res.redirect('/user/password/reset');
}

//[GET]/user/password/reset
module.exports.resetPassword = (req, res) => {
    res.render('client/pages/user/reset-password', {
        pageTitle: 'Nhập lại mật khẩu',
    });
}

//[POST]/user/password/reset
module.exports.resetPasswordPost = async(req, res) => {
    const tokenUser = req.cookies.tokenUser;
    const password = req.body.password;

    await User.updateOne({
        tokenUser: tokenUser
    }, {
        password: md5(password)
    });

    res.redirect('/');
}

//[GET]/user/info
module.exports.info = async(req, res) => {
    res.render('client/pages/user/info', {
        pageTitle: 'Thông tin tài khoản'
    })
}