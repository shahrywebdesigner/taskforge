
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import cloudinary from '../config/cloudinary.js'
import AppError from '../utils/AppError.js'

interface UploadAttachmentInput {
  buffer: Buffer
  originalName: string
  mimeType: string
}

interface CloudinaryUploadResult {
  public_id: string
  resource_type: 'image' | 'raw'
  format?: string
  bytes: number
  secure_url: string
}

const uploadToCloudinary = (
  file: UploadAttachmentInput
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const isImage = file.mimeType.startsWith('image/')
    const resourceType = isImage ? 'image' : 'raw'

    const extension = file.originalName.split('.').pop()?.toLowerCase()
    const publicId = `${randomUUID()}${extension ? `.${extension}` : ''}`

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'taskforge/attachments',
        public_id: publicId,
        resource_type: resourceType,
        type: 'authenticated',
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }

        resolve(result as CloudinaryUploadResult)
      }
    )

    Readable.from(file.buffer).pipe(stream)
  })
}

export const uploadAttachmentFile = async (
  file: UploadAttachmentInput
): Promise<CloudinaryUploadResult> => {
  try {
    return await uploadToCloudinary(file)
  } catch {
    throw new AppError('File upload failed. Please try again.', 500)
  }
}

export const deleteAttachmentFile = async (
  publicId: string,
  resourceType: 'image' | 'raw'
): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: 'authenticated',
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error('Cloudinary asset deletion failed')
    }
  } catch {
    throw new AppError('Unable to delete the stored file.', 500)
  }
}
