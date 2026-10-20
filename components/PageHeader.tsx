export function PageHeader({ eyebrow, title, copy, action }: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return <header className="page-header">
    <div><p className="kicker">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>
    {action}
  </header>;
}
