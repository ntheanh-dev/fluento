import type { UserResource } from "../../../entities/users/type";
import { faker } from "@faker-js/faker";
let seeded = false;
export function seedUsers(): void {
  if (seeded) return;
  seeded = true;

  const rows: UserResource[] = [];

  for (let i = 1; i < 200; i++) {
    rows.push({
      id: i,
      name: faker.person.fullName(),
    });
  }
}
