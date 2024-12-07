//_Vì mình chỉ có duy nhất một databse là shoppingCardDBK19F2_dev
//nên database sẽ k có s. Và mặc khác services là dịch vụ nên sẽ có s

//_Chơi với database thì phải phòng trường hợp rớt mạng và
//  luôn luôn coi thử khúc nào là promise

//_dotenv là một thư viện giúp cho mình có thể đọc được thông tin ở trong file .env
//vì nó là một file rất bảo mật
import dotenv from 'dotenv'
//config để kết nối
dotenv.config()

//_fix về es_module cho hợp lệ ts
import { Collection, Db, MongoClient } from 'mongodb'
import Brand from '~/models/schemas/Brand.schema'
import Category from '~/models/schemas/Category.schema'
import Product from '~/models/schemas/Product.schema'
import ProductMedia from '~/models/schemas/ProductMedia.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcardprojectclus.t8nte.mongodb.net/?retryWrites=true&w=majority&appName=shoppingCardProjectClusterAgain`

//_Viết class để dễ quản lí
class DatabaseServices {
  //_Biến các phần tử instance thành property để dễ sử dụng và khỏi gọi lại hoài mệt
  //    tạo thằng nào thì định nghĩa thẳng thằng đó luôn để dễ sử dụng
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    //khi em tạo instance thì em tự động kết nối cho anh
    //*Vì kết nối như vậy nên k cần kết nối vô project làm gì nữa mà vào thẳng databse luôn
    this.db = this.client.db(process.env.DB_NAME)
    //fix như vậy sẽ xài đc nhiều chỗ thay vì chỉ có trong method connect thôi
  }
  //hàm giúp mình connect với database
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      //_Khi mà rớt mạng, hoặc sai link, vì mình biết chỉ có trh vậy thôi thì mình sẽ log ra để xem
      //đồng thời ném ra lỗi để dừng hệ thống. Vì bug rồi thì chạy tiếp làm gì
      console.log(error)
      throw error
    } //nếu có bị lỗi chỉ có thể là rớt mạng

    //_k dùng finally vì như vậy sau khi kết nối nó sẽ đóng lại luôn,
    //và mình sẽ k thể gữi request đc nữa
  }

  //hàm giúp mình connect đi vào collection users. Mình sẽ dùng accessor như một property để khỏi xài ()
  get users(): Collection<User> {
    //_Khi mình đưa chuột vào biết nó là gì rồi thì phải định nghĩa cụ thể và nhờ vào schema user

    //_ai gọi thì trả ra đường dẫn dựa vào db rồi vào collection users luôn. Khi đó họ có nó thì muốn
    //muốn làm gì thì làm
    //xài env để giấu luôn
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
    //vì nó quá bảo mật tới mức nó còn không hiểu thằng đó ở dạng gì cho nên phải thêm mô tả cho nó
  }

  //hàm giúp mình connect đi vào collection chuyên chứa các refresh_token
  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get brands(): Collection<Brand> {
    return this.db.collection(process.env.DB_BRANDS_COLLECTION as string)
  }

  get categories(): Collection<Category> {
    return this.db.collection(process.env.DB_CATEGORY_COLLECTION as string)
  }

  get products(): Collection<Product> {
    return this.db.collection(process.env.DB_PRODUCTS_COLLECTION as string)
  }

  //_databse chuyên dùng để lưu hình ảnh của product dưới mối quan hệ 1product-nSanpham
  get productMedias(): Collection<ProductMedia> {
    return this.db.collection(process.env.DB_PRODUCT_MEDIA_COLLECTION as string)
  }

  //_Tạo index theo hướng firscode nghĩa là viết code ở đây để tạo trên db
  //_Các index này giúp tăng performace trên mongo
  //_Để và để tăng thêm hiệu suất nữa thì mình cần kiểm tra xem
  //các index có tồn tại chưa. Nếu chưa tồn tại thì đã tạo mới mỗi khi chạy server
  async indexUsers() {
    //check
    const exists = await this.users.indexExists(['_id_', 'username_1', 'email_1', 'email_1_password_1'])
    if (!exists) {
      //_username cũng như _id cũng là unique
      await this.users.createIndex({ username: 1 }, { unique: true })
      //_email cung nhu _email cung la unique
      await this.users.createIndex({ email: 1 }, { unique: true })
      //_và key component vì nga có xu hướng tìm 1 cập
      await this.users.createIndex({ email: 1, password: 1 })
    }
  }

  //_Tạo index cho refresh token
  async indexRefreshToken() {
    const exists = await this.refresh_tokens.indexExists(['_id_', 'token_1', 'exp_1'])
    if (!exists) {
      await this.refresh_tokens.createIndex({ token: 1 }, { unique: true })
      //TTL index tự động rà soát và xóa những thằng document hết hạn
      //đây là công nghệ mới thay thế cho cron job
      await this.refresh_tokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
}
//_Tạo ra instance rồi export
const databaseServices = new DatabaseServices()
export default databaseServices
