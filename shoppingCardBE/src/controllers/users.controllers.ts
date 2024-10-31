import { Request, Response, NextFunction } from 'express'
import { RegisterReqBody } from '~/models/requests/users.request'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'

//_Nghĩa là trong table users có rất nhiều controller

//_controller là nơi xử lí logic và dữ liệu. Dữ liệu đi được tới đây thì đã clear
//  controller là handler chuyên xử lí dữ liệu vào đúng các server, xử lí trích xuất dữ liệu
//  ==> bản chất controller không đc nch với db, chỉ có server mới nói chuyện với db
//  mình chỉ là người đưa dữ liệu cho database

//**Lưu ý: controller chỉ kiểm tra if-else for đồ thôi chứ k có kiểm tra xem dữ liệu có đúng kiểu hay đủ đầy nữa k
//sau đó sẽ có cái xe trung chuyển tên services, sau đó cái xe dó mới lên databse và mang dữ liệu đưa về cho controller và controller đưa cho người dùng

//_req ở trước hay sau middleware đều là 1
export const loginController = (req: Request, res: Response) => {
  //_trong req vẫn có body
  const { email, password } = req.body
  //mình sẽ dùng đại email và password để kiểm tra đại vì mình chưa có database
  if (email === 'lehodiep.1999@gmail.com' && password === 'weArePiedTeam') {
    res.status(200).json({
      message: 'Login success',
      data: {
        fname: 'Điệp',
        yob: 1999
      }
    })
  } else {
    //khi mà email or password không đúng so với database thì sẽ
    res.status(401).json({
      message: 'Invalid email or password'
    })
  }
}

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
      status: HTTP_STATUS.UNAUTHORIZED //401
    })
  }

  const result = await userServices.register(req.body)
  //_sau khi thêm thành công thì báo tín hiệu, đồng thời trả result ra cho người dùng
  //_tạo thành công là 201
  res.status(HTTP_STATUS.CREATED).json({
    message: 'Register success',
    data: result
  })
}
