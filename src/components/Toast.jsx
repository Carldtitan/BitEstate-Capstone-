export default function Toast({ message, type = "info", onClose }) {
  const iconMap = {
    success: "OK",
    error: "ERR",
    warning: "WARN",
    info: "INFO",
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{iconMap[type] || "INFO"}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close">
          x
        </button>
      )}
    </div>
  );
}
