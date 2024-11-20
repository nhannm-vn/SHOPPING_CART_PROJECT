import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { getNameFromFullnameFile, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
//_Đây chỉ đơn giảng là file lưu các dịch vụ của media thôi. Chứ k có đụng chạm gì tới lưu trữ
class MediasServices {
  async handleUploadImage(req: Request) {
    //_Đầu tiên là ép các file ảnh up lên tải qua lưới lọc
    //nếu thành công thì mình sẽ có được cái files
    const files = await handleUploadImage(req)
    //_Vì mình biến tụi nó thành tới 4 cái link và trả ra cho người dùng
    //nên mình duyệt forEach. Tuy nhiên cần nén ảnh trước khi biến thành link vả lưu
    //nên mình cần duyệt theo kiểu mảng mạnh ai chạy k thôi nó sẽ khó load
    const result = await Promise.all(
      files.map(async (file) => {
        //_Trước khi lưu cần độ lại tên file
        const newFilename = getNameFromFullnameFile(file.newFilename) + '.jpg'
        //_Tạo nơi sẽ lưu file sau khi mình nén
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename

        //_Sau khi tải lên thì gọi sharp để xư lí ảnh
        const infor = await sharp(file.filepath).jpeg().toFile(newPath)

        //_Xóa các tấm hình trong thư mực tạm
        fs.unlinkSync(file.filepath)
        //filepath: lưu đường dẫn lưu trong thư mực tạm sau khi lọc

        //_setup một link ảnh và gửi cho người ta
        const urlImage: Media = {
          url: `http://localhost:3000/static/image/${newFilename}`, //
          type: MediaType.Image
        }
        return urlImage
      })
    )
    return result //quăng ra các cái link ảnh
  }
  //
  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result = await Promise.all(
      files.map(async (file) => {
        //setup một link ảnh cho ngta gửi cho bạn bè coi
        const urlVideo: Media = {
          url: `http://localhost:3000/static/video/${file.newFilename}`, //
          type: MediaType.Video
        }
        return urlVideo
      })
    )
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
