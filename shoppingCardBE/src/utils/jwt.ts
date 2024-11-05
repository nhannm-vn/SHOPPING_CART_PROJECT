//_Đây sẽ là module chứa 1 cái hàm
//hàm sẽ giúp mình ký ra token bằng jwt

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayload } from '~/models/requests/users.request'
dotenv.config()

//*Viết thường vì nó là đại diện chứ không phải là các built-in interface để định nghĩa

export const signToken = ({
  payload,
  //Để giá trị mặc định cho nó nếu như không truyền gì vào
  //lấy mã này xài luôn đi, khỏi đổi

  //*Lưu ý: khi đã có giá trị options thì phải cho nó hiểu giá trị mặc định là gì nếu k thì sẽ bug
  privateKey,
  //nếu không truyền gì thì lấy thông tin này giúp
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  //*Vì mình muốn nó là promise và cụ thể muốn nó bất đồng bộ để một hồi
  //có thể cho ký access và refresh một lượt nên cần biến nó thành promise
  //*Để trở thành bát đồng bộ thì khi ký cần truyền thêm cho nó cái callback
  return new Promise<string>((resolve, reject) => {
    //mình sẽ ký dựa vào hàm sign của jwt
    jwt.sign(payload, privateKey, options, (err, token) => {
      //nếu ký xong rồi mà bị lỗi thì sẽ dùng throw và reject vì đang trong promise và thằng đó sẽ là onRejected
      if (err) throw reject(err)
      else return resolve(token as string)
      //nếu mà bthg thì sẽ trả ra token bằng resolve và return thì sẽ vào then còn throw thì sẽ về catch
    })
  })
}

//*Note: hàm jwt.sign() sẽ ký ra một chữ ký nếu mà mình chỉ truyền payload, và privateKey thì sẽ ký ra
//chữ ký mặc định xài arthims là 256
//còn muốn thay đổi cách mã hóa hoặc là time của nó thì sẽ thông qua options, còn callback ở cuối
//thì sẽ giúp nó asynchronus hay synchronus

// -----------------------------------------------------------------------------------------------

//_Viết hàm giúp kiểm tra một token có đúng với chữ ký hay không
//nếu mà đúng thì trả ra payload đang có trong token đó
//_payload là những nội dung mà mình đã đưa cho nó lúc  mà mình ký token
//nên khi mình verify thì sẽ đưa lại cho mình sử dụng

//_Truyền vào chữ ký bí mật và token cần verify
export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  //_Mình cũng sẽ trả ra promise để có thể kiểm soát khi nào muốn ký
  return new Promise<TokenPayload>((resolve, reject) => {
    //decode chính là payload mà mính sẽ nhận được
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) throw reject(err)
      else return resolve(decoded as TokenPayload)
    })
  })
}
