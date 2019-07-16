const { Sequelize } = require('sequelize')
const db = require('../db')
const User = require('../user/model')
const Event = require('../event/model')

const Ticket = db.define(
    'ticket',
    {
        picture: {
            type: Sequelize.STRING,
            field: 'ticket_image',
            allowNull: false
        },
        price: {
            type: Sequelize.INTEGER,
            field: 'ticket_price',
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            field: 'ticket_description',
            allowNull: false
        }
    },
    { timestamps: true, tableName: 'tickets' })

Ticket.belongsTo(User);
User.hasMany(Ticket);
Ticket.belongsTo(Event);
Event.hasMany(Ticket);

module.exports = Ticket