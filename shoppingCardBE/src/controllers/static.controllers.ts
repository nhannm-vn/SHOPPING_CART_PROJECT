import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  //_Lấy filename từ req được soạn sẵn và mình gửi lên dưới dạng param
  const { filename } = req.params
  //_Thì nhiệm vụ là tìm đúng bức hình và đưa cho ngta
  //***Vì thằng resolve này nó nhận vào resparameter nên mình có thể truyền vào và có ,
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename), (error) => {
    if (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'File not found'
      })
    }
  })
}
