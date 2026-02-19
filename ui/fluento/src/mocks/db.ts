import type { UserResource } from "../entities/users/type";

export type Tables = {
  users: UserResource[];
};

export const db: Tables = {
  users: [],
};
