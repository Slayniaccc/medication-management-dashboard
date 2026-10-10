import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import { Toast } from "../components/Toast";
import { navItems, type Screen } from "./navigation";

// What the shell needs from the app. Each carer screen is handed this as one
// prop and passes it straight on.
export type CarerPageShell = {
  carerInitials: string;
  carerName: string;
  goTo: (target: string) => void;
  isNavActive: (target: string) => boolean;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  toast: string;
};

// The navigation, heading and toast shared by every carer screen except the
// dashboard, which still has its own copy of the navigation.
export function CarerPage({
  carerInitials,
  carerName,
  children,
  description,
  eyebrow,
  goTo,
  isNavActive,
  screen,
  setScreen,
  title,
  toast,
}: CarerPageShell & {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-inverse px-5 py-8 text-on-inverse lg:flex">
          <button
            className="flex items-center gap-4 rounded-xl px-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse"
            onClick={() => goTo("dashboard")}
            type="button"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight text-on-highlight">
              <Icon name="medication" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </button>
          <nav aria-label="Main navigation" className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={isNavActive(item.target) ? "page" : undefined}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse ${
                  isNavActive(item.target)
                    ? "bg-on-inverse text-inverse"
                    : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
                }`}
                key={item.label}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} className="h-6 w-6" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-2 pt-8">
            <button
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-focus-inverse ${
                screen === "help"
                  ? "bg-on-inverse text-inverse"
                  : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
              }`}
              onClick={() => setScreen("help")}
              type="button"
            >
              <Icon name="help" className="h-6 w-6" />
              Help & support
            </button>
            <button
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-focus-inverse ${
                screen === "settings"
                  ? "bg-on-inverse text-inverse"
                  : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
              }`}
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-6 w-6" />
              Settings
            </button>
            <button
              className="mt-5 flex w-full items-center gap-3 border-t border-on-inverse/15 px-3 pt-6 text-left focus-visible:outline-3 focus-visible:outline-focus-inverse"
              onClick={() => setScreen("profile")}
              type="button"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-bold text-ink">
                {carerInitials}
              </span>
              <span>
                <span className="block font-bold">{carerName}</span>
                <span className="block text-sm text-on-inverse-muted">Carer account</span>
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-line bg-surface lg:hidden">
            <div className="flex min-h-20 items-center justify-between px-5">
              <button
                className="flex items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-focus"
                onClick={() => goTo("dashboard")}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-highlight">
                  <Icon name="medication" />
                </span>
                <span className="font-bold">AccessCare</span>
              </button>
              <button
                aria-label="Open settings"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line-strong focus-visible:outline-3 focus-visible:outline-focus"
                onClick={() => setScreen("settings")}
                type="button"
              >
                <Icon name="settings" />
              </button>
            </div>
            <nav
              aria-label="Mobile navigation"
              className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3"
            >
              {navItems.map((item) => (
                <button
                  aria-current={isNavActive(item.target) ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
                    isNavActive(item.target)
                      ? "bg-primary text-on-primary"
                      : "bg-surface-sunken text-ink"
                  }`}
                  key={item.label}
                  onClick={() => goTo(item.target)}
                  type="button"
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="px-5 py-8 md:px-10 md:py-10 xl:px-14">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-lg leading-7 text-ink-muted">
              {description}
            </p>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
