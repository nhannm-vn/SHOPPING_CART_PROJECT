//_Folder requests dùng để lưu các định nghĩa của request
//_file users.request dùng để định nghĩa request của riêng collection users

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

//_Định nghĩa: khi đăng kí register thì bên trong body của request sẽ chứa gì

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
