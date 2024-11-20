//_static này sẽ không có s vì nó không có collection
import express from 'express'
import { serveImageController, serveVideoController } from '~/controllers/static.controllers'

//_Tạo router cho nó
const staticRouter = express.Router()

//_Muốn xem ảnh sẽ là get
// staticRouter.use('/image', express.static(UPLOAD_IMAGE_DIR))
//_Mình sẽ không xài đồ có sẵn mà sẽ tự độ chế riêng cho mình
//_Cái này sẽ được truyền thông qua param
staticRouter.get('/image/:filename', serveImageController)

staticRouter.get('/video/:filename', serveVideoController)

export default staticRouter
