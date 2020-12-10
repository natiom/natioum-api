const Sequelize = require('sequelize');
const sequelize = require('./database');

const userData = sequelize.define('userData', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    profileImg: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = userData;





