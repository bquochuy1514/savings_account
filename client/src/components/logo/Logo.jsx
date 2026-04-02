// components/Logo.jsx
export default function Logo({
  src = "/Logo.png",
  height = 75,
  width = "auto",
  alt = "Logo",
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ height, width }}
      className="object-contain"
    />
  );
}
