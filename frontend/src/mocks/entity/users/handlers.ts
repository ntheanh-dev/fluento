import type { UserResource } from "../../../entities/users/type";
import { db } from "../../db";
import { http, HttpResponse } from "msw";
const BASE = "/api/users";

export const usersHandlers = [
  http.get(BASE, async () => {
    let rows: UserResource[] = db.users;

    return HttpResponse.json(rows);
  }),
];
