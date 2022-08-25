const express = require('express')
const router = express.Router()
const placesController = require('../controllers/places.controller')
const { check } = require('express-validator')

router.get('/:pid',placesController.getPlacesById)
router.get('/userPlaces/:uid',placesController.getPlacesByUserId)


router.post('/add-places',
[
    check('title')
     .not()
     .isEmpty(),
    check('description')
        .isLength({min:5}),
   check('address')
    .not()
    .isEmpty()     
],

placesController.addPlaces)

router.patch('/update-place/:pid',
[
    check('title')
        .not()
        .isEmpty(),
    check('description')
        .isLength({min:5})
],
placesController.updatePlace)

router.delete('/delete/:pid',placesController.deletePlace)

module.exports = router