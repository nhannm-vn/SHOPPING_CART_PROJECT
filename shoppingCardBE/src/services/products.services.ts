import { CreateProductReqBody } from '~/models/requests/products.request'
import databaseServices from './database.services'
import Product from '~/models/schemas/Product.schema'
import { ObjectId } from 'mongodb'
import ProductMedia from '~/models/schemas/ProductMedia.schema'
import { ErrorWithStatus } from '~/models/Errors'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

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

  async getProductById(id: string) {
    //_Bình thường thì chỉ cần truy cập đến collection và tìm thôi
    //_Tuy nhiên mình chia collection nên không thể lấy full thông tin mà phải lockup(join)
    //_Nên mình phải sử dụng các aggrerate mới lấy full thông tin được

    //_Mình biết luôn kq sẽ dưới dạng mảng và mình lấy phàn tử đầu tiên
    const products = await databaseServices.products
      .aggregate([
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              _id: new ObjectId(id)
            }
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: 'product_medias',
              localField: '_id',
              foreignField: 'product_id',
              as: 'medias_infor'
            }
        },
        {
          $project: {
            medias: {
              $map: {
                input: '$medias_infor',
                as: 'media',
                in: '$$media.media'
              }
            },
            _id: 1,
            name: 1,
            quantity: 1,
            price: 1,
            description: 1,
            rating_number: 1,
            brand_id: 1,
            origin: 1,
            volume: 1,
            weight: 1,
            height: 1,
            width: 1,
            sold: 1,
            status: 1,
            category_id: 1,
            ship_category_id: 1
          }
        }
      ])
      .toArray() //converse json về mảng
    //_Nếu mảng rỗng thì nghĩa là không có
    if (products.length === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      })
    }
    //_Nếu có thì return thằng số 0
    return products[0]
  }

  async getAllProducts({
    page, //
    limit
  }: {
    page: number
    limit: number
  }) {
    //_skip nghĩa là bỏ qua những trang nào
    //_đầu tiên thì mình sẽ có một đống sản phẩm lấy được
    //và sau đó mình skip tới chỗ mình lấy
    //và từ chỗ đó lấy lên limit sản phẩm
    const products = await databaseServices.products
      .aggregate([
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: 'product_medias',
              localField: '_id',
              foreignField: 'product_id',
              as: 'medias_infor'
            }
        },
        {
          $project: {
            medias: {
              $map: {
                input: '$medias_infor',
                as: 'media',
                in: '$$media.media'
              }
            },
            _id: 1,
            name: 1,
            quantity: 1,
            price: 1,
            description: 1,
            rating_number: 1,
            brand_id: 1,
            origin: 1,
            volume: 1,
            weight: 1,
            height: 1,
            width: 1,
            sold: 1,
            status: 1,
            category_id: 1,
            ship_category_id: 1
          }
        }
      ])
      .toArray()
    return products
  }
}

const productsServices = new ProductsServices()
export default productsServices
