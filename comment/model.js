const { Sequelize } = require('sequelize')
const db = require('../db')
const User = require('../user/model')
const Ticket = require('../ticket/model')

const Comment = db.define(
    'comment',
    {
        text: {
            type: Sequelize.STRING,
            field: 'comment_text',
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            field: 'comment_username',
            allowNull: false
        }
    },
    { timestamps: true, tableName: 'comments' })


Comment.belongsTo(User);
User.hasMany(Comment);
//Comment.belongsTo(User)
Comment.belongsTo(Ticket);
Ticket.hasMany(Comment);

module.exports = Comment