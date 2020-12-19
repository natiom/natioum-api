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
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = userCredential;





