
import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  task: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
  },
  { timestamps: true }
)

commentSchema.index({ task: 1, createdAt: -1 })
commentSchema.index({ author: 1, createdAt: -1 })

const Comment = mongoose.model<IComment>('Comment', commentSchema)

export default Comment
