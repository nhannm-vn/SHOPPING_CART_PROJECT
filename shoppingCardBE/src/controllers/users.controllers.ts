import { Request, Response } from 'express'

import User from '~/models/schemas/User.schema'
import userServices from '~/services/users.services'

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
export const registerController = async (req: Request, res: Response) => {
  //_Dữ liệu đi tới đây thì mình biết nó nằm ở trong đâu luôn
  const { email, password } = req.body
  //nhờ chiếc xe services truy cập tới và thêm dữ liệu vào database dùm mình
  //_Đã đụng tới database thì sẽ có trường hợp rớt mạng nên cần try-catch
  try {
    //_tao moi mot user roi them vao
    //_cái phểu của user phải nhận vào một object được định nghĩa UserType một cách chuẩn chỉ
    //__Mình mà xài databaseServices luôn thì gà quá, phải tách nhỏ hơn nữa rồi mới nhờ thằng database thì mới chuẩn chỉ
    const result = await userServices.register({
      email,
      password
    })
    //_sau khi thêm thành công thì báo tín hiệu, đồng thời trả result ra cho người dùng
    //_tạo thành công là 201
    res.status(201).json({
      message: 'Register success',
      data: result
    })
  } catch (error) {
    //nếu rớt mạng thì trả ra lỗi
    res.status(422).json({
      message: 'Register failed',
      error: error
    })
  }
}
