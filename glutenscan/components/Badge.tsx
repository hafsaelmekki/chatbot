import clsx from "clsx";

const badgeColor: Record<string, string> = {
  safe: "badge-safe",
  warning: "badge-warning",
  unsafe: "badge-unsafe",
  unknown: "badge-unknown"
};

type BadgeProps = {
  variant: keyof typeof badgeColor;
  children: React.ReactNode;
};

export default function Badge({ variant, children }: BadgeProps) {
  return <span className={clsx("badge", badgeColor[variant])}>{children}</span>;
}
