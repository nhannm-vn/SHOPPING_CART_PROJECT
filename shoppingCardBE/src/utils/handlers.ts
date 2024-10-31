//_đây sẽ là module dùng để chứa hàm wrapAsync
//nghĩa là mình sẽ nhận vào một hàm async k có try-catch và sẽ bổ sung
//cấu trúc try-catch-throw cho nó để cho nó mặc dù là async function nhưng vẫn throw đc bthg
//==>giúp mình có xài hàm có thể throw được mà k cần trong try-catch-next và
//  mặc khác giúp mình code ngắn gọn và có thể tập kết lỗi về 1 chỗ tốt
//  ngoài ra còn giúp các hàm nào chơi với database k lo. Vì cứ có error thì cấu trúc này sẽ bắt và thông báo hết
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
