const Router = require('express')
const router = new Router()
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/authMiddleware')


router.get('/', authMiddleware, basketController.getBasket)
router.post('/', authMiddleware, basketController.addProductsToBasket)
router.delete('/:id', authMiddleware, basketController.removeProductsFromBasket)


module.exports = router