type ToggleButtonProps = {
  enabled: boolean;
  onClick: () => void;
  toggleBase: string;
};

export default function ToggleButton({ enabled, onClick, toggleBase }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${toggleBase} ${enabled ? "bg-cyan-400" : "bg-white/20"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
