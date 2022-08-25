const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const placeModel = require("../models/place");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const user = require("../models/user.model");

const dummy_places = [
  {
    id: "p1",
    title: "Empire State",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://www.history.com/.image/t_share/MTU3ODc4NjA0ODYzOTA3NTUx/image-placeholder-title.jpg",
    address: "29 w 34th St, New York, NY 10001",
    location: {
      lat: 40.74844405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Hamburger Aba",
    description: "One of the most famous burger shops in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Hamburger_Aba_Prishtina.jpg/1600px-Hamburger_Aba_Prishtina.jpg?20181001133614",
    address: "Prishtine, 10000",
    location: {
      lat: 42.667542,
      lng: 21.166191,
    },
    creator: "u1",
  },
  {
    id: "p3",
    title: "New Born",
    description: "Kosova newest country in the world",
    imageUrl: "https://pbs.twimg.com/media/EwCNjEQWQAQQMr9.jpg",
    address: "Pristina",
    location: {
      lat: 45.333,
      lng: -73.09,
    },
    creator: "u2",
  },
];
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
    place = await placeModel.findByIdAndDelete(placeId).populate('creator')
    res.json(place);
  } catch (error) {
    throw new HttpError(error.message);
  }

  try{
    place.remove()
    place.creator.places.pull(place)
    place.creator.save()

  }catch(error){
    throw new HttpError(error.message)
  }
};

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.addPlaces = addPlaces;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
