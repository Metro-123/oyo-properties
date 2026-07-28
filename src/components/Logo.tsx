import oyoPropertiesLogo from "../assets/oyo-properties-logo.png"

type LogoSize = "sm" | "md" | "lg"

const sizes: Record<LogoSize, { width: number; height: number; imageWidth: number; top: number }> = {
  sm: { width: 132, height: 44, imageWidth: 205, top: -8 },
  md: { width: 160, height: 50, imageWidth: 245, top: -11 },
  lg: { width: 190, height: 56, imageWidth: 290, top: -15 },
}

export default function Logo({ size = "md" }: { size?: LogoSize; white?: boolean }) {
  const dimensions = sizes[size]

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <img
        src={oyoPropertiesLogo}
        alt="Oyo Properties"
        className="absolute max-w-none mix-blend-multiply"
        style={{ width: dimensions.imageWidth, top: dimensions.top, left: "50%", transform: "translateX(-50%)" }}
      />
    </div>
  )
}
