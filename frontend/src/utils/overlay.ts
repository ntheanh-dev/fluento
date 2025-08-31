export type OverlayOptions = {
  message?: string;
};

type OverlayHandler = (open: boolean, options?: OverlayOptions) => void;

let overlayHandler: OverlayHandler | null = null;

export const setOverlayHandler = (handler: OverlayHandler) => {
  overlayHandler = handler;
};

export const showOverlay = (options?: OverlayOptions) => {
  if (overlayHandler) overlayHandler(true, options);
};

export const hideOverlay = () => {
  if (overlayHandler) overlayHandler(false);
};


