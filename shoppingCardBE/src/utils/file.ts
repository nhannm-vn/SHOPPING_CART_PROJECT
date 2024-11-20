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
    //_Đường dẫn lưu các file khi đã vượt qua lưới
    //_Lưu vào file tạm rồi còn nén xong mới lưu vào file chính
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, //_Lưu tối đa là 4 file một lần tải lên
    maxFileSize: 300 * 1024, //_Mỗi file có dung lượng tối đa là 300kb
    maxTotalFileSize: 300 * 1024 * 1024, //_total các file khi up lên hết thì có tổng dung lượng là
    keepExtensions: true, //_giữ lại đuôi của file
    filter: ({ name, originalFilename, mimetype }) => {
      //_Mình chirt true khi nó đúng là được gửi bằng image
      //+name: tên của field đang chứa file
      //+originalFilename: tên gốc ban đầu của các file
      //+mimetype: kiểu của file được up lên 'video/mkv', 'image/png'
      const valid = name == 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        //tao ra loi
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      //_Nếu valid thì trả ra true
      return valid
    }
  })
}
