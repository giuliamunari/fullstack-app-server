const { Router } = require('express')
const Comment = require('./model')
const Ticket = require('../ticket/model')
const router = new Router()

// create a comment
router.post('/tickets/:ticketId/comments', function (req, res, next) {
    const ticketId = req.params.ticketId
    const newComment = {
        userId: req.body.userId,
        ticketId: req.params.ticketId,
        text: req.body.text,
        username: req.body.username
    }
    Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send('Ticket Not Found')
            else Comment
                .create(newComment)
                .then(comment => res.status(201).json({ comment }))
                .catch(err => next(err))
        })
        .catch(error => next(error))
})

// get all comments
router.get('/tickets/:ticketId/comments', function (req, res, next) {
    const ticketId = req.params.ticketId
    Ticket.findByPk(ticketId)
        .then(ticket => {
            if (!ticket) return res.status(404).send('Ticket Not Found')
            else Comment.findAll()
                .then(comments => res.status(200).json({ comments }))
                .catch(error => next(error))
        })
        .catch(error => next(error))
})

module.exports = router