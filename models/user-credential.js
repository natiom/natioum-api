const Sequelize = require('sequelize');
const sequelize = require('./database');

const userCredential = sequelize.define('userCredential', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    passportId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isActive: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isAccepted: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = userCredential;





