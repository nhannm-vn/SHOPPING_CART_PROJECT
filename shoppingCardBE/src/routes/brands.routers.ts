import express from 'express'
import { createBrandController, getAllBrandsController, getBrandByIdController } from '~/controllers/brands.controllers'
import { createBrandValidator, idMongoParamValidator } from '~/middlewares/brands.middlewares'
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

/**
 * desc: get infor by id
 * method: GET
 * path: /brands/:id
 * _không cần header vì chưa đăng nhập vẫn cho coi
 */
//_truyền lên id cho mình và mình sẽ tìm
brandRouter.get(
  '/:id', //
  idMongoParamValidator,
  wrapAsync(getBrandByIdController)
)

/**
 * desc: get all brands
 * method: GET
 * path: /brands
 */
//path vẫn là brands nhưng nếu post thì thêm còn get thì lấy all brand
brandRouter.get('/', wrapAsync(getAllBrandsController))

export default brandRouter
