//_Một dự án có rất nhiều route. Ta tạo router users

//_import đến express để tạo route
import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

//_tạo user router
const userRouter = express.Router()

//_Nếu mình để userRouter.use() và bỏ các middleware vào thì nó sẽ bị toàn cục, nghĩa là
//  cứ chạy qua route /users thi đều phải qua middleware đó. Nhưng mà mình chỉ muốn nó cục bộ và chạt riêng qua
//  từng thằng mà thôi

//_Mình sẽ làm chức năng login cho userRouter
//  loginValidator nó nằm ở giữa và phải đáp ứng được là dữ liệu đi qua nó đc kiểm tra kĩ càng
//  xong mới đi tới loginController. Viết như vậy thì middleware sẽ dành riêng cho từng thằng chứ k toàn cục cho tất cả
//_Và vì mình login nên cần gửi dữ liệu lên là api post
userRouter.post('/login', loginValidator, loginController)

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
userRouter.post('/register', registerValidator, registerController)

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
