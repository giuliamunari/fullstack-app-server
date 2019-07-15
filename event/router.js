const Router = require('express')
const Event = require('./model')
const router = new Router()

router.post('/events', function (request, response, next) {
    // if (!request.body.title) return response.status(400).send({ message: 'The name of the event and the date needs to be defined' })
    // return 
    Event
        .create(request.body)
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
/// create put
router.put('/events/:id', function (req, res) { 
    const id = req.params.id
    Event.findByPk(id)
        .then(event => {
            if (!event) return res.status(404).send({ message: 'Event Not Found' });
            return res.update({
                event
            }).status(200)
        })
        .catch(error => res.status(400).send(error))
})


module.exports = router