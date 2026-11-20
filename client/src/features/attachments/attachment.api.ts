
import api from '../../lib/axios'

export type AttachmentScope = 'project' | 'task'

export interface AttachmentItem {
  _id: string
  kind: 'file' | 'link'
  scope: AttachmentScope
  originalName?: string
  mimeType?: string
  size?: number
  title?: string
  url?: string
  fileUrl?: string
  uploadedBy: {
    _id: string
    name: string
    username?: string
  }
  createdAt: string
}

const getBaseUrl = (scope: AttachmentScope, targetId: string) =>
  `/${scope === 'project' ? 'projects' : 'tasks'}/${targetId}/attachments`

export const getAttachments = async (
  scope: AttachmentScope,
  targetId: string
): Promise<AttachmentItem[]> => {
  const response = await api.get(getBaseUrl(scope, targetId))
  return response.data.data
}

export const uploadAttachment = async (
  scope: AttachmentScope,
  targetId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<AttachmentItem> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(
    getBaseUrl(scope, targetId),
    formData,
    {
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(
            Math.round((event.loaded * 100) / event.total)
          )
        }
      },
    }
  )

  return response.data.data
}

export const createAttachmentLink = async (
  scope: AttachmentScope,
  targetId: string,
  title: string,
  url: string
): Promise<AttachmentItem> => {
  const response = await api.post(
    `${getBaseUrl(scope, targetId)}/links`,
    { title, url }
  )

  return response.data.data
}

export const deleteAttachment = async (
  scope: AttachmentScope,
  targetId: string,
  attachmentId: string
): Promise<void> => {
  await api.delete(
    `${getBaseUrl(scope, targetId)}/${attachmentId}`
  )
}
