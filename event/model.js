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
            field: 'event_description'
        },
        picture: {
            type: Sequelize.STRING,
            field: 'event_image'
        },
        startDate: {
            type: Sequelize.DATE, 
            defaultValue: Sequelize.NOW,
            field: 'event_start'
        },
        endDate: {
            type: Sequelize.DATE,
            defaultValue: () => this.startDate,
            field: 'event_end'
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            field: 'event_active'
        }
    }, 
    { timestamps: false, tableName: 'events' })

Event.belongsTo(User);
User.hasMany(Event);

module.exports = Event