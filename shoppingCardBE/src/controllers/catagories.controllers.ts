import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORY_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateCategoryReqBody } from '~/models/requests/categories.request'
import { TokenPayload } from '~/models/requests/users.request'
import catagoriesServices from '~/services/categories.services'
import userServices from '~/services/users.services'

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //_Kiểm tra xem là user có phải admin không
  const { user_id } = req.decode_authorization as TokenPayload
  const isAdmin = await userServices.isAdmin(user_id)
  if (!isAdmin) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: USERS_MESSAGES.USER_IS_NOT_ADMIN
    })
  }
  //_Vượt qua thì tạo brand mới
  const category = await catagoriesServices.createCategory(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: CATEGORY_MESSAGES.CREATE_CATEGORY_SUCCESS,
    result: category
  })
}
