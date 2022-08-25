const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema(
    {
        name:{type:String, required:true},
        email:{
            type:String, 
            required:true, 
            unique:true, 
            lowercase:true,
            match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill your email address"]
        },
        password:{type:String, required:true},
        image:{type:String},
        places:[{type:mongoose.Types.ObjectId, ref:'Places'}]
    }
)
userSchema.plugin(uniqueValidator)

const user = new mongoose.model('Users',userSchema)

module.exports = user

