import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),

  workspaceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),

  status: z.enum(['planning', 'active', 'completed']).optional(),
})

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name cannot exceed 100 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),

    status: z.enum(['planning', 'active', 'completed']).optional(),

    workspaceId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const updateProjectRoleSchema = z.object({
  memberId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),

  role: z.enum(['manager', 'lead']),

  action: z.enum(['assign', 'remove']),
})