import { sensitiveDataNotice } from "../lib/settingsDefaults";

export default function SensitiveNotice() {
  return (
    <p className="mb-3 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
      {sensitiveDataNotice}
    </p>
  );
}
