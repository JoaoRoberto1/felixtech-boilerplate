import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from '@felix/shared';

const prisma = new PrismaClient();

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'team:view': 'View team details',
  'team:manage': 'Update team name and settings',
  'team:delete': 'Delete the team',
  'team:members:view': 'View team members',
  'team:members:invite': 'Invite new team members',
  'team:members:remove': 'Remove team members',
  'team:members:update_role': "Change a member's role",
  'team:roles:manage': 'Create, edit and delete custom roles',
  'team:billing:view': 'View subscription and billing history',
  'team:billing:manage': 'Manage subscription and payment methods',
};

async function main() {
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: { description: PERMISSION_DESCRIPTIONS[key] ?? null },
      create: { key, description: PERMISSION_DESCRIPTIONS[key] ?? null },
    });
  }
  console.log(`Seeded ${ALL_PERMISSIONS.length} permissions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
