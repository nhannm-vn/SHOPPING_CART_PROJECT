import express from 'express'
import {
  createProductController,
  getAllProductController,
  getProductByIdController
} from '~/controllers/products.controllers'
import { idMongoParamValidator } from '~/middlewares/brands.middlewares'
import { createProductValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const productsRouter = express.Router()

/*
    Description: Create a new product
    path: /products/
    method: POST
    Header: {Authorization: Bearer <access_token>
    body: {
        name: string
        quantity: number
        price: number
        description: string
        brand_id: ObjectId
        origin: string //xuất xứ
        volume: number // dung tích
        weight: number // khối lượng
        width: number
        height: number
        category_id: string //mã chủng loại
        ship_category_id: string //chủng loại để đặt đơn bên ghn
        media: string[]
    }
*/
productsRouter.post(
  '/',
  accessTokenValidator, //
  createProductValidator,
  wrapAsync(createProductController)
)

/*
Description: get a product by id
    path: /products/:id
    method: GET
*/

productsRouter.get(
  '/:id', //
  idMongoParamValidator,
  wrapAsync(getProductByIdController)
)

/*
Description: get all products with pagination
    path: /products/?page&limit
    method: GET
    
*/
//query string lưu ý cái ?page&limit không có biểu diễn trên router
//nhưng mà mình biết người dùng phải truyền thêm cái đó thì mới phân trang được
productsRouter.get(
  '/', //
  wrapAsync(getAllProductController)
)

export default productsRouter
