const express = require('express');
const { Router } = require('express');
const bcrypt = require('bcrypt');
const User = require('./model');

const router = new Router();

router.post('/sign-up', (req, res, next) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
    }
    if (!newUser.username || !newUser.password || !newUser.password_confirmation) {
        return res.status(400).send( "PLEASE FILL IN ALL REQUIRED FIELDS" )
    }

    else {
        newUser.password = bcrypt.hashSync(req.body.password, 10)
        const passwordMatches = bcrypt.compareSync(newUser.password_confirmation, newUser.password)

        if (!passwordMatches) return res.status(422).send("PLEASE MAKE SURE YOUR PASSWORDS MATCH" )

        else {
            User
                .findOne({
                    where: { username: newUser.username }
                })
                .then(user => {
                    if (user) {
                        return res.status(409).send(`USERNAME ${user.username} ALREADY EXISTS`)
                    }
                    else {
                        User
                            .create(newUser)
                            .then(user => {
                                res
                                    .status(201)
                                    .send({
                                        message: "A NEW USER WAS CREATED",
                                        username: user.username,
                                        user_id: user.id
                                    })
                            })
                    }
                })
                .catch(error => next(error))
        }
    }

})

module.exports = router