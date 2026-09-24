export default function AuthLayout({ eyebrow, title, subtitle, children, aside }) {
  return (
    <section className="auth container">
      <div className="auth__art" aria-hidden="true">
        <div className="auth__ticket">
          <span className="auth__ticket-top">ADMIT ONE</span>
          <span className="auth__ticket-big">{aside.big}</span>
          <span className="auth__ticket-small">{aside.small}</span>
          <span className="auth__ticket-barcode" />
        </div>
        <p className="auth__quote">{aside.quote}</p>
      </div>

      <div className="auth__panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display">{title}</h1>
        <p className="lede">{subtitle}</p>
        {children}
      </div>
    </section>
  )
}
