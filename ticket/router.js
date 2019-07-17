const { Router } = require('express')
const Ticket = require('./model')
const router = new Router()
const Event = require('../event/model');
const User = require('../user/model')
const Comment = require('../comment/model')
const auth = require('../auth/middleware');

// create a ticket
router.post('/events/:id/tickets', auth, function (req, res, next) {
    const id = req.params.id
    const newTicket = {
        picture: req.body.picture,
        price: req.body.price,
        description: req.body.description,
        eventId: req.params.id,
        userId: req.username.userId
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
            else Ticket.findAll({ where: { eventId: id } })
                .then(tickets => res.status(200).json({ tickets }))
                .catch(error => next(error))
        })
        .catch(error => next(error))
})

//get a ticket
// router.get('/events/:id/tickets/:ticketId', function (req, res, next) {
//     const id = req.params.id
//     const ticketId = req.params.ticketId
//     Event.findByPk(id)
//         .then(event => {
//             if (!event) return res.status(404).send({ message: 'Event Not Found' })
//             else {
//                 Ticket.findByPk(ticketId)
//                     .then(ticket => {
//                         if (!ticket) return res.status(404).send({ message: 'Ticket Not Found' })
//                         else res.status(200).send(ticket)

//                     })
//                     .catch(error => next(error))
//             }

//         })
//         .catch(error => next(error))
// })

//update a ticket
router.put('/events/:id/tickets/:ticketId', auth, function (req, res, next) {
    const id = req.params.id
    const ticketId = req.params.ticketId
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket.findByPk(ticketId)
                .then(ticket => {
                    if (!ticket) return res.status(404).send({ message: 'Ticket Not Found' })
                    else if (parseInt(req.user.userId) !== ticket.userId) return res.status(500).send({ message: 'You are not allowed to modify this ticket' })
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


// -------------------------------------------------------

function getTickets(req, res, next) {
    try {
        Ticket.findAll()
            .then(tickets => {
                req.tickets = tickets.map(ticket => ticket.dataValues) //console.log(tickets.map(ticket => ticket.dataValues))
                next()
            }).catch(error => next(error))
    }
    catch (error) {
        res.status(400).send(`Error ${error.name}: ${error.message}`)
    }
}

function getUsers(req, res, next) {
    try {
        User.findAll()
            .then(users => {
                req.allusers = users.map(u => u.dataValues) //console.log(tickets.map(ticket => ticket.dataValues))
                next()
            }).catch(error => next(error))
    }
    catch (error) {
        res.status(400).send(`Error ${error.name}: ${error.message}`)
    }
}

function getComments(req, res, next) {
    try {
        Comment.findAll()
            .then(comments => {
                req.allcomments = comments.map(c => c.dataValues) //console.log(tickets.map(ticket => ticket.dataValues))
                next()
            }).catch(error => next(error))
    }
    catch (error) {
        res.status(400).send(`Error ${error.name}: ${error.message}`)
    }
}

//get a security
router.get('/events/:id/tickets/:ticketId', getTickets, getUsers, getComments, async (req, res, next) => {
    const id = req.params.id
    const ticketId = req.params.ticketId
    const ticketsOfTheEvent = req.tickets.filter(t => t.eventId === parseInt(id))
    const commentsTicket = req.allcomments.filter(c => c.ticketId === parseInt(ticketId))
    

    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
        })
        .catch(error => next(error))
        
    const currentTicket = await Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send({ message: 'Ticket Not Found' })
            else return ticket.dataValues
        })
        .catch(error => next(error))

    const authorId = currentTicket.userId
    const numberAuthorTickets = req.tickets.filter(t => t.userId === authorId).length

    const num = ticketsOfTheEvent.reduce((a, b, i, array) => { return a + b.price / array.length }, 0)

    //const averagePrice = Math.round(num * 100) / 100
    const averagePrice = 100
    
    const caseAuthor = (numberAuthorTickets <= 1) ? 10 : 0
    
    const deductTheDifference = ((currentTicket.price-averagePrice) >= 10) ? -10 : (averagePrice - currentTicket.price)
    const casePrice = (currentTicket.price < averagePrice) ? (averagePrice - currentTicket.price) : deductTheDifference
    const time = new Date(currentTicket.createdAt).getHours() + '.' + new Date(currentTicket.createdAt).getMinutes()
    const caseBusinessHours = (time >= 9 && time <= 17) ? -10 : 10
    const caseComments = (commentsTicket.length > 3) ? 5 : 0

    const risk = caseAuthor + casePrice + caseBusinessHours + caseComments

    const author = req.allusers.find(u => {
        u.id ===currentTicket.userId 
        return u.username
    })
    res.status(200).send({risk, ticket: currentTicket, comments: commentsTicket, author })
})

module.exports = router