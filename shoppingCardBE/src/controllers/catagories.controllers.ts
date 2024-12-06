import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateCategoryReqBody } from '~/models/requests/catagories.request'
import { TokenPayload } from '~/models/requests/users.request'

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //_Kiểm tra xem là user có phải admin không
  const { user_id } = req.decode_authorization as TokenPayload
}
