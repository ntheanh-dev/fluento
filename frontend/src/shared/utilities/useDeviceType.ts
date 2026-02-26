import { useEffect, useState } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

function getDeviceType(): DeviceType {
  const width = window.innerWidth;

  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export function useDeviceType() {
  const [device, setDevice] = useState<DeviceType>(getDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDevice(getDeviceType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };
}
