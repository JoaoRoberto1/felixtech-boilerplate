import { z } from 'zod';
import { emailSchema } from './auth.schema';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(100),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(slugRegex, 'Slug must be lowercase, alphanumeric, hyphen-separated')
    .optional(),
});
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export const inviteMemberSchema = z.object({
  email: emailSchema,
  roleId: z.string().cuid(),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const updateMemberRoleSchema = z.object({
  roleId: z.string().cuid(),
});
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(255).optional(),
  permissionKeys: z.array(z.string()).min(0),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(255).optional(),
  permissionKeys: z.array(z.string()).optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
