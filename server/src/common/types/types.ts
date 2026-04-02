import { UserRole } from 'generated/prisma/enums';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
