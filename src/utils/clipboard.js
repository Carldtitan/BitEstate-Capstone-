/**
 * Copy text to clipboard with visual feedback
 */
export const copyToClipboard = async (text, onSuccess, onError) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      onSuccess && onSuccess();
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      onSuccess && onSuccess();
    }
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    onError && onError(err);
  }
};
