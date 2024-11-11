//_Folder requests dùng để lưu các định nghĩa của request
//_file users.request dùng để định nghĩa request của riêng collection users

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParsedQs } from 'qs'
import { ParamsDictionary } from 'express-serve-static-core'
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

export interface LogoutReqBody {
  refresh_token: string
}

export interface VerifyEmailToken extends ParsedQs {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: Date
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

//_luyen tap truoc
export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
