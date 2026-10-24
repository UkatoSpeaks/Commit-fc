export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-dim sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Commit FC is a fan project. Not affiliated with EA Sports or FIFA.</p>
        <p>
          Built by{" "}
          <a href="https://github.com/UkatoSpeaks" target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:text-text hover:underline">
            @UkatoSpeaks
          </a>
        </p>
      </div>
    </footer>
  );
}
