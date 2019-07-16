const { Router } = require('express')
const Ticket = require('./model')
const router = new Router()
const Event = require('../event/model');

// it is needed to add the event id
// add added at 

router.post('/events/:id/tickets', function (req, res, next) {
    const id = req.params.id
    const newTicket = {
        picture: req.body.picture,
        price: req.body.price,
        description: req.body.description,
        eventId: req.params.id,
        userId: req.body.userId
    }
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket
                .create(newTicket)
                .then(ticket => res.status(201).json({ ticket }))
                .catch(err => next(err))
        })
})



module.exports = router