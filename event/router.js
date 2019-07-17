const { Router } = require('express')
const Event = require('./model')
const User = require('../user/model')
const router = new Router()
const auth = require('../auth/middleware')


router.post('/events', auth, function (request, response, next) {
    const newEvent = {
        title: request.body.title,
        description: request.body.description,
        picture: request.body.picture,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
        active: true,
        userId: request.user.userId
    }
    if (!request.body.title) return response.status(400).send({ message: 'The name of the event needs to be defined' })
    return Event
        .create(newEvent)
        .then(events => response.status(201).json({ events }))
        .catch(err => next(err))
})

router.get('/events', function (req, res) {
    Event.findAll()
        .then(events => {
            if (!events) return res.status(404).send({ message: 'Events Not Found' });
            return res.status(200).json({ events })
        })
        .catch(error => res.status(400).send(error))
})

router.get('/events/:id', function (req, res) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' });
            return res.status(200).json({ event })
        })
        .catch(error => res.status(400).send(error))
})

router.put('/events/:id',auth, function (req, res, next) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else if (parseInt(req.body.userId) !== event.userId) return res.status(500).send({ message: 'You are not allowed to modify this event' })
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