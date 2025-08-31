export type NotifySeverity = "success" | "error" | "info" | "warning";

type NotifyHandler = (message: string, severity?: NotifySeverity) => void;

let notifyHandler: NotifyHandler | null = null;

export const setNotifyHandler = (handler: NotifyHandler) => {
  notifyHandler = handler;
};

export const notify = (message: string, severity: NotifySeverity = "info") => {
  if (notifyHandler) notifyHandler(message, severity);
};


