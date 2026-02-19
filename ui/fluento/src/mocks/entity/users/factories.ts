import type { UserResource } from "../../../entities/users/type";

export function user(p: { id: number; name: string }): UserResource {
  return {
    id: p.id,
    name: p.name,
  };
}
