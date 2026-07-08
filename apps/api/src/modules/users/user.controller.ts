import type { Request, Response } from 'express';
import * as userService from './user.service.js';
import { toUserDto } from './user.mappers.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getUserOrThrow(req.userId!);
  res.json({ user: toUserDto(user) });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.updateProfile(req.userId!, req.body);
  res.json({ user: toUserDto(user) });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  await userService.changePassword(req.userId!, req.body.currentPassword, req.body.newPassword);
  res.status(204).send();
}
