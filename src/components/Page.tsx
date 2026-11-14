export function Page({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="wrap page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty" role="note">
      <b>{title}</b> {children}
    </div>
  );
}

export function Unavailable({ file }: { file: string }) {
  return (
    <Empty title="Data unavailable.">
      <code>{file}</code> was not accepted for this build, so nothing is shown here rather than something made up.
    </Empty>
  );
}
