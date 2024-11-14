//import
import { Request, Response, NextFunction } from 'express'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  //_Mình sẽ viết tấm lưới lọc khi người
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
