//_Một dự án có rất nhiều route. Ta tạo router users

//_import đến express để tạo route
import express from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyEmailTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

//_tạo user router
const userRouter = express.Router()

/*
    Description: Register a new user
    path: /register
    method: POST
    body: {
        name: string
        email: string
        password: string
        confirm_password: string
        date_of_birth: string nhung se la chuan ISO8601
    }
    Lưu ý: mình sẽ sử dụng checkSchema để kiểm tra dữ liệu thay thế cho 
    validationChain của công nghệ express-validator(bộ lọc lỗi của express)
    vì nếu mình xài validationChain nó sẽ bị cấu trúc liên hoàn và không trực quan
*/
userRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
 Description: Login
    path: users/login
    method: post
    body: {
        email: string
        password: string
    }
    
    sử dụng checkSchema để kiểm tra dữ liệu thay thế cho
    validationChain chấm liền hoàng như hồi nãy
*/
userRouter.post('/login', loginValidator, wrapAsync(loginController))

/*
    Desription: Logout
    path: users/logout
    method: post
    headers:{
        Authorization: 'Bearer <access_token>'
    }
    body:{
        refresh_token: string
    }
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*Dsc: khi người dùng đăng ký(register) thì mình tạo một cái link có kèm token xác thực và gửi vào mail cho họ
khi họ bấm vào thì mình nó sẽ đưa cái token lên cho mình thông qua query. Mình sẽ cầm cái đó và xác thực xem chuẩn không. nếu chuẩn thì verify cho người dùng 
    path: users/verify-email/?email_verify_token=string
          họ sẽ gửi email_verify_token lên cho mình thông qua query
    method: get: vì người dùng chỉ bấm vào thôi còn gửi gì lên thì mình đã soạn sẵn rồi
*/
userRouter.get('/verify-email/', verifyEmailTokenValidator, wrapAsync(verifyEmailTokenController))

/*Dsc: trường hợp khi người dùng đã vào được ứng dụng rồi nhưng chưa verify và muốn verify để có thể sử dụng nhiều tính năng hơn
path: users/resend-verify-email
method: post
headers: {
    Authorization: 'Bearer <access-token>'
}
**[chức năng này cần đăng nhập rồi sử dụng] vì khi đó mới có access để gửi lên hệ thống
*/
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*Description: khi người dùng đứng trên giao diện và bấm vào giao diện quên mật khẩu. Thì sẽ yêu cầu họ gửi email để thực hiện chức năng
    path: users/forgot-password
    method: post
*/
userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*Desc: kiểm tra xem forgot_password_token còn ok, còn sử dụng được hay không
    path: users/verify-forgot-password
    method: post
    body:{
        forgot_password_token: string
    }
*/

export default userRouter

//*NOTE: nếu mình chỉ viết checkSchema thì nó vẫn sẽ lọc lỗi. Tuy nhiên có lỗi k valid gì
//thì nó sẽ không báo vì nó đang được lưu trong cuốn sổ lỗi. Mặc khác nó là RunnableValidationChain
//nên cần phải run(req) để thành ValidationChain và lỗi sẽ được lưu vào req đồng thời sẽ được khui bằng hàm
//validationResult()

//mặc khác nó sẽ không hợp lí vì nếu một middleware nằm sau controller thì cần phải theo đúng cấu trúc và cần có
//next() để qua các tầng lớp tiếp theo

//====> mình cần viết một hàm nhận vào checkSchema() chạy xong lấy lỗi và trả ra middleware. Vì vậy mình sẽ build
//và xây dựng nó bên utils để khi cần có thể lấy ngay tiện ích và sử dụng
