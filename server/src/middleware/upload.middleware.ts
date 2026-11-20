
import multer from 'multer'
import path from 'node:path'

const allowedTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx':
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
}

const storage = multer.memoryStorage()

const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  callback
) => {
  const extension = path.extname(file.originalname).toLowerCase()
  const expectedMimeType = allowedTypes[extension]

  if (!expectedMimeType || expectedMimeType !== file.mimetype) {
    callback(new Error('Unsupported file type'))
    return
  }

  callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
})

export default upload
