import express from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'

//_Tạo route riêng
const mediaRouter = express.Router()

//_Tạo route chuyên upload hình ảnh
mediaRouter.post('/upload-image', wrapAsync(uploadSingleImageController))

//_export
export default mediaRouter
