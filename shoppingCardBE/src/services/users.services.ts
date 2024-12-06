//__Đây là module chuyên dùng anh service để nói chuyện qua lại
//giữa controller và database

import User from '~/models/schemas/User.schema'
import databaseServices from './database.services'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()

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
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      //_option sẽ truyền cho nó thời gian hết hạn của nó, không để arthims thì mặc đinh là sh256
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  //_Mình sẽ truyền thêm exp nhằm khi refresh token thì sẽ xóa
  //và tạo ra token mới có ngày hết hạn trùng với thằng cũ. Nếu không thì nó
  //sẽ lặp đi lặp lại hoài
  private signRefreshToken = (user_id: string, exp?: number) => {
    //_Nếu truyền lên exp thì sẽ tạo cái token có exp theo thằng cũ. Nếu không có nghĩa là token hoàn toàn mới thì sẽ quy định theo expireIn
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    } else {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
      })
    }
  }

  //_hàm ký ra email_verify_token
  private signEmailVerifyToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }

  //_hàm ký ra forgot_password_token
  private signForgotPasswordToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }

  //_flow là mình thêm iat và exp vào ràng buộc obj
  //chính vì vậy trước khi lưu vào databse ta cần lấy ra được
  //iat và exp thì mới có cái lưu vào được. Mà tụi nó nằm trong token
  //cụ thể là vùng payload nên cần verify ra để lấy
  //mình viết thêm cái hàm cho đẹp thôi chứ thật ra là đang bọc lại hàm khác
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async isAdmin(user_id: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      role: USER_ROLE.Admin
    })
    return Boolean(user)
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

  //_hàm kiểm tra refresh_token có trong hệ thống hay không
  //mình kỹ nên mình sẽ tìm dựa trên thêm user_id nữa
  async checkRefreshToken({
    user_id, //
    refresh_token
  }: {
    user_id: string
    refresh_token: string
  }) {
    const refreshToken = await databaseServices.refresh_tokens.findOne({
      token: refresh_token,
      user_id: new ObjectId(user_id)
    })
    //nếu mà k tìm thấy thì bắn ra lỗi luôn. Và bên controller sẽ k sợ bung khi gọi hàm check. Vì nó đã
    //wrapAsync bao bọc nên nếu có lỗi thì sẽ dc tập kết về tầng xử lý
    if (!refreshToken) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    return refreshToken
  }

  async checkEmailVerifyToken({
    user_id, //
    email_verify_token
  }: {
    user_id: string
    email_verify_token: string
  }) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })

    //_Nếu không có user thì báo lỗi luôn// Nếu k tìm thấy chỉ có thể là hết hạn

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID
      })
    }

    //_Nếu bthg thì return ra luôn user
    return user
  }

  async checkForgotPasswordToken({
    user_id, //
    forgot_password_token
  }: {
    user_id: string
    forgot_password_token: string
  }) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token
    })
    //_Nếu không tìm thấy thì báo lỗi luôn. Và lỗi này là mã k chuẩn
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
      })
    }
    return user
  }

  async checkEmailVerified(user_id: string) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
    return user?.verify == UserVerifyStatus.Verified
  }

  //register sẽ là hàm nhận vào object chứa email và password mà mình rã từ req.body ở bên controller
  //mình sẽ định nghĩa
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()

    //_Khi đăng ký tài khoảng thì ký luôn cho nó cái token để soạn sẵn cái link và gửi về mail cho nó
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    await databaseServices.users.insertOne(
      new User({
        //_Vì user_id mình tự tạo nên mình sẽ update vào lúc register luôn
        _id: user_id,
        ...payload,
        email_verify_token,
        //_Mỗi lần mà đk 1 tk thì tạo ra 1 userName k trùng trên toàn hệ thống
        //để tiện cho việc tìm kiếm
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        //mã hóa luôn password trước khi lưu vào database
        password: hashPassword(payload.password)
      })
    )

    //_Soạn sẵn cái đoạn link có chứa token và gửi về cho người dùng trong mail. Họ bấm vào là sẽ bắn ngược lại và mình sẽ kiểm tra các kiểu
    //==> nghĩa là khi nó bấm vào đồ mình đã soạn sẵn thì mình sẽ xài chức năng verify-email. Lúc đó sẽ kiểm tra token có chuẩn k và tiến hành fix verify các kiểu
    console.log(`
        mô phỏng link email xác thực đăng ký:
        http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
    `)

    //_Lúc này khi đăng ký thành công thì sẽ tạo cho 2 cái mã và trả cho người dùng luôn để người dùng cầm quyền có thể đăng nhập vào liền
    //mình sẽ đợi 2 thằng này tạo ra mã sẽ tốn time nhưng mình sẽ cho 2 thằng chạy bất dồng bộ cho đỡn tốn time
    //vậy khi có tốn time thì sẽ tốn time 1 lần thôi

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    //_Minh verify để lấy iat và exp để lưu vào collection
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    //_trước khi trả 2 cái mã ra thì lưu rf vào collection

    await databaseServices.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token as string,
        iat,
        exp
      })
    )

    //==> Khi mà đăng ký thành công thì sẽ đưa luôn 2 cái chữ ký để người ta xài luôn
    return {
      access_token,
      refresh_token
    }
  }

  async findUserById(user_id: string) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
    //_nếu không tìm thấy thì báo lỗi luôn
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }

  async findUserByEmail(email: string) {
    const user = await databaseServices.users.findOne({ email })
    //_nếu không tìm thấy thì báo lỗi luôn
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }

  //login là hàm sẽ kiểm tra xem có người dùng truyền lên email và password có trong db không. Nếu có thì
  //trả ra ac rf để ngta sử dụng luôn
  async login({ email, password }: LoginReqBody) {
    //_Lưu ý: muốn tìm thì phải hashPassword mới dò được. Vì mình lưu trên db dưới dạng hash
    const user = await databaseServices.users.findOne({
      email,
      password: hashPassword(password)
    })
    //neu k tim thay
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    const user_id = user._id.toString()
    //neu co thi tao ac va rf bthg
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    //_Sau đó mình sẽ verify để lấy iat và exp để lưu vào collection
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    //_trước khi trả 2 cái mã ra thì lưu rf vào collection

    await databaseServices.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token as string,
        iat,
        exp
      })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseServices.refresh_tokens.deleteOne({ token: refresh_token })
  }

  async verifyEmail(user_id: string) {
    //_mình sẽ update verify về 1 và set email_verify_token = ''
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )

    //_Sau khi verify thành công thì cung cấp luôn dịch vụ cho họ xài bằng ac và rf
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    //_Minh verify để lấy iat và exp để lưu vào collection
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    //thêm refresh token vào collection
    await databaseServices.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token as string,
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerify(user_id: string) {
    //_Mình sẽ ký lại mã mới và update trên databse đồng thời gửi cho họ
    //_Tạo lại mã email_verify_token
    const email_verify_token = await this.signEmailVerifyToken(user_id)

    //_update mã verify trên hệ thống
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //_tìm kiếm thằng cần update
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //_gửi mail verify lại cho người dùng:
    console.log(`
      mô phỏng link email xác thực đăng ký:
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
    `)
  }

  async forgotPassword(email: string) {
    //_tìm xem user nào bị quên mật khẩu dựa trên email
    const user = (await this.findUserByEmail(email)) as User
    //_Lấy user_id để ký forgot_password_token
    const user_id = user._id as ObjectId
    const forgot_password_token = await this.signForgotPasswordToken(user_id.toString())
    //_Update cái mã đó vào database
    await databaseServices.users.updateOne(
      { _id: user_id }, //
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )

    //_Soạn đoạn link có chứa token và gửi qua mail
    //_gửi mail
    console.log(`
      mô phỏng gửi link qua mail để đổi mật khẩu:
      http://localhost:8000/reset-password/?forgot_password_token=${forgot_password_token}
    `)
    //thứ em nhận được là đường link đến giao diện đổi mật khẩu
  }

  async resetPassword({
    user_id, //giúp tìm tới user
    password
  }: {
    user_id: string
    password: string
  }) {
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) }, //
      {
        //_Khi lay thi giau bot thong tin nhay cam
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    //_Mình có thể lấy user qua kia rồi mới lọc thông tin bằng omit tuy nhiên v nó sẽ k hay
    //_Neu k thay thi bao loi luon
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }

  async updateMe({
    user_id, //
    payload
  }: {
    user_id: string
    payload: UpdateMeReqBody
  }) {
    //_1. Cái dở là mình sẽ không biết được payload chứa gì
    //_2. nếu truyền lên date_of_birth thì phải đổi lại kiểu dữ liệu
    const _payload = payload.date_of_birth
      ? {
          ...payload,
          date_of_birth: new Date(payload.date_of_birth)
        }
      : payload
    //_3. nếu truyền lên username thì phải kiểm tra coi có phải là duy nhất không(unique)
    if (_payload.username) {
      const user = await databaseServices.users.findOne({ username: _payload.username })
      //nếu có thì báo lỗi và dừng cuộc chơi
      if (user) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS,
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY
        })
      }
    }

    //****Mình sẽ xài method đặc biệt của mongo giúp vừa tìm vừa update và trả ra kết quả update. Đó là lý do tại sao truyền id và payload
    const userInfor = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      //update xong thì mới trả ra. Và combo giấu luôn nhạy cảm
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    //_Trả thông tin ra cho người dùng
    return userInfor
  }

  //_Luyen tap truoc

  async getProfile(username: string) {
    //_Tìm user dựa vào username, đồng thời mình sẽ giấu bớt vài thuộc tính nhạy cảm
    const user = databaseServices.users.findOne(
      { username }, //
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          create_at: 0,
          update_at: 0
        }
      }
    )
    //_Nếu không tìm thấy thì mình sẽ báo lỗi luôn
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }

  async changePassword({
    user_id, //
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    //_Tìm thử xem có user nàm không dựa vào user_id và old_password
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })

    //_Nếu mà tìm không thấy nghĩa là người dùng nhập sai password. Nghĩa là k có quyền sở hữu account
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    //_Nếu mà vượt qua nghĩa là tìm thấy. Mà tìm thấy thì mình sẽ tiến hành thay đổi pass cho nó
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            password: hashPassword(password),
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  async refreshToken({
    user_id, //
    refresh_token,
    exp
  }: {
    user_id: string
    refresh_token: string
    exp: number
  }) {
    //_Ký ra access và refresh mới
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      //**Đặc biệt là ký cho chức năng này thì cần exp cũ. Chứ nếu lấy cái mới nữa thì xài tới khi nào
      this.signRefreshToken(user_id, exp)
    ])

    //_Tìm và xóa refresh token cũ
    await databaseServices.refresh_tokens.deleteOne({
      token: refresh_token
    })

    //_đối với thằng này thì chỉ cần iat thôi còn exp thì lấy param truyền vào
    const { iat } = await this.decodeRefreshToken(refresh_token)

    //_Lưu refresh_token mới vào database
    await databaseServices.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat,
        exp //sẽ lấy exp của thằng cũ luôn chứ k cần decode gì cả
      })
    )

    //_Trả ra cho người ta sử dụng luôn
    return {
      access_token,
      new_refresh_token
    }
  }
}

//tạo ra instance rồi export
const userServices = new UserServices()
export default userServices
