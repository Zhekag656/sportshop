const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const {Basket} = require("../models/models");


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
// router.get('/basket', authMiddleware, async (req, res, next) => {
//     const basket = await Basket.findOne({where: {userId: req.user.id}})
//     return res.json(basket)
// })


module.exports = router