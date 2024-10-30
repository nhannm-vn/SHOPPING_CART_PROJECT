//_Viết hàm tên validate nhận checkSchema
//và trả ra middleware xử lí lỗi

import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { Request, Response, NextFunction } from 'express'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  //_Trả ra một middleware, middleware sẽ xem thử có lỗi không. Có thì sẽ ném ra
  //thông qua res. Còn không thì qua controller bằng lệnh next()
  return async (req: Request, res: Response, next: NextFunction) => {
    //_Cho checkSchema run
    await validation.run(req) //run thì mới chép lỗi vào request được
    //_Sau khi chạy thì
    const errors = validationResult(req) //khui lỗi trong req và lưu vào errors
    if (errors.isEmpty()) {
      //nếu trong mảng không có lỗi thì cho đi tiếp xuống controller
      next()
    } else {
      //Nếu trường hợp có lỗi thì bắn ra ngoài và dừng luôn, k đi tiếp nữa
      res.status(422).json({
        message: 'Register Validation Failed!',
        errors: errors.mapped()
      })
    }
  }
}
