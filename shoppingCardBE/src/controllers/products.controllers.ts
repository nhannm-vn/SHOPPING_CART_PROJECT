import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateProductReqBody } from '~/models/requests/products.request'
import { TokenPayload } from '~/models/requests/users.request'
import productsServices from '~/services/products.services'
import userServices from '~/services/users.services'

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //_Lấy hết những gì mà người dùng truyền lên
  const productInfor = req.body
  //_Kiểm tra xem user có phải là admin hay không
  const { user_id } = req.decode_authorization as TokenPayload
  const isAdmin = await userServices.isAdmin(user_id)
  if (!isAdmin) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: USERS_MESSAGES.USER_IS_NOT_ADMIN
    })
  } else {
    //_Nếu là admin thì tiến hành tạo sản phẩm
    const product = await productsServices.createProduct(productInfor)
    res.status(HTTP_STATUS.CREATED).json({
      message: PRODUCT_MESSAGES.CREATE_PRODUCT_SUCCESS,
      result: product
    })
  }
}
