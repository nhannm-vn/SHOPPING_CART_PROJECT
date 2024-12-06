import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { USER_ROLE } from '~/constants/enums'
import { CreateBrandReqBody } from '~/models/requests/brands.request'
import Brand from '~/models/schemas/Brand.schema'

class BrandsServices {
  async createBrand(brand: CreateBrandReqBody) {
    const brandInserted = await databaseServices.brands.insertOne(
      new Brand({
        ...brand
      })
    )
    return brandInserted
  }

  async getBrandById(id: string) {
    const brand = await databaseServices.brands.findOne({
      _id: new ObjectId(id)
    })
    return brand
  }

  async getAllBrands() {
    //_Lưu ý: nếu k có toArray() thì kq trả ra rất ghê
    const brands = await databaseServices.brands.find().toArray()
    return brands
  }
}

const brandsServices = new BrandsServices()
export default brandsServices
