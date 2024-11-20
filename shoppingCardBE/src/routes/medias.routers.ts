import express from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

//_Tạo route riêng
const mediaRouter = express.Router()

//_Tạo route chuyên upload hình ảnh
mediaRouter.post('/upload-image', wrapAsync(uploadImageController))

//_export
export default mediaRouter
