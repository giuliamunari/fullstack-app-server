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
    if(!newUser.username || !newUser.password || !newUser.password_confirmation) {res.status(400).send({ message: "PLEASE FILL IN ALL REQUIRED FIELDS"})}
    else {
        newUser.password = bcrypt.hashSync(req.body.password, 10)
        if (bcrypt.compareSync(newUser.password_confirmation, newUser.password)) {
            User
                .findOne({
                    where: {
                        username: newUser.username
                    }
                })
                .then(user => {
                    if (!user) {
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
                    } else if (user.username === newUser.username) {
                        res
                            .status(409) //conflict?
                            .send({
                                message: `USERNAME ${newUser.username} ALREADY EXISTS`
                            })
                    }
                })
                .catch(error => next(error))
        } else {
            res
                .status(422)
                .send({
                    message: "PLEASE MAKE SURE YOUR PASSWORDS MATCH"
                })
        }
    }
   
})

module.exports = router