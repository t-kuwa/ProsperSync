import haruveIcon from "../../../assets/haruveIcon.svg";

type HaruveIconProps = {
  className?: string;
  alt?: string;
};

const HaruveIcon = ({ className, alt = "Haruve" }: HaruveIconProps) => {
  return (
    <img
      src={haruveIcon}
      alt={alt}
      className={`${className || ""} object-contain select-none`}
      draggable="false"
      loading="eager"
      style={{
        imageRendering: "auto",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    />
  );
};

export default HaruveIcon;
