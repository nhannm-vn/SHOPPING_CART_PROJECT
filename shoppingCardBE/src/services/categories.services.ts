import { CreateCategoryReqBody } from '~/models/requests/categories.request'
import databaseServices from './database.services'
import Category from '~/models/schemas/Category.schema'

class CategoriesServices {
  async createCategory(category: CreateCategoryReqBody) {
    const categoryInserted = await databaseServices.categories.insertOne(
      new Category({
        ...category
      })
    )
    return categoryInserted
  }
}

const categoriesServices = new CategoriesServices()
export default categoriesServices
