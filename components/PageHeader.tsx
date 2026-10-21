export function PageHeader({ eyebrow, title, copy, action }: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return <header className="page-header">
    <div className="page-title"><p className="kicker">{eyebrow}</p><h1>{title}</h1></div>
    <p className="page-copy">{copy}</p>
    {action && <div className="page-action">{action}</div>}
  </header>;
}
