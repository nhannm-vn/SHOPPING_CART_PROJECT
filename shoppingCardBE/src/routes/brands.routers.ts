import express from 'express'
import { createBrandValidator } from '~/middlewares/brands.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

//_tạo router
const brandRouter = express.Router()

/**
 * desc: create a brand
 * method: POST(có method này là tự hiểu chứ để created thì dở)
 * path: /brands
 * //_Vì để tạo brand mới thì phải là admin mới được
 * ==> sẽ kiểm tra role bằng cách gửi lên access_token
 * headers: {
 *  Authorization: 'Bearer <access_token>'
 * }
 * body: {
 *  name: string,
 *  hotline: string,
 *  address: string
 * }
 *
 */
brandRouter.post(
  '/',
  accessTokenValidator, //
  createBrandValidator,
  wrapAsync(createBrandController)
)

export default brandRouter
