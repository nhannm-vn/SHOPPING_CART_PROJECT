import { ParamsDictionary } from 'express-serve-static-core'

//_file lưu định nghĩa về request của brands
export interface CreateBrandReqBody {
  name: string
  hotline: string
  address: string
}

//_Đưa id lên cho mình thông qua đường param nên phải extend
export interface GetBrandReqParams extends ParamsDictionary {
  id: string
}
