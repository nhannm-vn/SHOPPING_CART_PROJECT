import express from 'express'
import { createCategoryController, getCategoryController } from '~/controllers/catagories.controllers'
import { idMongoParamValidator } from '~/middlewares/brands.middlewares'
import { createCategoryValidator } from '~/middlewares/categories.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const categoriesRouter = express.Router()

/*
    Description: Create a new category
    path: /categories/create
    method: POST
    Header: {Authorization: Bearer <access_token>}
    body: {
      name: string
      desc: string
    }
*/

categoriesRouter.post(
  '/', //
  accessTokenValidator,
  createCategoryValidator,
  wrapAsync(createCategoryController)
)

/*
    Description: get a category infor by id
    path: /categories/:id
    method: get
*/
categoriesRouter.get(
  '/:id', //
  idMongoParamValidator,
  wrapAsync(getCategoryController)
)

export default categoriesRouter
