const Sequelize = require('sequelize');
const sequelize = require('./database');

const userPassport = sequelize.define('userPassport', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    passportImg: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = userPassport;





