const {Sequelize} = require('sequelize')
const db = require('../db')
const User = require('../user/model')

const Event = db.define(
    'event',
    {
        title: {
            type: Sequelize.STRING,
            field: 'event_title',
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            field: 'event_description',
            allowNull: false
        },
        picture: {
            type: Sequelize.STRING,
            field: 'event_image',
            allowNull: false
        },
        startDate: {
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW,
            field: 'event_start',
            allowNull: false
        },
        endDate: {
            type: Sequelize.DATE,
            defaultValue: this.startDate,
            field: 'event_end',
            allowNull: false
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            field: 'event_active',
            allowNull: false
        }
    }, 
    { timestamps: false, tableName: 'events' })

Event.belongsTo(User);
User.hasMany(Event);

module.exports = Event