const Sequelize = require('sequelize');
const logger = require('../middleware/logger');


const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:aman2000@localhost:3306/natioum';
const sequelize = new Sequelize(DATABASE_URL, { logging: false });

/*const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: msg => logger.info(msg),
	mysql://root:keiz@localhost:3306/online_shop
});*/


module.exports = sequelize;
