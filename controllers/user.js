const { validationResult } = require('express-validator');
const mailgen = require('../middleware/email-template');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
// DATABASE MODELS
const UserCredential = require('../models/user-credential');
const UserPost = require('../models/user-post');
const Vilage = require('../models/vilage');
const Comment = require('../models/comment');


exports.signup = async (req, res, next) => {
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    
    const userName = req.body.userName;
    const password = req.body.password;
    const passId = req.body.passId;
    const email = req.body.email;
    
    try {
        const hashedPw = await bcrypt.hash(password, 12);
        
        const user = await UserCredential.create({
            userName: userName,
            password: hashedPw,
            passportId: passId,
            email: email
        })
                
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: 'ulansulamaovulan123@gmail.com',
                pass: '123456789ulan$'
            }
        });
        
        let mail = mailgen.client(user);
    
        let message = {
            from: 'The BrandName Account Services',
            to: user.email,
            subject: "Добро пожаловать в BrandName где вы можете купить одежду.",
            html: mail,
        };
    
        const sendEmailResult = await transporter.sendMail(message);
                
        if(sendEmailResult.rejected.length){
            const error = new Error('Internal system error. email could not be send');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ msg: "you should receive an email from us" });
    }
    catch(err) {
        next(err);
    }
};


exports.login = async (req, res, next) => {
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const account = req.body.account;
    const password = req.body.password;
    
    try {
        
        const user = await UserCredential.findOne({ 
            where: {
                [Op.or]: [
                  { userName: account },
                  { email: account }
                ]
            }                     
        });
        
        if(!user){
            const error = new Error('A user with this email could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        if(!user.isActive){
            
            const error = new Error('A mail of this user is not verificated.');
            error.statusCode = 401;
            throw error;
        }
        
        const isEqual = bcrypt.compare(password, user.password);
        
        if(!isEqual){
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        
        const token = jwt.sign(
            {
                email: user.email,
                userId: user.id
            },
            'supersecretusercode',
            { expiresIn: '10h' }
        );
        
        res.status(200).json({ token: token });
        
    }
    catch(err) {
        next(err);
    }
    

};


exports.verify = async (req, res, next) => {
    const email = req.query.email;
    const password = req.query.hashedpw;
    
    try {
        const user = await UserCredential.findOne({ where: { email: email, password: password } })
        
        if(!user){
            const error = new Error('Oops something went wrong, try again after a few minut..');
            error.statusCode = 404;
            throw error;
        }
        
        user.isActive = 1;
        await user.save();

        res.redirect('https://cat-bounce.com/');
    }
    catch(err) {
        next(err);
    }
}














exports.getPosts = async (req, res, next) => {
    
    const currentPage = req.query.page || 1;
    const perPage = 10;
    
    try {
        let posts = await UserPost.findAll({
            order: [
                ['createdAt', 'DESC']
            ],
            offset: (currentPage - 1) * perPage, 
            limit: perPage
        });

        res.status(200).json({ posts: posts });
    }
    catch(err) {
        next(err);
    }
}




exports.getPost = async (req, res, next) => {
    
    const postId = req.query.postId;
    
    if(!postId){
        const error = new Error(`You did not pass a 'postId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[postId] - is empty';
        next(error);
    }
    
    let postData = {};
    let manager;
    
    try {
        const post = await UserPost.findByPk(postId);
        
        const vilage = await Vilage.findByPk(post.vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const comments = await Comment.findAll({ where: { userPostId: post.id } });
        
        if(vilageManager){
            manager = await Manager.findOne({ where: { id: vilageManager.managerId } });
        }
        
        postData.info = post;
        postData.vilage = vilage;
        vilageData.comments = comments || 'empty';
        
        res.status(200).json({ post: postData });
    }
    catch(err){
        next(err);
    }
}





exports.createComment = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const text = req.body.text;
    const userId = req.userId;
    const postId = req.body.postId;
    
    try {
        const post = await UserPost.findByPk(postId);
        const user = await UserCredential.findByPk(userId);
        
        if(!user && post){
            const error = new Error('Such post or user could not found');
            error.statusCode = 404;
            throw error;
        }
        
        const comment = await Comment.create({
            name: user.userName,
            text: text,
            userCredentialId: user.id,
            userPostId: post.id
        });
        
        if(!comment) {
            const error = new Error('Internal system error, new comment could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ comment: comment });
    }
    catch(err) {
        next(err);
    }
    
};



























































exports.getCart = async (req, res, next) => {
    
    const userId = req.userId;
    
    try {
        let carts = await Cart.findAll({ where: { userId: userId } });
        
        for(let i = 0; i < carts.length; i++){
            carts[i].dataValues.image = await Image.findOne({ attributes: ['imageUrl'], where: { productId: carts[i].productId } });
            carts[i].dataValues.product = await Product.findOne({ attributes: ['name', 'price', 'discount'], where: { id: carts[i].productId } });
        }

        res.status(200).json({ carts: carts });
    }
    catch(err) {
        next(err);
    }
}


exports.addCart = async (req, res, next) => {
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const prodId = req.body.prodId;
    const userId = req.userId;
    
    try {
        const user = await User.findByPk(userId);
        
        if(!user){
            const error = new Error('Such user could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const newCartPt = await Cart.create({
            productId: prodId,
            userId: userId
        });
        
        res.status(200).json({ newCartPt: newCartPt });
    }
    catch(err) {
        next(err);
    }   
}


exports.deleteCart = async (req, res, next) => {
    
    if(req.query.cartId === undefined || req.query.cartId === null){
        const error = new Error(`You did not pass a 'cardId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[cardId] - is empty';
        next(error);
    }
    
    const cartId = req.query.cartId;
    const userId = req.userId;
    
    try {
        const cart = await Cart.findOne({ where: { id: cartId, userId: userId } });
        
        if(!cart){
            const error = new Error('Such cart could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        await cart.destroy();
        
        res.status(200).json({ msg: 'Product successfuly deleted from cart!' });
    }
    catch(err) {
        next(err);
    }
}


exports.setCartNumber = async (req, res, next) => {
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const cartId = req.body.cartId;
    const quantity = req.body.quantity;
    const userId = req.userId;
    
    try {
        const cart = await Cart.findOne({ where: { id: cartId, userId: userId } });
        
        if(!cart){
            const error = new Error('Such cart could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        cart.quantity = quantity;
        const updatedCartPt = await cart.save();
        
        res.status(200).json({ updatedCartPt: updatedCartPt });
    }
    catch(err) {
        next(err);
    }
}


exports.checkOut = async (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const productName = req.body.productName;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const discount = req.body.discount;
    const payService = req.body.payService;
    const cartNumber = req.body.cartNumber;
    const userId = req.userId;
    
    try {
        const user = await User.findByPk(userId);
        
        if(!user){
            const error = new Error('Such user could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const userOrder = await user.createOrder({
            firstName: firstName,
            lastName: lastName,
            productName: productName,
            quantity: quantity,
            price: price,
            discount: discount,
            payService: payService,
            cartNumber: cartNumber
        });
        
        res.status(200).json({ msg: 'Product successfuly ordered!'});
    }
    catch(err) {
        next(err);
    }
}












