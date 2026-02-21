import type { User } from "../../entities/users/schema";
import { getResource } from "../../shared/api/rest-client";

const BASE = "/users/me";

export const getProfile = (): Promise<User> => {
    return getResource<User>(BASE);
};