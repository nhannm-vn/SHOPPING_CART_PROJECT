//_Viết hàm kiểm tra thư mục dự án
//có folder uploads không. Nếu chưa có thì tạo

import fs from 'fs' //fs giúp mình chơi với các thư mục
import path from 'path'
import { Request } from 'express'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import formidable from 'formidable'

export const initFolder = () => {
  //_Lúc bắt đầu chạy dự án thì hãy tạo dùm cho thư mục để lưu upload đi
  //thư mục nào chưa có thì tạo hết
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      //_Nếu không tìm thấy thì mình sẽ tạo
      fs.mkdirSync(dir, {
        //_Nghĩa là đôi khi mình muốn thư mục này lồng vào thằng khác
        recursive: true
      })
    }
  })
}

//_Tạo hàm handleUploadSingleImage: hàm xử lý uploadSingleImage
//hàm này nhận vào req và ép req đi qua lưới lọc formidable
//sau đó chỉ lấy file image và return ra ngoài
export const handleUploadImage = (req: Request) => {
  //_chuẩn bị lưới lọc formidable
  const form = formidable({
    //_Đường dẫn lưu các file
  })
}
