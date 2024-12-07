import { CreateProductReqBody } from '~/models/requests/products.request'
import databaseServices from './database.services'
import Product from '~/models/schemas/Product.schema'
import { ObjectId } from 'mongodb'
import ProductMedia from '~/models/schemas/ProductMedia.schema'

class ProductsServices {
  async createProduct(productInfor: CreateProductReqBody) {
    //_Lưu ý: productSchema thì không hề lưu media
    //nhưng mà khi người dùng muốn tạo product thì họ sẽ gửi lên thông tin có media
    //==> ý tưởng: những thông tin bthg thì sẽ lưu vào product
    //còn những cái ảnh riêng thì sẽ được lưu vào collection productMedia
    //*Như vậy với thông tin mà người dùng truyền lên mình sẽ lưu ở 2 cái bảng
    //Product và ProductMedias
    //
    //
    //_Tạo product
    //trước tiên mình phải nhớ rằng mình phải lưu product vào database
    //nhưng trong productInfor lại có media

    //_tack ra và lấy medias
    const { medias, ...product } = productInfor

    //_result là product mới thêm vào và nó sẽ có mã inserted_id và nó
    //giúp mình làm product_id để lưu vào collection kia
    const result = await databaseServices.products.insertOne(
      new Product({
        ...product,
        brand_id: new ObjectId(product.brand_id),
        category_id: new ObjectId(product.category_id),
        ship_category_id: new ObjectId(product.ship_category_id)
      })
    )

    const product_id = result.insertedId
    //mapping media thành productMedia
    //nghĩa là biến từng thằng trong mảng media thành productMedia
    const mediaProduct = medias.map((media) => {
      return {
        product_id,
        media
      }
    }) as ProductMedia[]

    //_Thêm vào database
    await databaseServices.productMedias.insertMany(mediaProduct)
    return result
  }
}

const productsServices = new ProductsServices()
export default productsServices
