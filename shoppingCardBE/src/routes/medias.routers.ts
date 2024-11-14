import express from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'

//_Tạo route riêng
const mediaRouter = express.Router()

//_Tạo route chuyên upload hình ảnh
mediaRouter.post('/upload-image', uploadSingleImageController)

//_export
export default mediaRouter
