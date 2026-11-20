
import mongoose, { Schema, Document, Types } from 'mongoose'

export type NotificationType =
  | 'workspace_invitation'
  | 'project_created'
  | 'project_updated'
  | 'task_assigned'
  | 'task_updated'
  | 'task_completed'
  | 'comment_added'
  | 'workspace_updated'

export interface INotification extends Document {
  recipient: Types.ObjectId
  actor?: Types.ObjectId
  workspace?: Types.ObjectId
  project?: Types.ObjectId
  task?: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'workspace_invitation',
        'project_created',
        'project_updated',
        'task_assigned',
        'task_updated',
        'task_completed',
        'comment_added',
        'workspace_updated',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
)

export default Notification
