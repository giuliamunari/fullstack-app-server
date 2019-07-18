const { Router } = require('express')
const Comment = require('./model')
const User = require('../user/model')
const Ticket = require('../ticket/model')
const auth = require('../auth/middleware')
const router = new Router()

// create a comment
router.post('/tickets/:ticketId/comments',auth, function (req, res, next) {
    const ticketId = parseInt(req.params.ticketId)
   
    Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send('Ticket Not Found')
            else Comment
                .create({
                    userId: req.user.id,
                    ticketId: ticketId,
                    text: req.body.text,
                    username: req.user.username
                })
                .then(comment => res.status(201).send({ comment }))
                .catch(err => res.send(`Error ${err.name}: ${err.message}`))
        })
        .catch(err => res.send(`Error ${err.name}: ${err.message}`))
})

// get all comments
router.get('/tickets/:ticketId/comments', function (req, res, next) {
    const ticketId = req.params.ticketId
    Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send('Ticket Not Found')
            else Comment.findAll({where: {ticketId: ticketId}})
                .then(comments => res.status(200).json({ comments }))
                .catch(err => res.send(`Error ${err.name}: ${err.message}`))
        })
        .catch(err => res.send(`Error ${err.name}: ${err.message}`))
})

module.exports = router