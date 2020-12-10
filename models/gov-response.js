const Sequelize = require('sequelize');
const sequelize = require('./database');

const govResponse = sequelize.define('govResponse', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    deadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    isAccepted: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = govResponse;





