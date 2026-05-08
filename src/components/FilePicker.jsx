import { FileUp } from "lucide-react";

export default function FilePicker({ id, accept, file, onChange, actionLabel = "Choose file" }) {
  return (
    <div className="file-picker">
      <input
        id={id}
        className="file-picker-input"
        type="file"
        accept={accept}
        onChange={onChange}
      />
      <label className="file-picker-target" htmlFor={id}>
        <span className="file-picker-action">
          <FileUp size={16} aria-hidden="true" />
          {actionLabel}
        </span>
        <span className={`file-picker-name${file ? " has-file" : ""}`}>
          {file?.name || "No file selected"}
        </span>
      </label>
    </div>
  );
}
