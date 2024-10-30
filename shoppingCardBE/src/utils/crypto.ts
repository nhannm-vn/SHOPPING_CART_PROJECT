//_Mình sẽ mã hóa password trước khi lưu lên database
//module này sẽ nằm trong utils chứa các hàm tiện ích
//mà cụ thể là nó sẽ chứa hàm giúp mình  mã hóa

import { createHash } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

//_Hàm nhạn vào content và sẽ max hóa theo hệ 16
const sha256 = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}

export const hashPassword = (password: string) => {
  return sha256(password + process.env.PASSWORD_SECRET)
}
