const { Router } = require('express')
const Ticket = require('./model')
const router = new Router()
const Event = require('../event/model');

// it is needed to add the event id

router.post('/events/:id/tickets', function (req, res, next) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            console.log(event,'event')
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket
                .create(req.body)
                .then(ticket => res.status(201).json({ ticket }))
                .catch(err => next(err))
        })
})



module.exports = router