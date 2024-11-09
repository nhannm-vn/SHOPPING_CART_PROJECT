// import các interface build-in(tạo sẵn) của express để mô tả
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import dotenv from 'dotenv'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
dotenv.config()

//_middleware thực chất cũng chỉ là function
//  trong này liên quan đến các file lọc dữ liệu liên quan đến users
//  middleware là handler giúp kiểm tra dữ liệu có đầy đủ và đúng định dạng khi
//  người dùng truyền lên hay là không. Dữ liệu qua các middleware để lọc và khi đến controller thì phải clear

//_giờ ta sẽ phát triển chức năng login
//  khi mà người dùng gửi lên email và password sẽ kiểm tra thử xem là dữ liệu có đầy đủ hay không
//  **middleware không được kiểm tra là đúng mk hay không?
//  ==> Giải thích: vì tầng này chỉ kiểm tra đủ đầy, rồi sau đó controller mới cầm dữ liệu
//  và phân phát đúng vào vị trí của database phù hợp
//  Tầng này k đc đụng chạm vào db gì hết vì sẽ đụng vào quy tắc 3 lớp
//  middleware chỉ xử lý xem đủ dữ liệu hay không thôi

// _hàm middleware lưới lọc dữ liệu của login
// nếu là mdw thì bản chất cũng chỉ là cái hàm

//_Bây giờ mình sẽ sử dụng công nghệ express-validator để làm lưới lọc middleware chắn
//các dữ liệu không valid
//_Tuy nhiên mình sẽ sử dụng checkSchema RunnableValidationChain(New) thay cho cách viết ValidationChain(old)
export const registerValidator = validate(
  checkSchema(
    {
      //_Kiểm tra name
      name: {
        //_Không được bỏ trống
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        //_Phải là string
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        //_Bỏ những khoảng thừa
        trim: true,
        //_Giới hạn độ dài
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          //_Nếu không theo yêu cầu thì chửi
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      //_Kiểm tra email
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
        },
        trim: true,
        //_ràng buộc kt email để nó tự chửi sẽ hay hơn
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        }
      },
      //_Kiểm tra password:
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        //_Do dai rang buoc
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          //_Neu khong theo thi chui
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        //_Kiem tra strong password, nó còn có thể cho biết và đánh giá password như thế nào là mạnh
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1,
            minLength: 8
            // returnScore
          },
          //_Neu khong dat thi chui
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      //_xac nhan lai password
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        //_Do dai rang buoc
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          //_Neu khong theo thi chui
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        //_Kiem tra strong confirm_password, nó còn có thể cho biết và đánh giá confirm_password như thế nào là mạnh
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1,
            minLength: 8
            // returnScore
          },
          //_Neu khong dat thi chui
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        //_Đối với confirm_password thì mình cần kiểm tra thêm có giống password hay chưa
        //nhưng mình không có hàm đó thì mình phải tự viết bằng cách sử dụng custom
        //_Sử dụng express-validator sẽ giúp mình giảm thiểu việc phải sử dụng if-else. Tuy nhiên đối với những hàm
        //quá cá nhân thì cũng phải sử dụng if-else
        custom: {
          //_Đây sẽ là hàm kiểm tra xem password và confirm_password có giống nhau hay là không
          //value: confirm_password và password nằm trong body và nằm trong req, nhưng mình truyền {req} để khi . nó sẽ  hiểu là object và dễ dàng dùng
          options: (value, { req }) => {
            //***Kiểm tra nếu mà chúng không giống nhau thì sẽ sẽ tạo ra lỗi và sẽ ném ra
            //sau đó lỗi sẽ đc lưu trong cuốn nhật kí của checkSchema
            if (value !== req.body.password) {
              // throw new ErrorWithStatus({
              //   status: HTTP_STATUS.UNAUTHORIZED, //401
              //   message: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
              // })
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            } else {
              return true
              //nếu mà giống nhau thì sẽ trả ra true, nghĩa là k báo lỗi gì hết
            }
          }
        }
      },
      date_of_birth: {
        //_Đối với ngày thì phải kiểm tra xem chuẩn string dạng ISO8601 hay không
        //**Không cần check có bỏ trống hay không. Vì nếu bỏ trống thì schema mình sẽ tự động
        //lấy ngày hiện tại luôn
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
        }
      }
    },
    //việc này giúp cho checkChema biết mà kiểm tra cụ thể vùng nào của req
    ['body']
  )
)

//_Chức năng login
export const loginValidator = validate(
  checkSchema(
    {
      //_Kiểm tra email
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
        },
        trim: true,
        //_ràng buộc kt email để nó tự chửi sẽ hay hơn
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        }
      },
      //_Kiểm tra password:
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        //_Do dai rang buoc
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          //_Neu khong theo thi chui
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        //_Kiem tra strong password, nó còn có thể cho biết và đánh giá password như thế nào là mạnh
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1,
            minLength: 8
            // returnScore
          },
          //_Neu khong dat thi chui
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

//_Mình sẽ tách kiểm tra validation của access và refresh khi gửi riêng ra lên. Vì nếu access không ổn thì ngừng lại luôn

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        //_Đầu tiên là sẽ kiểm tra xem có gửi lên hay không
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        //_Nếu có gửi lên rồi thì mình sẽ kiểm tra xem thử access_token có chữ ký đúng của mình không. Nếu có thì đưa lại nội dung payload và đồng thời lưu nó vào req để tiện sử dụng
        custom: {
          options: async (value, { req }) => {
            //_Đầu tiên phải cắt riêng cái token ra vì nó sẽ có dạng 'Bearer <access_token>'
            //băm xong lấy phần tử thứ 1 là access_token luôn
            const access_token = value.split(' ')[1]
            //_LƯU Ý: sẽ có trường hợp nó gửi lên chỉ co Bearer và như vậy cắt và lấy sẽ đc null đồng thời khi . sẽ bị crash cả hệ thống
            //nên mình cần kiểm tra xem cắt có được token không. Nếu không có đấm luôn
            if (!access_token) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
              })
            }

            //_Sau đó mình sẽ verify và kiểm tra thử xem bên trong access_token có đúng chữ ký của mình cung cấp không
            //_Tuy nhiên trong quá trình verify vẫn có khả năng bug. Do verify không ra. Và lúc đó thì sẽ
            //quăng ra lỗi 422 do mình đã có kiến trúc validate sẵn rồi. Nhưng mà mình k muốn 422 thì sẽ chụp lại và biến thành 401 sau đó quang ra tiếp
            //và bug này thường do nó hack nên mình sẽ độ lại để chửi
            //==> nghĩa là khi có lỗi thì mình sẽ k để nó đưa vào entityError mà mình sẽ trực tiếp quăng lỗi ra theo ý mình
            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              //_Tuy nhiên sau khi kiểm tra thì decode của access_token sẽ bị mất vì khi chạy hàm xong thì nó sẽ bị mất
              //==> nên sau khi mã hóa thì mình nên cất vào request để phía sau có thể lấy ra mà sử dụng tiếp được
              //_Dùng hoisting
              //LƯU Ý: mình cần ; vì nếu k thì nó sẽ nghĩa currying và có khả năng bug
              ;(req as Request).decode_authorization = decode_authorization
            } catch (error) {
              //_nếu thất bại thì có thể đã bị tấn công và mình sẽ chửi theo dạng lỗi có sẵn luôn
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, //401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }

            //nếu mà ok valid hết thì:
            return true
          }
        }
      }
    },
    ['headers']
  )
  //khi gửi duex liệu lên nó sẽ nằm ở vùng header
)

//*Vì sao mình cần phải kiểm tra tận 2 mã mà k kiểm tra 1 refreshToken thôi
//==> vì có khả năng nó lấy đc 1 mã còn 1 mã chưa lấy đc nên làm v thì bm cao hơn

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            //value lúc này là refresh_token luôn
            //_Nhưng lưu ý trong quá trinhg verify thì sẽ có lỗi. Mà thường lỗi là do hack nên mình đá con error lun
            try {
              const decode_refresh_token = await verifyToken({
                token: value,
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              //_Nếu verify thành công thì lưu payload trả về vào req để tiện sử dụng
              //còn không thì chửi nó
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, //401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        trim: true,
        //_viết hàm kiểm tra xem email verify token có phải do mình ký không
        custom: {
          options: async (value: string, { req }) => {
            //value: email_verify_token
            //_Trong quá trình kiểm tra có khả năng verify thất bại do token hết hạn hoặc không đúng mà mình muốn coi nó như là trhop đacbiet
            try {
              const decode_email_verify_token = await verifyToken({
                token: value,
                privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              //nếu đúng là do mình ký hợp hệ thì sẽ thu được payload sau đó mình sẽ lưu vào req để tiện sử dụng
              ;(req as Request).decode_email_verify_token = decode_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                //chửi theo câu chửi của hệ thống luôn cho hay
                message: (error as JsonWebTokenError).message
              })
            }
            //_nếu mà ok hết thì return true để cho qua
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        //_không được để trống
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      }
    },
    ['body']
  )
)
