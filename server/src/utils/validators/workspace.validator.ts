import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name cannot exceed 50 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
})

export const updateWorkspaceAdminSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  isAdmin: z.boolean(),
})


export const addWorkspaceMemberSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Enter a valid email or username')
    .max(254, 'Input is too long')
    .refine(
      (value) =>
        z.string().email().safeParse(value).success ||
        /^[a-z0-9_]{3,20}$/.test(value),
      'Enter a valid email or username'
    ),
})

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined,
    {
      message: 'At least one field is required',
    }
  )