import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { USER_ROLE } from '~/constants/enums'
import { CreateBrandReqBody } from '~/models/requests/brands.request'
import Brand from '~/models/schemas/Brand.schema'

class BrandsServices {
  async isAdmin(user_id: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      role: USER_ROLE.Admin
    })
    return Boolean(user)
  }

  async createBrand(brand: CreateBrandReqBody) {
    const brandInserted = await databaseServices.brands.insertOne(
      new Brand({
        ...brand
      })
    )
    return brandInserted
  }
}

const brandsServices = new BrandsServices()
export default brandsServices
