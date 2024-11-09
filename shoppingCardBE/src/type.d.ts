// _Nếu mà sửa trong type.d thì mình sẽ có thể định nghĩa đè lên tất cả

import { TokenPayload } from './models/requests/users.request'

//và nạp vào toàn hệ thống
declare module 'express' {
  interface Request {
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
  }
}
