const Sequelize = require('sequelize');
const sequelize = require('./database');

const userPost = sequelize.define('userPost', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    like: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    likeNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

module.exports = userPost;





