const uuid = require('uuid')
const path = require('path')
const {Product, ProductInfo, Rating} = require('../models/models')
const ApiError = require('../error/ApiError')

class ProductController{
    async create (req, res, next){
        try {
            let {name, price, brandId, typeId, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            await img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const product = await Product.create({name, price, brandId, typeId, img: fileName})

            if (info){
                info = JSON.parse(info)
                info.forEach(i =>
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    })
                )
            }

            return res.json(product)
        } catch (e){
            next(e.badRequest(e.message))
        }
    }

    async getAll (req, res){
        let {brandId, typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let products
        if (!brandId && !typeId){
            products = await Product.findAndCountAll({limit, offset})
        }
        if (brandId && !typeId){
            products = await Product.findAndCountAll({where: {brandId}, limit, offset})
        }
        if (!brandId && typeId){
            products = await Product.findAndCountAll({where: {typeId}, limit, offset})
        }
        if (brandId && typeId){
            products = await Product.findAndCountAll({where: {brandId, typeId}, limit, offset})
        }
        return res.json(products)
    }

    async getOne (req, res){
        const {id} = req.params
        const product = await Product.findOne(
            {
                where: {id},
                include: [{model: ProductInfo, as: 'info'}]
            }
        )
        return res.json(product)
    }

    async addRating (req, res, next){
        const { id } = req.params
        const { rating } = req.body

        if (!rating || rating < 1 || rating > 5){
            return next(ApiError.badRequest('Invalid rating'))
        }

        const product = await Product.findOne({ where: { id } })

        if (!product){
            return next(ApiError.badRequest('Product not found'))
        }

        const newRating = (product.rating * product.numRatings + rating) / (product.numRatings + 1)

        await Product.update(
            { rating: newRating, numRatings: product.numRatings + 1 },
            { where: { id } }
        )

        await Rating.create({ productId: id, rating })

        return res.json({ message: 'Rating added successfully'})
    }
}

module.exports = new ProductController()