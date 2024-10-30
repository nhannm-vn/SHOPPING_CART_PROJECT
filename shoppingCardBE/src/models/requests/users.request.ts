//_Folder requests dùng để lưu các định nghĩa của request
//_file users.request dùng để định nghĩa request của riêng collection users

//_Định nghĩa: khi đăng kí register thì bên trong body của request sẽ chứa gì

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
