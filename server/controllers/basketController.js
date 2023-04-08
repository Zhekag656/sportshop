const {Basket, BasketProduct} = require("../models/models");
const ApiError = require("../error/ApiError");
const product = require('../controllers/productController')


class BasketController {
    async getBasket(req, res, next) {
        try {
            const basket = await Basket.findOne({where: {userId: req.user.id}})
            if (!basket) {
                return res.json([])
            }
            return res.json(basket.products)
        } catch (e) {
            return next(e)
        }
    }

    async addProductsToBasket(req, res, next) {
        const {productId, name, price, count} = req.body
        try {
            let basket = await Basket.findOne({where: {userId: req.user.id}})
            if (!basket) {
                basket = await Basket.create({
                    userId: req.user.id,
                    products: [{id: productId, name, price, count}]
                })
                return res.json(basket.products)
            }
            const productIndex = basket.products.findIndex((p) => p.id === productId)
            if (productIndex >= 0) {
                basket.products[productIndex].count += count
            } else {
                basket.products.push({id: productId, name, price, count})
            }
            await basket.save()
            return res.json(basket.products)
        } catch (e) {
            return next(e)
        }
    }

    async removeProductsFromBasket(req, res, next) {
        try {
            const {id} = req.params;
            const basket = await Basket.findOne({where: {userId: req.user.id}});
            const basketItem = await BasketProduct.findOne({
                where: {basketId: basket.id, productId: id},
            });

            if (!basketItem) {
                return next(ApiError.badRequest('Item not found in cart'));
            }

            await basketItem.destroy();
            return res.json({message: 'Item removed from cart'});
        } catch (err) {
            next(err);
        }
    }
}
module.exports = new BasketController();