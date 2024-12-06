import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANDS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateBrandReqBody, GetBrandReqParams } from '~/models/requests/brands.request'
import { TokenPayload } from '~/models/requests/users.request'
import brandsServices from '~/services/brands.services'
import userServices from '~/services/users.services'

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
  const isAdmin = await userServices.isAdmin(user_id)
  //
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

export const getBrandByIdController = async (
  req: Request<GetBrandReqParams, any, any>, //
  res: Response,
  next: NextFunction
) => {
  //_Lấy id
  const { id } = req.params
  const brand = await brandsServices.getBrandById(id)

  if (!brand) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: BRANDS_MESSAGES.BRAND_NOT_FOUND
    })
  }

  res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.GET_BRANDS_SUCCESS,
    result: brand
  })
}

export const getAllBrandsController = async (
  req: Request, //
  res: Response,
  next: NextFunction
) => {
  const brands = await brandsServices.getAllBrands()
  res.status(HTTP_STATUS.OK).json({
    message: BRANDS_MESSAGES.GET_BRANDS_SUCCESS,
    result: brands
  })
}
