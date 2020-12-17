const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const VilageGov = require('../models/vilgov');
const adminController = require('../controllers/admin');
const router = express.Router();

// AUTHORIZTION *********************************************************

router.post(
    '/login',
    [
        body('userName').trim().not().isEmpty(),
        body('password').trim().not().isEmpty()
    ],
    adminController.login
);




// VILAGE ****************************************************************

router.get(
    '/vilages', 
    isAuth.admin,
    adminController.getVilages
);

router.get(
    '/vilage', 
    isAuth.admin,
    adminController.getVilage
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
    adminController.addVilage
);

router.put(
    '/vilage',
    isAuth.admin,
    [
        body('vilageId').isInt(),
        body('name').trim().not().isEmpty(),
        body('region').trim().not().isEmpty(),
        body('district').trim().not().isEmpty(),
        body('population').isInt()
    ],
    adminController.updateVilage
);

router.delete(
    '/vilage', 
    isAuth.admin,
    adminController.deleteVilage
);




// VILAGE GOVERMENT ************************************************************


router.get(
    '/vilgov', 
    isAuth.admin,
    adminController.getVilageGov
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
    adminController.addVilageGov
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
    adminController.updateVilageGov
);

router.delete(
    '/vilgov', 
    isAuth.admin,
    adminController.deleteVilageGov
);




// MANAGER ****************************************************************

router.get(
    '/managers', 
    isAuth.admin,
    adminController.getManagers
);

router.get(
    '/manager', 
    isAuth.admin,
    adminController.getManager
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
    adminController.addManager
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
    adminController.updateManager
);

router.delete(
    '/manager', 
    isAuth.admin,
    adminController.deleteManager
);







module.exports = router;













