const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('./db')

//models
require('./event/model')
require('./ticket/model')
require('./user/model')

//routers
const authRouter = require('./auth/router')
const userRouter = require('./user/router')
const eventRouter = require('./event/router')
const ticketRouter = require('./ticket/router')

const app = express()
const port = process.env.PORT || 5000

const jsonParser = bodyParser.json()

app.use(cors())
app.use(jsonParser)
app.use(authRouter)
app.use(userRouter)
app.use(eventRouter)
//app.use(ticketRouter)


function onListen() {
    console.log(`Listening on port ${port}.`)
}

app.listen(port, onListen)