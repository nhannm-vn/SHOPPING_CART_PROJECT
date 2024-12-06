import express from 'express'
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

export default categoriesRouter
