
import mongoose, { Schema, Document } from 'mongoose'

export interface IAttachment extends Document {
  kind: 'file' | 'link'
  scope: 'project' | 'task'

  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId
  task?: mongoose.Types.ObjectId

  uploadedBy: mongoose.Types.ObjectId

  // File information
  originalName?: string
  mimeType?: string
  size?: number
  publicId?: string
  resourceType?: 'image' | 'raw'
  format?: string

  // Link information
  title?: string
  url?: string

  createdAt: Date
  updatedAt: Date
}

const attachmentSchema = new Schema<IAttachment>(
  {
    kind: {
      type: String,
      enum: ['file', 'link'],
      required: true,
    },

    scope: {
      type: String,
      enum: ['project', 'task'],
      required: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalName: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      trim: true,
    },

    size: {
      type: Number,
      min: 0,
    },

    publicId: {
      type: String,
      trim: true,
    },

    resourceType: {
      type: String,
      enum: ['image', 'raw'],
    },

    format: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    url: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
  },
  { timestamps: true }
)

attachmentSchema.index({ project: 1, createdAt: -1 })
attachmentSchema.index({ task: 1, createdAt: -1 })
attachmentSchema.index({ uploadedBy: 1 })

const Attachment = mongoose.model<IAttachment>(
  'Attachment',
  attachmentSchema
)

export default Attachment
