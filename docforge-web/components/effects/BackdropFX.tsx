export function BackdropFX() {
  return (
    <div aria-hidden="true" className="rb-backdrop">
      <div className="rb-backdrop-grid" />
      <div className="rb-backdrop-blob rb-backdrop-blob-a" />
      <div className="rb-backdrop-blob rb-backdrop-blob-b" />
      <div className="rb-backdrop-vignette" />
    </div>
  );
}
