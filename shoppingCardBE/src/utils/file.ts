//_Viết hàm kiểm tra thư mục dự án
//có folder uploads không. Nếu chưa có thì tạo

import fs from 'fs' //fs giúp mình chơi với các thư mục
import path from 'path'

export const initFolder = () => {
  //_lưu đường dẫn tới thư mục của ảnh
  const uploadsFolderPath = path.resolve('uploads')
  //_nếu trường hợp không có đường dẫn đó thì tiến hành tạo mới folder
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      //nghĩa là đôi khi mình muốn thư mục này lồng thư mục khác
      recursive: true
    })
  }
}
