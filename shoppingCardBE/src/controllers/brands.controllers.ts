import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANDS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateBrandReqBody } from '~/models/requests/brands.request'
import { TokenPayload } from '~/models/requests/users.request'
import brandsServices from '~/services/brands.services'

export const createBrandController = async (
  req: Request<ParamsDictionary, any, CreateBrandReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //_Lưu ý: người dùng là admin thì mới đc dùng tính năng này
  //_Mình sẽ k check ở tầng này mà sẽ vào services để kiểm tra

  //_Mình sẽ lấy user_id được lưu trong decode lúc verify ở middleware
  const { user_id } = req.decode_authorization as TokenPayload

  //_Lấy user_id để tìm trong database xem phải admin không
  const isAdmin = await brandsServices.isAdmin(user_id)
  if (!isAdmin) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: USERS_MESSAGES.USER_IS_NOT_ADMIN
    })
  }

  //_Nếu vượt qua nghĩa là có thì sẽ tiến hành tạo brand
  const brand = await brandsServices.createBrand(req.body)

  //_thong bao
  res.status(HTTP_STATUS.CREATED).json({
    message: BRANDS_MESSAGES.CREATE_BRAND_SUCCESS,
    result: brand
  })
}
