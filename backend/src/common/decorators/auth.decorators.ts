import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible (skips JWT guard).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';

/**
 * Restricts route access to specified user roles.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
