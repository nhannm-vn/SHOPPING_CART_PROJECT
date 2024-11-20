//import
import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasServices from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  //_Lấy ra các link ảnh
  const urlImage = await mediasServices.handleUploadImage(req)

  //_Thông báo và trả ra
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_FILE_SUCCESS,
    urlImage
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  //_Lay ra link video
  const urlVideo = await mediasServices.handleUploadVideo(req)

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_FILE_SUCCESS,
    urlVideo
  })
}

/*
    __formidable là một thư viện Node.js phổ biến dùng để xử lý 
    các form HTML và tải lên tệp (file upload) từ các biểu mẫu.
    Nó đặc biệt hữu ích trong các ứng dụng web nơi người dùng 
    cần gửi dữ liệu từ biểu mẫu, đặc biệt là khi biểu mẫu đó 
    bao gồm việc tải lên tệp lớn như hình ảnh, video, hoặc tài
    liệu.

    __dirname: nó cung cấp đường dẫn tới thư mục chứa file

    path: nó sẽ cung cấp đường dẫn bắt đầu từ thư mục chứa dự án và đi tới nơi resolve(...)
        path.resolve('uploads'): path giúp cung cấp đường dẫn ngoài cùng và từ đó sẽ nhờ resolve mà đi vào upload

*/
