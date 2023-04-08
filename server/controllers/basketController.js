const {Basket, BasketProduct} = require("../models/models");
const ApiError = require("../error/ApiError");
const product = require()

async function getBasket(req, res, next) {
    try {
        const basket = await Basket.findOne({where: {userId: req.user.id}})
        if (!basket){
            return res.json([])
        }
        return res.json(basket.products)
    } catch (e){
        return next(e)
    }
}

async function addProductsToBasket(req, res, next){
    const {productId, name, price, count} = req.body
    try {
        let basket = await Basket.findOne({where: { userId: req.user.id}})
        if (!basket){
            basket = await Basket.create({
                userId: req.user.id,
                products: [{id: productId, name, price, count}]
            })
            return res.json(basket.products)
        }
        const productIndex = basket.products.findIndex((p) => p.id === productId)
        if (productIndex >= 0){
            basket.products[productIndex].count += count
        } else {
            basket.products.push({id: productId, name, price, count})
        }
        await basket.save()
        return res.json(basket.products)
    } catch (e){
        return next(e)
    }
}

async function removeProductsFromBasket(req, res, next){
    try {
        const {id} = req.params
        const basket = await Basket.findOne({where: {userId: req.user.id}})
        const basketProduct = BasketProduct.findOne({
            where: { basketId: basket.id, productId: product.id}
        })

        if (!basketProduct){
            return next(ApiError.badRequest('Product not found in your cart'))
        }

        await basketProduct.destroy()
        return res.json({message: 'Product removed'})
    } catch (e){
        next(e)
    }
}