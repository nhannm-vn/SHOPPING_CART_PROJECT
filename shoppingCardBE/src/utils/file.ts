//_Viết hàm kiểm tra thư mục dự án
//có folder uploads không. Nếu chưa có thì tạo

import fs from 'fs' //fs giúp mình chơi với các thư mục
import path from 'path'
import { Request } from 'express'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import formidable from 'formidable'
import { File } from 'formidable'

export const initFolder = () => {
  //_Lúc bắt đầu chạy dự án thì hãy tạo dùm cho thư mục để lưu upload đi
  //thư mục nào chưa có thì tạo hết
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      //_Nếu không tìm thấy thì mình sẽ tạo
      fs.mkdirSync(dir, {
        //_Nghĩa là đôi khi mình muốn thư mục này lồng vào thằng khác
        recursive: true
      })
    }
  })
}

//_Tạo hàm handleUploadSingleImage: hàm xử lý uploadSingleImage
//hàm này nhận vào req và ép req đi qua lưới lọc formidable
//sau đó chỉ lấy file image và return ra ngoài
export const handleUploadImage = (req: Request) => {
  //_chuẩn bị lưới lọc formidable
  const form = formidable({
    //_Đường dẫn lưu các file khi đã vượt qua lưới
    //_Lưu vào file tạm rồi còn nén xong mới lưu vào file chính
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, //_Lưu tối đa là 4 file một lần tải lên
    maxFileSize: 300 * 1024, //_Mỗi file có dung lượng tối đa là 300kb
    maxTotalFileSize: 300 * 1024 * 4, //_total các file khi up lên hết thì có tổng dung lượng là
    keepExtensions: true, //_giữ lại đuôi của file
    filter: ({ name, originalFilename, mimetype }) => {
      //_Mình chirt true khi nó đúng là được gửi bằng image
      //+name: tên của field đang chứa file
      //+originalFilename: tên gốc ban đầu của các file
      //+mimetype: kiểu của file được up lên 'video/mkv', 'image/png'
      const valid = name == 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        //tao ra loi
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      //_Nếu valid nghĩa là true thì cho qua
      return valid
    }
  })

  //_Sử dụng cái màng lọc
  //LƯU Ý: những cái hàm mà nó nhận thêm callback thì nó sẽ k có xu hướng đợi và nó sẽ có thể bị bất đồng bộ
  //nên cái hàm sẽ chạy sau trước khi ném ra files và nó cực giống như verify và signToken
  //==> mình sẽ quy nó về promise. Nghĩa là ép tụi nó xử lí xong thì mình mới đi tiếp
  //==> trả ra return bên kia gọi thì được cái promise
  return new Promise<File[]>((resolve, reject) => {
    //_Lưới lọc sẽ lọc request
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      //_Nếu k có gửi ảnh lên thì chửi luôn
      if (!files.image) return reject(new Error('Image is empty'))
      //_Nếu vượt qua tất cả thì trả ra file
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = (req: Request) => {
  //_chuẩn bị lưới lọc formidable
  const form = formidable({
    //_Đường dẫn lưu các file khi đã vượt qua lưới
    //_Lưu vào file tạm rồi còn nén xong mới lưu vào file chính
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 4, //_Lưu tối đa là 4 file một lần tải lên
    maxFileSize: 50 * 1024 * 1024, //_Mỗi file có dung lượng tối đa là 50mb
    keepExtensions: true, //_giữ lại đuôi của file
    filter: ({ name, originalFilename, mimetype }) => {
      //_Mình chirt true khi nó đúng là được gửi bằng image
      //+name: tên của field đang chứa file
      //+originalFilename: tên gốc ban đầu của các file
      //+mimetype: kiểu của file được up lên 'video/mkv', 'image/png'
      const valid = name == 'video' && Boolean(mimetype?.includes('video'))
      if (!valid) {
        //tao ra loi
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      //_Nếu valid nghĩa là true thì cho qua
      return valid
    }
  })

  //_Sử dụng cái màng lọc
  //LƯU Ý: những cái hàm mà nó nhận thêm callback thì nó sẽ k có xu hướng đợi và nó sẽ có thể bị bất đồng bộ
  //nên cái hàm sẽ chạy sau trước khi ném ra files và nó cực giống như verify và signToken
  //==> mình sẽ quy nó về promise. Nghĩa là ép tụi nó xử lí xong thì mình mới đi tiếp
  //==> trả ra return bên kia gọi thì được cái promise
  return new Promise<File[]>((resolve, reject) => {
    //_Lưới lọc sẽ lọc request
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      //_Nếu k có gửi ảnh lên thì chửi luôn
      if (!files.video) return reject(new Error('Video is empty'))
      //_Nếu vượt qua tất cả thì trả ra file
      return resolve(files.video as File[])
    })
  })
}

//_Hàm chỉnh đuôi file ảnh sau khi nén xong
//getNameFromFullnameFile: hàm nhận vào full tên và trả ra asd bỏ đuôi
export const getNameFromFullnameFile = (filename: string) => {
  const nameArr = filename.split('.')
  //_Mình có nhiều lựa chọn để chơi, tuy nhiên mình nên xài pop
  nameArr.pop()
  return nameArr.join('-')
}
