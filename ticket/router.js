const { Router } = require('express')
const Ticket = require('./model')
const router = new Router()
const Event = require('../event/model');
const User = require('../user/model')
const Comment = require('../comment/model')
const auth = require('../auth/middleware');

// create a ticket
router.post('/events/:id/tickets', auth, function (req, res, next) {
    const id = parseInt(req.params.id)

    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send('Event Not Found' )
            else Ticket
                .create({
                    picture: req.body.picture,
                    price: parseFloat(req.body.price),
                    description: req.body.description,
                    eventId: id,
                    userId: req.body.userId
                })
                .then(ticket => { res.status(201).send({ticket})})
                .catch(err => res.send(`Error ${err.name}: ${err.message}`))
        })
        .catch(err => res.send(`Error ${err.name}: ${err.message}`))
})



//update a ticket
router.put('/events/:id/tickets/:ticketId', auth, function (req, res, next) {
    const id =  parseInt(req.params.id)
    const ticketId =  parseInt(req.params.ticketId)
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send('Event Not Found' )
            else Ticket.findByPk(ticketId)
                .then(ticket => {
                    if (!ticket) return res.status(404).send('Ticket Not Found')
                    else if (parseInt(req.body.userId) !== ticket.userId) return res.status(500).send('You are not allowed to modify this ticket' )
                    else {
                        ticket.update({
                            picture: req.body.picture || ticket.picture,
                            price: req.body.price || ticket.price,
                            description: req.body.description || ticket.description
                        })
                        return res.status(200).send({ticket})
                    }
                })
                .catch(err => res.send(`Error ${err.name}: ${err.message}`))
        })
        .catch(err => res.send(`Error ${err.name}: ${err.message}`))
})


// -------------------------------------------------------

function getTickets(req, res, next) {
    try {
        Ticket.findAll()
            .then(tickets => {
                req.tickets = tickets.map(ticket => ticket.dataValues)
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
                req.allusers = users.map(u => u.dataValues)
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
                req.allcomments = comments.map(c => c.dataValues)
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
            if (!event) return res.status(404).send('Event Not Found' )
        })
        .catch(error => res.status(400).send(`Error ${error.name}: ${error.message}`))

    const currentTicket = await Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send('Ticket Not Found' )
            else return ticket.dataValues
        })
        .catch(error => res.status(400).send(`Error ${error.name}: ${error.message}`))

    const casePrice = () => {
        const num = ticketsOfTheEvent.reduce((a, b, i, array) => { return a + b.price / array.length }, 0)
        const averagePrice = Math.round(num * 100) / 100
        const currentTicketPercentage = (currentTicket.price * 100) / averagePrice
        if (currentTicketPercentage < 100) return 100 - currentTicketPercentage
        else if (currentTicketPercentage === 100) return 0
        else if ((currentTicketPercentage - 100) >= 10) return -10
        else return 100 - currentTicketPercentage
    }

    const caseBusinessHours = () => {
        const time = new Date(currentTicket.createdAt).getHours() + '.' + new Date(currentTicket.createdAt).getMinutes()
        const n = parseFloat(time)
        if (n >= 9 && n <= 17) return -10
        else return 10
    }

    const risk = () => {
        const numberAuthorTickets = req.tickets.filter(t => t.userId === currentTicket.userId).length
        const caseAuthor = (numberAuthorTickets <= 1) ? 10 : 0
        const caseComments = (commentsTicket.length > 3) ? 5 : 0
        const x = caseAuthor + casePrice() + caseBusinessHours() + caseComments
        if (x < 5) return 5
        else if (x > 95) return 95
        else return x
    }

    const author = req.allusers.find(u => {
        u.id === currentTicket.userId
        return u.username
    })
    res.status(200).send({ risk: risk(), ticket: currentTicket, comments: commentsTicket, author:{ username: author.username, id: author.id}  })
})


// get all tickets
router.get('/events/:id/tickets',getTickets, getUsers, getComments, function (req, res, next) {
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' })
            else Ticket.findAll({ where: { eventId: id } })
                .then(tickets => {
                    const newtickets = tickets.map(currentTicket=>{ 
                        const ticketId = currentTicket.id
                        const commentsTicket = req.allcomments.filter(c => c.ticketId === parseInt(ticketId))
                        const ticketsOfTheEvent = req.tickets.filter(t => t.eventId === parseInt(id))
                        const casePrice = () => {
                            const num = ticketsOfTheEvent.reduce((a, b, i, array) => { return a + b.price / array.length }, 0)
                            const averagePrice = Math.round(num * 100) / 100
                            const currentTicketPercentage = (currentTicket.price * 100) / averagePrice
                            if (currentTicketPercentage < 100) return 100 - currentTicketPercentage
                            else if (currentTicketPercentage === 100) return 0
                            else if ((currentTicketPercentage - 100) >= 10) return -10
                            else return 100 - currentTicketPercentage
                        }
                    
                        const caseBusinessHours = () => {
                            const time = new Date(currentTicket.createdAt).getHours() + '.' + new Date(currentTicket.createdAt).getMinutes()
                            const n = parseFloat(time)
                            if (n >= 9 && n <= 17) return -10
                            else return 10
                        }
                    
                        const risk = () => {
                            const numberAuthorTickets = req.tickets.filter(t => t.userId === currentTicket.userId).length
                            const caseAuthor = (numberAuthorTickets <= 1) ? 10 : 0
                            const caseComments = (commentsTicket.length > 3) ? 5 : 0
                            const x = caseAuthor + casePrice() + caseBusinessHours() + caseComments
                            if (x < 5) return 5
                            else if (x > 95) return 95
                            else return x
                        }
                        const newTicket = {ticket: currentTicket, risk: risk()}
                        return newTicket
                    } )
                    res.status(200).json({ tickets: [...newtickets] })
                })
                .catch(error => next(error))
        })
        .catch(error => next(error))
})





module.exports = router