import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

type AppSpinnerProps = {
  fullscreen?: boolean;
  className?: string;
  text?: string;
  size?: "small" | "default" | "large";
};

export function AppSpinner({
  fullscreen = false,
  className,
  text,
  size = "large",
}: AppSpinnerProps) {
  const indicator = <LoadingOutlined spin className="text-[#198de6]" />;

  if (fullscreen) {
    return (
      <Spin
        fullscreen
        size={size}
        indicator={indicator}
        tip={text}
        className={className}
      />
    );
  }

  return (
    <div
      className={["flex w-full items-center justify-center py-10", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Spin size={size} indicator={indicator} tip={text} />
    </div>
  );
}
