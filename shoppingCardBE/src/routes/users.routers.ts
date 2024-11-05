//_Một dự án có rất nhiều route. Ta tạo router users

//_import đến express để tạo route
import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
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
userRouter.post('/logout', accessTokenValidator)

//_Công khai userRouter
//  vì trùng tên file nên công khai theo default luôn
export default userRouter

//*NOTE: nếu mình chỉ viết checkSchema thì nó vẫn sẽ lọc lỗi. Tuy nhiên có lỗi k valid gì
//thì nó sẽ không báo vì nó đang được lưu trong cuốn sổ lỗi. Mặc khác nó là RunnableValidationChain
//nên cần phải run(req) để thành ValidationChain và lỗi sẽ được lưu vào req đồng thời sẽ được khui bằng hàm
//validationResult()

//mặc khác nó sẽ không hợp lí vì nếu một middleware nằm sau controller thì cần phải theo đúng cấu trúc và cần có
//next() để qua các tầng lớp tiếp theo

//====> mình cần viết một hàm nhận vào checkSchema() chạy xong lấy lỗi và trả ra middleware. Vì vậy mình sẽ build
//và xây dựng nó bên utils để khi cần có thể lấy ngay tiện ích và sử dụng
