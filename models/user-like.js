const Sequelize = require('sequelize');
const sequelize = require('./database');

const userLike = sequelize.define('userLike', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    like: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = userLike;





