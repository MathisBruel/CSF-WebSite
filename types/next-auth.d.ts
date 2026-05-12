import type { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: Role
    membershipActive: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      membershipActive: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    membershipActive: boolean
  }
}
