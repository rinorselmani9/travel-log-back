const express = require('express')
const HttpError = require('./models/http-error')
const app = express()
const placesRouter = require('./routes/places.route')
const usersRouter = require('./routes/users.route')
const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/travel'

app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.use('/api/places',placesRouter)
app.use('/api/users',usersRouter)

app.use((req,res,next)=>{
    const error = new HttpError('Could not find this route',404)
    throw error
})

app.use((error,req,res,next) =>{
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message:error.message} || 'An unknown error occured')
})


mongoose.connect(url)
    .then(()=>{
        app.listen(3000, ()=>{
            console.log('Connected succesfully with DB listening on port 3000');
    })
})
.catch(err => {
    console.log(err);
})

