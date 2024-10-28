//__Đây là module chuyên dùng anh service để nói chuyện qua lại
//giữa controller và database

import User from '~/models/schemas/User.schema'
import databaseServices from './database.services'

class UserServices {
  //register sẽ là hàm nhận vào object chứa email và password mà mình rã từ req.body ở bên controller
  //mình sẽ định nghĩa
  async register(payload: { email: string; password: string }) {
    //nhận vào rồi thì cx phân rã ra xài chứ
    const { email, password } = payload
    const result = await databaseServices.users.insertOne(
      new User({
        email,
        password
      })
    )
    return result
    //trả ra để có thể thông qua res mà báo cho người dùng
  }
}

//tạo ra instance rồi export
const userServices = new UserServices()
export default userServices
