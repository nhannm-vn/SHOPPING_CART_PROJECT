//_Viết hàm tên validate nhận checkSchema
//và trả ra middleware xử lí lỗi

import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

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
      return next()
    } else {
      //Nếu trường hợp có lỗi thì bắn ra ngoài và dừng luôn, k đi tiếp nữa
      // res.status(422).json({
      //   message: 'Register Validation Failed!',
      //   errors: errors.mapped()
      // })

      //**Nếu mà lỗi không valid thì bây giờ mình sẽ tạo cái lỗi mới theo mình và đưa qua cho error handler

      //*Ban đầu mình giả sử như entityError có errors là thuộc tính chứa object rỗng. Sau đó trong
      //quá trình mình duyệt cục lỗi siêu bự thì nếu mà nó k phải lỗi đặc biệt thì hãy nhét nó vào
      //thuộc tính errors
      const entityError = new EntityError({ errors: {} })

      const errorObject = errors.mapped() //hàm này giúp ta lấy lỗi ra dưới dạng object
      //Bắn ra thử để coi lỗi nó báo ra sao thì tính tiếp
      // return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors: errorObject })

      //_Vì mình biết được đối vs các lỗi đặc biệt như là confirm_password not same password thì nó sẽ có
      //msg chứa nguyên object thay vì chỉ chứa một câu chửi như bthg. Mà cái object đó lại có dạng ErrorWithStatus nên ta sẽ duyệt for-in của object lỗi bự rồi
      //mình sẽ tìm coi cái lỗi đặc biệt là thằng nào. Nếu như tìm thấy thì mình next ra để xử lí báo cho người dùng theo kiểu riêng
      for (const key in errorObject) {
        const { msg } = errorObject[key]
        if (msg instanceof ErrorWithStatus && msg.status != HTTP_STATUS.UNPROCESSABLE_ENTITY) {
          return next(msg)
        }
        //Mình sẽ truy cập theo kiểu object errors sẽ truy cập tới key và gán bằng chuỗi msg
        //thì nếu nó k đặc biệt thì msg sẽ mặc định chứa string và object trỏ tới thuộc tính nào mà chưa có thì thêm mới luôn
        entityError.errors[key] = msg
      }
      //next ra cái object lỗi entity
      next(entityError)
    }
  }
}
