//_module chuyên chứa các lưới lọc gàn buộc dữ liệu khi người dùng truyền lên
//_hàm sẽ nhận vào chuỗi key mà mình muốn giữ lại
//_filterKeys sẽ là mảng chứa các key mà mình muốn giữ lại
//và sau đó trả ra middleware và trong đó đã lọc những thứ mình muốn để lại trong req
//sau đó cho đi qua tầng xử lí tiếp theo
import { Request, Response, NextFunction } from 'express'
import { pick } from 'lodash'

export const filterMiddleware = <T>(filterKeys: Array<keyof T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //_Mình sẽ xài pick của lodash để giữ lại trái ngược với omit
    req.body = pick(req.body, filterKeys)
    //Lúc này sẽ gán lại cho body những thứ trong filterKeys
    //_Sau khi lọc xong thì cho qua tầng tiếp theo để xử lý
    next()
  }
}
