const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const userModel = require('../models/user.model')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const getUsers = async (req, res, next) => {
  let result
  try {
    result = await userModel.find({}, '-password')
  } catch (error) {
    throw new HttpError(error.message)
  }
  res.json({ result: result.map((users) => users.toObject({ getters: true })) })
}

const registerUser = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw new HttpError('Unvalid inputs please correct them!', 400)
  }

  const { name, email, password } = req.body

  const hashedPassword = await bcrypt.hash(password,10)

  const user = new userModel({
    name,
    email,
    image: 'flosk.png',
    password:hashedPassword,
    places: [],
  })
  try {
    const result = await userModel.create(user)
    res.json({ result })
  } catch (error) {
    res.json({ error: error.message })
  }
}

const loginUser = async (req, res, next) => {
  const { email, password } = req.body

  
  let existUser
  try {
    existUser = await userModel.findOne({ email: email })
  } catch (err) {
    return next(new HttpError('Something went wrong!', 422))
  }
  if (!existUser) {
    return next(new HttpError('Invalid credentials', 401))
  }
  if(!(await bcrypt.compare(password, existUser.password))){
    return next(new HttpError('Invalid credentials', 401))
  }
  const token = jwt.sign({_id:existUser._id},'anykey')
  res.json({ message:{token}, user: existUser.toObject({ getters: true }) })
}
exports.getUsers = getUsers
exports.registerUser = registerUser
exports.loginUser = loginUser
