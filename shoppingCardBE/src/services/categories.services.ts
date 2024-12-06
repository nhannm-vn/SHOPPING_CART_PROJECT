import { CreateCategoryReqBody } from '~/models/requests/categories.request'
import databaseServices from './database.services'
import Category from '~/models/schemas/Category.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { CATEGORY_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class CategoriesServices {
  async createCategory(category: CreateCategoryReqBody) {
    const categoryInserted = await databaseServices.categories.insertOne(
      new Category({
        ...category
      })
    )
    return categoryInserted
  }

  async getCategoryById(id: string) {
    const category = await databaseServices.categories.findOne({
      _id: new ObjectId(id)
    })
    if (!category) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND
      })
    }
  }
}

const categoriesServices = new CategoriesServices()
export default categoriesServices
