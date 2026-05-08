export default function HelpTooltip({ label = "More information", children }) {
  return (
    <span className="help-tip">
      <button className="help-trigger" type="button" aria-label={label}>
        ?
      </button>
      <span className="help-bubble" role="tooltip">
        {children}
      </span>
    </span>
  );
}
