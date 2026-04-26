export { APP_TIME_ZONE, formatCreatedAt, formatDateTime } from "./utilities/date";
export { upperFirstCharactor };
const upperFirstCharactor = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
