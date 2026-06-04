import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <span className="text-xl font-semibold italic tracking-tight">MyClinic</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Calm, considered healthcare. Book in seconds, keep your records close.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Bole, Addis Ababa</li>
            <li>Ethiopia</li>
            <li>+251 911 234 567</li>
            <li>something@myclinic.com</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Quick links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#services" className="transition-colors hover:text-foreground">Services</a></li>
            <li><a href="#how"      className="transition-colors hover:text-foreground">How it works</a></li>
            <li><Link href="/login"        className="transition-colors hover:text-foreground">Patient login</Link></li>
            <li><Link href="/portal/book"  className="transition-colors hover:text-foreground">Book appointment</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Connect</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="transition-colors hover:text-foreground">Twitter</a></li>
            <li><a href="#" className="transition-colors hover:text-foreground">LinkedIn</a></li>
            <li><a href="#" className="transition-colors hover:text-foreground">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} MyClinic Health</span>
        </div>
      </div>
    </footer>
  );
}