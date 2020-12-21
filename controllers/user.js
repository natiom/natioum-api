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
const UserLike = require('./models/user-like');


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



exports.updateComment = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const text = req.body.text;
    const userId = req.userId;
    const commentId = req.body.commentId;
    
    try {
        
        const comment = await Comment.findOne({ 
            where: {  
                userCredentialId: userId,
                id: commentId
            } 
        });
        
        if(!comment){
            const error = new Error('Such comment could not found');
            error.statusCode = 404;
            throw error;
        }
        
        comment.text = text;
        
        const updatedComment = await comment.save();
        
        if(!updatedComment) {
            const error = new Error('Internal system error, new comment could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ comment: updatedComment });
    }
    catch(err) {
        next(err);
    }
    
};


exports.deleteComment = async (req, res, next) => {
    
    const commentId = req.query.commentId;
    
    if(!commentId){
        const error = new Error(`You did not pass a 'vilageId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[vilageId] - is empty';
        next(error);
    }
    
    try {
        const comment = await Comment.findByPk(commentId);
        
        if(!comment){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        await comment.destroy();
        
        res.status(200).json({ msg: 'Comment successfuly deleted!' });
    }
    catch(err) {
        next(err);
    }
}




exports.createApplication = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const title = req.body.title;
    const description = req.body.description;
    const userId = req.userId;
    
    if(!req.files){
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    
    const fileImages = req.files;
    
    try {
        const user = await UserCredential.findByPk(userId);
        
        if(!user){
            const error = new Error('Such user could not found');
            error.statusCode = 404;
            throw error;
        }
        
        
        
        const application = await UserPost.create({
            title: title,
            description: description,
            status: 'created',
            imageUrl: fileImages[0].filename,
            status: 'created',
            vilageId: user.vilageId,
            userCredentialId: user.id
        });
        
        if(!application) {
            const error = new Error('Internal system error, new application could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ application: application });
    }
    catch(err) {
        next(err);
    }
    
};



exports.updateApplication = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const title = req.body.title;
    const description = req.body.description;
    const applicationId = req.body.applicationId;
    const deletedImage = req.body.deletedImage || 0;
    const userId = req.userId;
    
    if(!req.files){
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    
    const fileImages = req.files;
    
    
    
    try {
        const application = await UserPost.findOne({
            where: {
                id: applicationId,
                userCredentialId: userId
            }
        })
        
        application.title = title;
        application.description = description;
        application.imageUrl = fileImages[0].filename;
        
        if(deletedImage){
            deleteImage(deletedImage);
        }
        
        const updatedApplication = await application.save();
        
        if(!updatedApplication) {
            const error = new Error('Internal system error, new application could not updated!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ application: updatedApplication });
    }
    catch(err) {
        next(err);
    }
    
};


exports.deleteApplication = async (req, res, next) => {
    
    const applicationId = req.query.applicationId;
    
    if(!applicationId){
        const error = new Error(`You did not pass a 'applicationId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[applicationId] - is empty';
        next(error);
    }
    
    try {
        const application = await UserPost.findByPk(applicationId);
        
        if(!application){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        deleteImage(application.imageUrl);
        
        await vilage.destroy();
        
        res.status(200).json({ msg: 'Application successfuly deleted!' });
    }
    catch(err) {
        next(err);
    }
}


exports.createLike = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const postId = req.body.postId;
    const userId = req.query.use
    
    try {
        const user = await UserCredential.findByPk(userId);
        const post = await UserPost.findByPk(postId);
        
        if(!user){
            const error = new Error('Such user could not found');
            error.statusCode = 404;
            throw error;
        }
        
        if(!post){
            const error = new Error('Such post could not found');
            error.statusCode = 404;
            throw error;
        }
        
        const like = await UserLike.create({
            like: true,
            userCredentialId: userId,
            userPostId: postId
        });
        
        post.likeNumber = post.likeNumber + 1;
        
        const updatedPost = await post.save();
        
        if(!like) {
            const error = new Error('Internal system error, new like could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ like: like });
    }
    catch(err) {
        next(err);
    }
    
};




const deleteImage = fileName => {
    const filePath = path.join(__dirname, '../images', fileName);
    fs.unlink(filePath, err => console.log(err));
    
    image.findOne({ where: { imageUrl: fileName } })
        .then(imageInstance => {
            if(imageInstance !== null){
                imageInstance.destroy();
            }
        })
        .catch(err => {
            console.log(err);
        })
}










