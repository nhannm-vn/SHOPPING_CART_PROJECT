//__Đây là module chuyên dùng anh service để nói chuyện qua lại
//giữa controller và database

import User from '~/models/schemas/User.schema'
import databaseServices from './database.services'
import { RegisterReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'

class UserServices {
  //_Vì mình muốn là trước khi tạo account thì check coi có trùng email trên hệ thống chưa
  //nên sẽ viết hàm tại đây
  async checkEmailExist(email: string): Promise<boolean> {
    //_nhờ database.services đi vào collection user và từ đó check thử giúp mình xem có email tồn tại chưa
    const user = await databaseServices.users.findOne({
      email: email
    })
    return Boolean(user)
  }

  //register sẽ là hàm nhận vào object chứa email và password mà mình rã từ req.body ở bên controller
  //mình sẽ định nghĩa
  async register(payload: RegisterReqBody) {
    const result = await databaseServices.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        //mã hóa luôn password trước khi lưu vào database
        password: hashPassword(payload.password)
      })
    )
    return result
    //trả ra để có thể thông qua res mà báo cho người dùng
  }
}

//tạo ra instance rồi export
const userServices = new UserServices()
export default userServices
