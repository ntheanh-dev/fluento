import { usersHandlers } from "./entity/users/handlers";
import { seedAll } from "./seed";

seedAll();

export const handlers = [...usersHandlers];
