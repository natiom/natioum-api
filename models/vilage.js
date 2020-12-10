const Sequelize = require('sequelize');
const sequelize = require('./database');

const vilage = sequelize.define('vilage', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    district: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    region: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    population: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
});

module.exports = vilage;





