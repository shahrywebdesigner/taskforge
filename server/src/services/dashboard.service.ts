
import mongoose from 'mongoose'

import Workspace from '../models/workspace.model.js'
import Project from '../models/project.model.js'
import Task from '../models/task.model.js'
import Notification from '../models/notification.model.js'
import AppError from '../utils/AppError.js'

export const getDashboardData = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400)
  }

  // Find all workspaces where the user is Owner, Admin, or Member.
  const workspaces = await Workspace.find({
    $or: [
      { owner: userId },
      { admins: userId },
      { members: userId },
    ],
  }).select('_id')

  const workspaceIds = workspaces.map((workspace) => workspace._id)

  // Dashboard statistics and recent data.
  const [
    totalProjects,
    totalTasks,
    completedTasks,
    recentProjects,
    recentActivity,
  ] = await Promise.all([
    // All projects in accessible workspaces.
    Project.countDocuments({
      workspace: { $in: workspaceIds },
    }),

    // Tasks assigned to the logged-in user.
    Task.countDocuments({
      assignedTo: userId,
    }),

    // Completed tasks assigned to the logged-in user.
    Task.countDocuments({
      assignedTo: userId,
      status: 'done',
    }),

    // Latest 5 projects across accessible workspaces.
    Project.find({
      workspace: { $in: workspaceIds },
    })
      .select('name description status createdAt updatedAt workspace')
      .populate('workspace', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),

    // Latest 5 notifications for the logged-in user.
    Notification.find({
      recipient: userId,
    })
      .populate('actor', 'name username')
      .populate('workspace', 'name')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  return {
    stats: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
    },
    recentProjects,
    recentActivity,
  }
}
