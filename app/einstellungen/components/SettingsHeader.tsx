type Props = {
  isLoadingUser: boolean;
  saveMessage: string;
};

export default function SettingsHeader({ isLoadingUser, saveMessage }: Props) {
  return (
    <header className="mb-4 flex items-start justify-between">
      <div>
        <h1 className="text-5xl font-extrabold leading-none">Einstellungen</h1>
        <p className="mt-1 text-lg text-cyan-100/90">
          Verwalte dein Profil, Berechtigungen und App-Verhalten
        </p>
        <p className="mt-1 text-sm text-cyan-100/70">
          {isLoadingUser ? "Lade deine gespeicherten Angaben..." : saveMessage}
        </p>
      </div>
    </header>
  );
}
