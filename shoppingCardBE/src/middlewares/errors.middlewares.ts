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

//tất cả lỗi sẽ đổ về đây và sẽ bắn ra ngoài thông qua res chứ không còn chỗ nào
//cứ có lỗi thì bắn ra
export const defaultErrorHanlder = (error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    message: error.message
  })
}
//error mình sẽ để any vì mình đâu biết nó lỗi nguồn nào đâu

//_Để xóa status thì mình sẽ tải lodash vì trong đó có hàm omit giúp mình loại bỏ thuộc tính trong một object
//trước khi mà mình trả ra cho user
