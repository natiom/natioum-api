const { validationResult } = require('express-validator');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const uniqueSlug = require('unique-slug');
// DATABASE MODELS
const Vilage = require('../models/vilage');
const VilageGov = require('../models/vilgov');
const VilageManager = require('../models/vil-manager');
const Manager = require('../models/manager');



exports.login = async (req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const userName = req.body.userName;
    const password = req.body.password;
    
    const systemName = process.env.SYSTEMNAME || 'empty';
    const systemPassword = process.env.SYSTEMPASSWORD || 'empty';
    
    
    if(userName === systemName && password === systemPassword){
        const token = jwt.sign(
            {
                userName: userName
            },
            'supersecretadmincode',
            { expiresIn: '10h' }
        );
        res.status(200).json({ token: token });
    }
    else{
        const error = new Error('Wrong user name or password!');
        error.statusCode = 401;
        throw error;
    }

}





// VILAGE ****************************************************************

exports.addVilage = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const name = req.body.name;
    const district = req.body.district;
    const region = req.body.region;
    const population = req.body.population;
    
    
    try {
        const vilage = await Vilage.create({
            name: name,
            district: district,
            region: region,
            population: population
        });
        
        
        if(!vilage) {
            const error = new Error('Internal system error, new vilage could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ vilage: vilage });
    }
    catch(err) {
        next(err);
    }
    
}



exports.updateVilage = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const vilageId = req.body.vilageId;
    const name = req.body.name;
    const district = req.body.district;
    const region = req.body.region;
    const population = req.body.population;
    
    
    try {
        const vilage = await Vilage.findByPk(vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        vilage.name = name;
        vilage.district = district;
        vilage.region = region;
        vilage.population = population;
        
        const updatedVilage = await vilage.save();
        
        if(!updatedVilage) {
            const error = new Error('Internal system error, vilage could not be updated!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ vilage: updatedVilage });
    }
    catch(err) {
        next(err);
    }
    
}



exports.getVilages = async (req, res, next) => {
    
    const currentPage = req.query.page || 1;
    const perPage = 10;
    
    try {
        let vilages = await Vilage.findAll({
            offset: (currentPage - 1) * perPage, 
            limit: perPage
        });
        
        res.status(200).json({ vilages: vilages });
    }
    catch(err) {
        next(err);
    }
}



exports.getVilage = async (req, res, next) => {
    
    const vilageId = req.query.vilageId;
    
    if(!vilageId){
        const error = new Error(`You did not pass a 'vilageId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[vilageId] - is empty';
        next(error);
    }
    
    let vilageData = {};
    let manager;
    
    try {
        const vilage = await Vilage.findByPk(vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const goverment = await VilageGov.findOne({ where: { vilageId } });

        const vilageManager = await VilageManager.findOne({ where: { vilageId } });
        
        if(vilageManager){
            manager = await Manager.findOne({ where: { id: vilageManager.managerId } });
        }
        
        vilageData.info = vilage;
        vilageData.goverment = goverment || 'empty';
        vilageData.manager = manager || 'empty';
        
        res.status(200).json({ vilage: vilageData });
    }
    catch(err){
        next(err);
    }
}



exports.deleteVilage = async (req, res, next) => {
    
    const vilageId = req.query.vilageId;
    
    if(!vilageId){
        const error = new Error(`You did not pass a 'vilageId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[vilageId] - is empty';
        next(error);
    }
    
    try {
        const vilage = await Vilage.findByPk(vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        await vilage.destroy();
        
        res.status(200).json({ msg: 'Vilage successfuly deleted!' });
    }
    catch(err) {
        next(err);
    }
}





// VILAGE GOVERMENT ************************************************************

exports.addVilageGov = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const vilageId = req.body.vilageId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const userName = uniqueSlug(vilageId);
    const password = uniqueSlug(vilageId);
    
    try {
        const vilage = await Vilage.findByPk(vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const vilageGov = await VilageGov.create({
            vilageId,
            firstName,
            lastName,
            email,
            userName,
            password
        });
        
        
        if(!vilageGov) {
            const error = new Error('Internal system error, new vilage gov could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ vilageGov });
    }
    catch(err) {
        next(err);
    }
    
}



exports.updateVilageGov = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const vilageId = req.body.vilageId;
    const vilageGovId = req.body.vilageGovId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const userName = req.body.userName;
    const password = req.body.password;
    
    
    try {
        const vilage = await Vilage.findByPk(vilageId);
        
        if(!vilage){
            const error = new Error('Such vilage could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        const vilageGov = await VilageGov.findByPk(vilageGovId);
        
        if(!vilageGov){
            const error = new Error('Such vilage goverment could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        vilageGov.vilageId = vilageId;
        vilageGov.firstName = firstName;
        vilageGov.lastName = lastName;
        vilageGov.email = email;
        vilageGov.userName = userName;
        vilageGov.password = password;
        
        const updatedVilageGov = await vilageGov.save();
        
        if(!updatedVilage) {
            const error = new Error('Internal system error, vilage could not be updated!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ vilageGov: updatedVilageGov });
    }
    catch(err) {
        next(err);
    }
    
}



exports.getVilageGov = async (req, res, next) => {
    
    const vilageGovId = req.query.vilageGovId;
    
    if(!vilageGovId){
        const error = new Error(`You did not pass a 'vilageGovId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[vilageGovId] - is empty';
        next(error);
    }
    
    
    try {
        const vilageGov = await VilageGov.findByPk(vilageGovId);
        
        if(!vilageGov){
            const error = new Error('Such vilage goverment could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        res.status(200).json({ vilageGov });
    }
    catch(err){
        next(err);
    }
}



exports.deleteVilageGov = async (req, res, next) => {
    
    const vilageGovId = req.query.vilageGovId;
    
    if(!vilageGovId){
        const error = new Error(`You did not pass a 'vilageGovId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[vilageGovId] - is empty';
        next(error);
    }
    
    try {
        const vilageGov = await VilageGov.findByPk(vilageGovId);
        
        if(!vilageGov){
            const error = new Error('Such vilage goverment could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        await vilageGov.destroy();
        
        res.status(200).json({ msg: 'Vilage goverment account successfuly deleted!' });
    }
    catch(err) {
        next(err);
    }
}





// MANAGER ****************************************************************

exports.addManager = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const position = req.body.position;
    const userName = uniqueSlug(firstName);
    const password = uniqueSlug(lastName);
    
    try {
        const manager = await Manager.create({
            firstName,
            lastName,
            phoneNumber,
            position,
            userName,
            password
        });
        
        
        if(!manager) {
            const error = new Error('Internal system error, new manager could not save!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ manager });
    }
    catch(err) {
        next(err);
    }
    
}



exports.updateManager = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }
    
    const managerId = req.body.managerId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const position = req.body.position;
    const userName = req.body.userName;
    const password = req.body.password;
    
    
    try {
        const manager = await Manager.findByPk(managerId);
        
        if(!manager){
            const error = new Error('Such manager could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        manager.firstName = firstName;
        manager.lastName = lastName;
        manager.phoneNumber = phoneNumber;
        manager.position = position;
        manager.userName = userName;
        manager.password = password;
        
        const updatedManager = await manager.save();
        
        if(!updatedManager) {
            const error = new Error('Internal system error, manager could not be updated!');
            error.statusCode = 500;
            throw error;
        }
        
        res.status(200).json({ manager: updatedManager });
    }
    catch(err) {
        next(err);
    }
    
}



exports.getManagers = async (req, res, next) => {
    
    const currentPage = req.query.page || 1;
    const perPage = 10;
    
    try {
        let managers = await Manager.findAll({
            offset: (currentPage - 1) * perPage, 
            limit: perPage
        });
        
        res.status(200).json({ managers: managers });
    }
    catch(err) {
        next(err);
    }
}



exports.getManager = async (req, res, next) => {
    
    const managerId = req.query.managerId;
    
    if(!managerId){
        const error = new Error(`You did not pass a 'managerId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[managerId] - is empty';
        next(error);
    }
    
    let managerData = {};
    let vilages;
    
    try {
        const manager = await Manager.findByPk(managerId);
        
        if(!manager){
            const error = new Error('Such manager could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        let vilagesIds = await VilageManager.findAll({ attributes: ['vilageId'], where: { managerId } });
        
        if(vilagesIds){
            vilagesIds = vilagesIds.map(item => {
                return item.vilageId;
            })
            
            vilages = await Vilage.findAll({
                where: { 
                    vilageId: {
                        [Op.in]: vilagesIds
                    }
                } 
            });
            
        }
        else {
            vilages = 'empty';
        }
        
    
        managerData.info = manager;
        managerData.vilages = vilages;
        
        res.status(200).json({ manager: managerData });
    }
    catch(err){
        next(err);
    }
}



exports.deleteManager = async (req, res, next) => {
    
    const managerId = req.query.managerId;
    
    if(!managerId){
        const error = new Error(`You did not pass a 'managerId' query parameter`);
        error.statusCode = 422;
        error.data = 'query[managerId] - is empty';
        next(error);
    }
    
    try {
        const manager = await Manager.findByPk(managerId);
        
        if(!manager){
            const error = new Error('Such manager could not found.');
            error.statusCode = 404;
            throw error;
        }
        
        await manager.destroy();
        
        res.status(200).json({ msg: 'Manager account successfuly deleted!' });
    }
    catch(err) {
        next(err);
    }
}
















