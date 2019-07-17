const { Router } = require('express')
const Ticket = require('./model')
const router = new Router()
const Event = require('../event/model');

// create a ticket
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
        .catch(err => next(err))
})

// get all tickets
router.get('/events/:id/tickets', function (req, res, next) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket.findAll()
                .then(tickets => res.status(200).json({ tickets }))
                .catch(error => next(error))
        })
        .catch(error => next(error))
})

// get a ticket
router.get('/events/:id/tickets/:ticketId', function (req, res, next) {
    const id = req.params.id
    const ticketId = req.params.ticketId
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket.findByPk(ticketId)
                .then(ticket => {
                    if (!ticket) return res.status(404).send({ message: 'Ticket Not Found' })
                    else res.status(200).json({ ticket })
                }).catch(error => next(error))
        })
        .catch(error => next(error))
})

//update a ticket
router.put('/events/:id/tickets/:ticketId', function (req, res, next) {
    const id = req.params.id
    const ticketId = req.params.ticketId
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket.findByPk(ticketId)
                .then(ticket => {
                    if (!ticket) return res.status(404).send({ message: 'Ticket Not Found' })
                    else if (parseInt(req.body.userId) !== ticket.userId) return res.status(500).send({ message: 'You are not allowed to modify this ticket' })
                    else {
                        ticket.update({
                            picture: req.body.picture || ticket.picture,
                            price: req.body.price || ticket.price,
                            description: req.body.description || ticket.description
                        })
                        res.status(200).send(ticket)
                    }
                })
                .catch(error => next(error))
        })
        .catch(error => next(error))
})

module.exports = router