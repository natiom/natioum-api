const Sequelize = require('sequelize');
const sequelize = require('./database');

const vilageManager = sequelize.define('vilageManager', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = vilageManager;


