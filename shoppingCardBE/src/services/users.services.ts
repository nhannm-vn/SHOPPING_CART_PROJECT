//__Đây là module chuyên dùng anh service để nói chuyện qua lại
//giữa controller và database

import User from '~/models/schemas/User.schema'
import databaseServices from './database.services'
import { RegisterReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

class UserServices {
  //_Vì mình viết 2 chữ ký thì phải qua đây
  //vì đây là vì đây sẽ là hàm sẽ ký ra chữ ký khi đã tạo thành công tài khoản nghĩa là khi dữ liệu đã đầy đủ và chuẩn
  //mặc khác khi ký xong sẽ có nhu cầu lu trên db và trả ra user nên ở đây

  //_Khi em gọi hàm này, đưa cho anh user_id để định danh thì anh sẽ đưa lại cho mã token
  private signAccessToken = (user_id: string) => {
    //**Lưu ý: signToken là một promise nhưng mình sẽ k await vì nếu mình await
    //thì nó sẽ phải đợi. nên mình sẽ return ra luôn
    //nên dẫn tới khi nào mình xài hàm thì mới cần await
    return signToken({
      //_payload sẽ chứa user_id để định danh để biết nó là account nào, đồng thời chứa coi type của nó chức năng dùng để làm gì
      payload: { user_id, token_Type: TokenType.AccessToken },
      //_option sẽ truyền cho nó thời gian hết hạn của nó, không để arthims thì mặc đinh là sh256
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  private signRefreshToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_Type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

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
    //_Lúc này khi đăng ký thành công thì sẽ tạo cho 2 cái mã và trả cho người dùng luôn để người dùng cầm quyền có thể đăng nhập vào liền
    //mình sẽ đợi 2 thằng này tạo ra mã sẽ tốn time nhưng mình sẽ cho 2 thằng chạy bất dồng bộ cho đỡn tốn time
    //vậy khi có tốn time thì sẽ tốn time 1 lần thôi

    //_Mình muốn tạo ra 2 cái mã thì cần user_id để định danh tuy nhiên. Mình sẽ không biết
    //cái mã đó lấy như thế nào. Tuy nhiên may mắn là trong result khi register đăng ký thành công thì có
    //insertedid tuy nhiên nó là object cần biến về string
    const user_id = result.insertedId.toString()

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //==> Khi mà đăng ký thành công thì sẽ đưa luôn 2 cái chữ ký để người ta xài luôn
    return {
      accessToken,
      refreshToken
    }
  }
}

//tạo ra instance rồi export
const userServices = new UserServices()
export default userServices
