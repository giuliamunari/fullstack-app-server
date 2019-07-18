const { Router } = require('express')
const Event = require('./model')
const User = require('../user/model')
const router = new Router()
const auth = require('../auth/middleware')
const Sequelize = require('sequelize');
const Op = Sequelize.Op

router.post('/events', auth, function (request, response, next) {
    if (!request.body.title) return response.status(400).send('The name of the event needs to be defined' )
    else {
       return Event
        .create({
            title: request.body.title,
            description: request.body.description,
            picture: request.body.picture,
            startDate: request.body.startDate,
            endDate: request.body.endDate,
            active: true,
            userId: request.body.userId
        })
        .then(event => { response.status(201).send({event})})
        .catch(err => response.send(`Error ${err.name}: ${err.message}`))
    } 
})

router.get('/events', function (req, res) {
    const limit = req.query.limit || 9
    const offset = req.query.offset || 0
    
    Promise.all([
        Event.count(),
        Event.findAll({ limit, offset, where: {startDate : {[Op.gt]: new Date()}} })
      ])
        .then(([total, events]) => {
            if (!events) return res.status(404).send('Events Not Found');
            else return res.status(200).send({
                events, total
              })
            
        })
        .catch(error => res.status(400).send(`Error ${error.name}: ${error.message}`))
})

router.get('/events/:id', function (req, res) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send('Event Not Found' );
            return res.status(200).json({ event })
        })
        .catch(error => res.status(400).send(`Error ${error.name}: ${error.message}`))
})

router.put('/events/:id',auth, function (req, res, next) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send('Event Not Found' )
            else if (parseInt(req.user.id) !== event.userId) return res.status(500).send('You are not allowed to modify this event' )
            else {
                event.update({
                    title: req.body.title || event.title,
                    description: req.body.description || event.description,
                    picture: req.body.picture || event.picture,
                    startDate: req.body.startDate || event.startDate,
                    endDate: req.body.endDate || event.endDate,
                    active: req.body.active || event.active
                })
                res.status(200).send(event)
            }
        })
        .catch(error => next(error))
})

module.exports = router