import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { users } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import type { NewUser } from 'src/db/schema';

@Injectable()
export class UsersService {
  async findByVerificationToken(token: string) {
    return db.query.users.findFirst({
      where: eq(users.verificationToken, token),
    });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findAll() {
    return db.query.users.findMany();
  }

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id)).returning();
  }
}
