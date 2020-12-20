const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const UserCredential = require('../models/user-credential');
const router = express.Router();

// AUTHORIZTION *********************************************************

router.put(
    '/signup',
    [
        body('userName').trim().not().isEmpty(),
        body('password').trim().isLength({ min: 5 }),
        body('passId').isInt(),
        body('email')
            .isEmail()
            .custom(value => {
                return UserCredential.findOne({where: {email: value}}).then(userData => {
                    if(userData) return Promise.reject('Email address already exist');
                })
            })
            .normalizeEmail()
    ],
    (req, res, next) => {}
);

router.post(
    '/login',
    [
        body('account').isEmail(),
        body('password').trim().isLength({ min: 5 })
    ],
    (req, res, next) => {}
);

router.get('/verify', () => {});



// CONTENT *********************************************************

router.get(
    '/posts', 
    isAuth.user,
    (req, res, next) => {}
);

router.get(
    '/post', 
    isAuth.user,
    (req, res, next) => {}
);



// COMMENT *********************************************************

router.post(
    '/comment',
    isAuth.user,
    [
        body('text').trim().not().isEmpty(),
        body('postId').isInt(),
    ],
    (req, res, next) => {}
);

router.put(
    '/comment',
    isAuth.user,
    [
        body('text').trim().not().isEmpty(),
    ],
    (req, res, next) => {}
);

router.delete(
    '/comment', 
    isAuth.user,
    (req, res, next) => {}
);


// APPLICATION *********************************************************

router.post(
    '/application',
    isAuth.user,
    [
        body('title').trim().not().isEmpty(),
        body('description').trim().not().isEmpty(),
    ],
    (req, res, next) => {}
);

router.put(
    '/application',
    isAuth.user,
    [
        body('title').trim().not().isEmpty(),
        body('description').trim().not().isEmpty()
    ],
    (req, res, next) => {}
);

router.delete(
    '/application', 
    isAuth.user,
    (req, res, next) => {}
);






module.exports = router;













