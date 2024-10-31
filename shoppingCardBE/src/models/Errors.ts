//_file này sẽ là file định nghĩa cho tất cả các loại lỗi
//Đối với ErrorWithStatus các lỗi bình thường. Mình sẽ độ lại cho nó ngắn gọn như vậy

import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

/*
{
    message: string
    status: number
}
*/
export class ErrorWithStatus {
  message: string
  status: number
  //_mình nhận vào một cái object lỗi theo ý mình sau đó mình phân rã + định nghĩa chỉ lấy 2 cái cần và đúc ra cái lỗi tinh gọn
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

//_Dùng để định nghĩa cái object errors chứa cái gì ở trong của lỗi Enitity đặc biệt
type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any //này nghĩa ra ngoài ra muốn thêm vào gì thì thêm
  }
>

//_Thằng này sẽ kế thừa thằng cha và đối với thằng cha sẽ có 2 thuộc tính là message và status
//thì thằng này cũng vậy. Và vì nó là lỗi của bộ checkSchema nên mình biết luôn là sẽ truyền default gì
//còn thằng errors sẽ chứa một object đc định nghĩa bằng record ở trên
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  //truyển message mặt định
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY }) //tạo lỗi có status 422
    this.errors = errors
  }
}
