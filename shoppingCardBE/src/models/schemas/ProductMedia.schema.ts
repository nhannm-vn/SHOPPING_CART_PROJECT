import { ObjectId } from 'mongodb'
import { Media } from '../Other'

interface ProductMediaType {
  _id?: ObjectId
  product_id: ObjectId //tên sp
  media: Media //hình sp
}

//_Mình sẽ không lưu ở dạng mảng
//vì mình sẽ lưu dưới dạng 1-nhiều
//1 product thì có nhiều sản phẩm

export default class ProductMedia {
  _id?: ObjectId
  product_id: ObjectId
  media: Media
  constructor(productMedia: ProductMediaType) {
    this._id = productMedia._id || new ObjectId()
    this.product_id = productMedia.product_id
    this.media = productMedia.media
  }
}
