const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema(
    {
        title: {type:String, required:true},
        description: {type:String,required:true},
        image:{type:String, required:true},
        address:{type:String, required:true},
        creator:{type: mongoose.Types.ObjectId, required:true, ref:'Users'}
    }
)

const place = new mongoose.model('Places',placeSchema)

module.exports = place