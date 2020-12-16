const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const VilageGov = require('../models/vilgov');
const router = express.Router();

// AUTHORIZTION *********************************************************

router.post(
    '/login',
    [
        body('name').trim().not().isEmpty(),
        body('password').trim().not().isEmpty()
    ],
    ()=>{}
);




// VILAGE ****************************************************************

router.get(
    '/vilages', 
    isAuth.admin,
    (req, res, next) => {}
);

router.get(
    '/vilage', 
    isAuth.admin,
    (req, res, next) => {}
);

router.post(
    '/vilage',
    isAuth.admin,
    [
        body('name').trim().not().isEmpty(),
        body('region').trim().not().isEmpty(),
        body('district').trim().not().isEmpty(),
        body('population').isInt()
    ],
    (req, res, next) => {}
);

router.put(
    '/vilage',
    isAuth.admin,
    [
        body('name').trim().not().isEmpty(),
        body('region').trim().not().isEmpty(),
        body('district').trim().not().isEmpty(),
        body('population').isInt()
    ],
    (req, res, next) => {}
);

router.delete(
    '/vilage', 
    isAuth.admin,
    (req, res, next) => {}
);




// VILAGE GOVERMENT ************************************************************


router.get(
    '/vilgov', 
    isAuth.admin,
    (req, res, next) => {}
);

router.post(
    '/vilgov',
    isAuth.admin,
    [
        body('firstName').trim().not().isEmpty(),
        body('lastName').trim().not().isEmpty(),
        body('email')
            .isEmail()
            .custom(value => {
                return VilageGov.findOne({where: {email: value}}).then(userData => {
                    if(userData) return Promise.reject('Email address already exist');
                })
            })
            .normalizeEmail(),
        body('vilageId').isInt()
    ],
    (req, res, next) => {}
);

router.put(
    '/vilgov',
    isAuth.admin,
    [
        body('firstName').trim().not().isEmpty(),
        body('lastName').trim().not().isEmpty(),
        body('userName').trim().not().isEmpty(),
        body('email')
            .isEmail()
            .custom(value => {
                return VilageGov.findOne({where: {email: value}}).then(userData => {
                    if(userData) return Promise.reject('Email address already exist');
                })
            })
            .normalizeEmail(),
        body('password').trim().not().isEmpty(),
        body('vilageId').isInt()
    ],
    (req, res, next) => {}
);

router.delete(
    '/vilgov', 
    isAuth.admin,
    (req, res, next) => {}
);




// MANAGER ****************************************************************

router.get(
    '/managers', 
    isAuth.admin,
    (req, res, next) => {}
);

router.get(
    '/manager', 
    isAuth.admin,
    (req, res, next) => {}
);

router.post(
    '/manager',
    isAuth.admin,
    [
        body('firstName').trim().not().isEmpty(),
        body('lastName').trim().not().isEmpty(),
        body('phoneNumber').isInt(),
        body('position').trim().not().isEmpty(),
    ],
    (req, res, next) => {}
);

router.put(
    '/manager',
    isAuth.admin,
    [
        body('firstName').trim().not().isEmpty(),
        body('lastName').trim().not().isEmpty(),
        body('phoneNumber').isInt(),
        body('position').trim().not().isEmpty(),
        body('userName').trim().not().isEmpty(),
        body('password').trim().not().isEmpty(),
    ],
    (req, res, next) => {}
);

router.delete(
    '/manager', 
    isAuth.admin,
    (req, res, next) => {}
);







module.exports = router;













