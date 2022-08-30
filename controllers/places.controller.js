const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const placeModel = require("../models/place");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const user = require("../models/user.model");


const getPlacesById = async (req, res, next) => {
  const placeId = req.params.pid;

  try {
    const result = await placeModel.findById(placeId);
    res.json(result);
  } catch (error) {
    throw new HttpError(error.message);
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const result = await placeModel.find({ creator: userId });
    
    res.json({ result });
  } catch (error) {
    throw new HttpError("Could not find places with given user id", 404);
  }
};

const addPlaces = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Inputs wrong passed", 400);
  }

  const { title, description, address, image, creator } = req.body;

  console.log(req.body);

  const createdPlace = new placeModel({
    title,
    image,
    description,
    address,
    creator,
  });

  let user;

  try {
    user = await userModel.findById(creator);
  } catch (error) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  try {
    // const sess = await mongoose.startSession();
    // console.log(sess);
    // sess.startTransaction();
    await createdPlace.save();
    user.places.push(createdPlace);
    await user.save();
    // await sess.commitTransaction();
  
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Inputs wrong passed", 400);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  try {
    const result = await placeModel.findByIdAndUpdate(
      { _id: placeId },
      { title: title, description: description }
    );
    res.json(result);
  } catch (error) {
    throw new HttpError(error.message);
  }
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;


  if (!placeId) {
    throw new HttpError("Could not find a place with this id", 404);
  }

  let place

  try {
    place = await placeModel.findById(placeId).populate('creator')
  } catch (err) {
    throw new HttpError(err.message);
  }

  try{
    await place.remove()
    place.creator.places.pull(place)
    await place.creator.save()
  }catch(err){
    throw new HttpError(err.message)
  }
};

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.addPlaces = addPlaces;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
