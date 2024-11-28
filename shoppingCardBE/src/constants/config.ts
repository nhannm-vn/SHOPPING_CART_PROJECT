import argv from 'minimist'

//_Đây sẽ là module giúp cho mình biết được khi chạy lệnh
//thì đang đứng ở vai trò nào để xài host hay route
//-d là gửi ký tự, --d là gửi chuỗi mà nếu k có gàn gì thì là true

//option sẽ mảng những gì mà người dùng truyền lên cho mình
//dưới dạng object
const options = argv(process.argv.slice(2))

//_Kiểm tra từ khóa gửi lên trong cái mảng sau khi mà mình cắt ra được
//nếu như dev thì là đang phát triển và chạy localhost:3000
//còn nếu khác thì phải  điều chỉnh port để chạy host server

export const isProduction = Boolean(options.production)
