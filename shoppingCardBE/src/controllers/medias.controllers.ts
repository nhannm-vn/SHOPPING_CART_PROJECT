//import
import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  //_Mình sẽ viết tấm lưới lọc khi người dùng up file lên thì mình sẽ cho nó qua cái lưới lọc đó để gàn buộc định dạng
  const form = formidable({
    maxFiles: 1, //nghiã là chỉ nhận 1 file mỗi lần up thôi
    maxFileSize: 1024 * 300, //nghĩa là ràng buộc dung lượng của mỗi file khi gửi lên( 1024: 1kb)
    keepExtensions: true, //nghĩa là đuôi của file mà mình sẽ giữ lại. Nên cần check xem có độc không
    //_sau cùng hết rồi thì sẽ chọn file lưu ở đâu
    //_Tuy nhiên sẽ có vấn đề là lỡ trong trường hợp cây thư mục chưa có folder uploads thì nó sẽ bị bug
    //nên mình cần viết hàm initFolder và chạy trong index để khi nào dự án mình chạy thì auto tạo cho mình
    uploadDir: path.resolve('uploads')
  })

  //_Sau khi tạo tấm lưới lọc rồi thì tiến hành xài và mình biến luôn là nó sẽ xài với req
  form.parse(req, (err, fields, files) => {
    if (err) {
      //vì mình có kiến trúc wrap bao bên ngoài nên throw thoải mai
      throw err
    } else {
      res.json({
        message: 'Upload image successfully'
      })
    }
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
