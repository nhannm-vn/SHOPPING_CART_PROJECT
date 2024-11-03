//_file này sẽ chứa hàm xử lí lỗi của toàn bộ server
//khi có lỗi thì tất cả lỗi đều sẽ tụ hợp về đây
//lỗi của validate trả về sẽ có các dạng sau
//      EntityError {status, message, errors}
//      ErrorWithStatus {status, message}

//==> nhưng sau này mình có báo mã lỗi sẵn rồi nên lược bỏ luôn status luôn cũng được

//lỗi của controller trả về những dạng
//      ErrorWithStatus(vd: isDup của email)
//      error bthg: rớt mạng {message, stack, name}
//==> lỗi từ mọi nơi đổ về đây chưa chắc có status

import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

//tất cả lỗi sẽ đổ về đây và sẽ bắn ra ngoài thông qua res chứ không còn chỗ nào
//cứ có lỗi thì bắn ra
export const defaultErrorHanlder = (error: any, req: Request, res: Response, next: NextFunction) => {
  //_Nếu là lỗi tạo từ ErrorWithStatus
  //==> đừng lo vì lỗi Entity của middlware cũng được đúc từ cái class kế thừa ErrorWithtStatus nên cx sẽ đc vào if này
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    //_Đối với các lỗi bthg nghĩa là new Error, nghĩa là k có status thì quy về đây
    //_Mở tất cả các thuộc tính để cho nếu có lỗi thì có thể báo và thấy được
    //vì thường thì các lỗi bthg sẽ bị tắt enumerable
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    })

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      //tất cả các thông tin còn lại, ngoại trừ nhạy cảm stack
      errorInfor: omit(error, ['stack'])
    })
  }
}
//error mình sẽ để any vì mình đâu biết nó lỗi nguồn nào đâu

//__Để xóa status thì mình sẽ tải lodash vì trong đó có hàm omit giúp mình loại bỏ thuộc tính trong một object
//trước khi mà mình trả ra cho user
