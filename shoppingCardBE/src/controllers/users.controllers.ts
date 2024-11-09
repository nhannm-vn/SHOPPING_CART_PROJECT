import { Request, Response, NextFunction } from 'express'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailToken
} from '~/models/requests/users.request'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'

//_Nghĩa là trong table users có rất nhiều controller

//_controller là nơi xử lí logic và dữ liệu. Dữ liệu đi được tới đây thì đã clear
//  controller là handler chuyên xử lí dữ liệu vào đúng các server, xử lí trích xuất dữ liệu
//  ==> bản chất controller không đc nch với db, chỉ có server mới nói chuyện với db
//  mình chỉ là người đưa dữ liệu cho database

//**Lưu ý: controller chỉ kiểm tra if-else for đồ thôi chứ k có kiểm tra xem dữ liệu có đúng kiểu hay đủ đầy nữa k
//sau đó sẽ có cái xe trung chuyển tên services, sau đó cái xe dó mới lên databse và mang dữ liệu đưa về cho controller và controller đưa cho người dùng

//_làm controller cho register, và sẽ nhờ chiếc xe service đem dữ liệu từ controller đi qua database lưu và đem ngược về
//sau đó bào cho người dùng
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  //LƯU Ý: thí dụ quên đi thì lúc req.body bên trong k có gì hết
  //vì bản chất con body nó được định nghĩa là any
  //==> có nhu đầu định nghĩa để biết bên trong nó có gì
  //chứ nếu mà k định nghĩa thì mình sẽ không biết chắc được bên trong có gì và . không có gì
  const { email } = req.body
  //nhờ chiếc xe services truy cập tới và thêm dữ liệu vào database dùm mình
  //_Đã đụng tới database thì sẽ có trường hợp rớt mạng nên cần try-catch

  //_Kiểm tra nếu mà email đã trùng trên server rồi thì báo lỗi,
  //nếu chưa có thì đi xuống dưới tiếp
  const isDup = await userServices.checkEmailExist(email)
  if (isDup) {
    //Bây giờ khi có lỗi thì mình sẽ đúc ra theo ErrorWithStatus vì thật ra nó cũng chỉ là cái lỗi bthg
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY //422
    })
  }

  const result = await userServices.register(req.body)
  //_sau khi thêm thành công thì báo tín hiệu, đồng thời trả result ra cho người dùng
  //_tạo thành công là 201
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    //_khi mà tạo account thành công thì nó sẽ đưa cho mình 2 cái mã nằm bên trong result
    result
  })
}

//_req ở trước hay sau middleware đều là 1
export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  // throw new Error('lỗi test thử message')
  //==> new lỗi thường thì sẽ k nhìn thấy được
  //_Chạy hàm kiểm tra xem có trong db không
  const result = await userServices.login(req.body)
  //_Nếu mà login thất bại thì throw đã bắn lỗi xuống catch và next đã đưa qua tầng xử lí lỗi rồi
  //vì mình có kiến trúc wrapAsync nên mình k cần lo throw bể

  //_Nếu mà có có lỗi thì nó đã xử lí luôn r. Còn nếu k có gì tới đây thì báo login thành công
  //đồng thời bắn sắc lệnh ra cho ngta sử dụng
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  //_Nó muốn logout thì đưa cho mình 2 cái mã. Và mình đã kiểm tra 2 cái mã đó là đúng do mình ký ra cho nó rồi
  //_Nhưng còn đòn hiểm ác là nó gửi ac của nó mà rf của mình. Thì cùng là mình ký nhưng user_id ở trong khác nhau. Nên cần kt
  const { user_id: user_id_at } = req.decode_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayload
  const { refresh_token } = req.body

  //_Nếu không giống nhau thì báo lỗi đb luôn
  if (user_id_at != user_id_rf) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  //_nếu cả 2 đều có id chuẩn rồi thì mình check thử xem là nó có quyền được sử dụng dịch vụ hay không
  //nếu có thì mới cho sử dụng dịch vụ logout
  await userServices.checkRefreshToken({
    user_id: user_id_at,
    refresh_token
  })

  // khi nào có mã đó trong database thì mình tiến hành logout nghĩa là xóa rf khỏi hệ thống
  await userServices.logout(refresh_token)

  //_Nếu xóa thành công thì sẽ xuống dưới đây. Mà nếu tới đây thì thông báo thành công
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, any, VerifyEmailToken>,
  res: Response,
  next: NextFunction
) => {
  //_Đầu tiên kiểm tra xem acount đó có tồn tại trong hệ thống không. Bằng user_id và email_verify_token
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const { email_verify_token } = req.query
  const user = await userServices.checkEmailVerifyToken({ user_id, email_verify_token })

  //_Nếu mà đã tồn tại account rồi thì mình sẽ kiểm tra tiếp xem thử là verify đang ở trạng thái nào
  //nếu như đã verify rồi thì k làm gì hết chỉ báo thôi. Nếu mà banned thì cũng vào. Còn unverify thì mới tiến hành verify
  if (user.verify == UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    //_nếu chưa verify thì tiến hành verify và cung cấp access và refresh để xài dịch vụ
    const result = await userServices.verifyEmail(user_id)
    //nếu thành công thì thông báo
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
      result
    })
  }
}

export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  //_lấy user_id và kiểm tra thử xem account có tồn tại không
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await userServices.findUserById(user_id)
  //_Nếu mà bị unverify thì mới cần resend email. Chứ banned hay verify rồi thì resend nữa làm gì
  if (user.verify == UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    //_Nếu mà chưa verify thì mình sẽ tiến hành gửi lại mã
    await userServices.resendEmailVerify(user_id)
    //_Sau đó thì thông báo gửi thành công là xong
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_TOKEN_SUCCESS
    })
  }
}
