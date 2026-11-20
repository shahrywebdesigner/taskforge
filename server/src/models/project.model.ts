import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description?: string
  workspace: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  managers: mongoose.Types.ObjectId[]
  leads: mongoose.Types.ObjectId[]
  status: 'planning' | 'active' | 'completed'
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    leads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
  },
  { timestamps: true }
)

const Project = mongoose.model<IProject>(
  'Project',
  projectSchema
)

export default Project