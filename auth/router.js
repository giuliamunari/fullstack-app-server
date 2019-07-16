const { Router } = require('express')
const { toJWT } = require('./jwt');
const User = require('../user/model')
const bcrypt = require('bcrypt');
const auth = require('./middleware')

const router = new Router()

router.post('/login', (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    if (username && password) {
        User.findOne({
                where: {
                    username: username
                }
            })
            .then(entity => {
                if (!entity) {
                    res.status(400)
                        .send({
                            message: 'username does not exists'
                        })
                }
                if (bcrypt.compareSync(password, entity.password)) {
                    res.send({
                            message: `Welcome ${entity.username}`,
                            token: toJWT({ userId: entity.id }),
                            username: entity.username,
                            userId : entity.id
                        })
                } else {
                    res.status(400)
                        .send({
                            message: 'Wrong password'
                        })
                }
            })
            .catch(err => {
                console.error(err)
                res
                    .status(500)
                    .send({
                        message: 'Something went wrong'
                    })
            })
    } else {
        res.status(400)
            .send({
                message: "Please supply a valid email and password"
            })
    }
})

module.exports = router