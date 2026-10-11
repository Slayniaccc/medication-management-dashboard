import { useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { Toast } from "../components/Toast";
import {
  mainId,
  navItems,
  screenNames,
  secondaryNavItems,
  viewHeadingId,
  type Screen,
} from "./navigation";

// What the shell needs from the app. Each carer screen is handed this as one
// prop and passes it straight on.
export type CarerPageShell = {
  exampleData: boolean;
  goTo: (screen: Screen) => void;
  screen: Screen;
  toast: string;
};

const sidebarItem = (current: boolean) =>
  `flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse ${
    current
      ? "bg-on-inverse text-inverse"
      : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
  }`;

// The navigation, heading and toast shared by the carer screens.
export function CarerPage({
  action,
  children,
  description,
  exampleData,
  eyebrow,
  goTo,
  screen,
  title,
  toast,
}: CarerPageShell & {
  // The screen's main button, shown beside the heading.
  action?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  // The phone menu. Each screen renders its own shell, so this starts closed
  // again on every change of view.
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <nav
          aria-label="Main"
          className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-inverse px-5 py-8 text-on-inverse lg:flex"
        >
          <div className="flex items-center gap-4 px-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight text-on-highlight">
              <Icon name="medication" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </div>
          <div className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={item.screen === screen ? "page" : undefined}
                className={sidebarItem(item.screen === screen)}
                key={item.screen}
                onClick={() => goTo(item.screen)}
                type="button"
              >
                <Icon name={item.icon} className="h-6 w-6" />
                {screenNames[item.screen]}
              </button>
            ))}
          </div>
          <div className="mt-auto space-y-2 border-t border-on-inverse-muted pt-6">
            {secondaryNavItems.map((item) => (
              <button
                aria-current={item.screen === screen ? "page" : undefined}
                className={sidebarItem(item.screen === screen)}
                key={item.screen}
                onClick={() => goTo(item.screen)}
                type="button"
              >
                <Icon name={item.icon} className="h-6 w-6" />
                {screenNames[item.screen]}
              </button>
            ))}
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <header className="border-b border-line bg-surface lg:hidden">
            <div className="flex min-h-16 items-center gap-3 px-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Icon name="medication" />
              </span>
              <span className="font-bold">AccessCare</span>
              {/* Nine destinations take four rows on a phone, which would sit
                  between Meera and today's doses on every visit. They open
                  from one button and close again on arriving anywhere. */}
              <button
                aria-controls="phone-menu"
                aria-expanded={menuOpen}
                className="ml-auto flex min-h-11 items-center gap-2 rounded-xl border-2 border-line-strong px-4 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                <Icon name={menuOpen ? "close" : "more"} className="h-4 w-4" />
                Menu
              </button>
            </div>
            <nav
              aria-label="Main"
              className="flex flex-wrap gap-2 border-t border-line px-4 py-3"
              hidden={!menuOpen}
              id="phone-menu"
            >
              {[...navItems, ...secondaryNavItems].map((item) => (
                <button
                  aria-current={item.screen === screen ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                    item.screen === screen
                      ? "bg-primary text-on-primary"
                      : "bg-surface-sunken text-ink"
                  }`}
                  key={item.screen}
                  onClick={() => goTo(item.screen)}
                  type="button"
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {screenNames[item.screen]}
                </button>
              ))}
            </nav>
          </header>

          <main
            className="px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-10 md:py-10 xl:px-14"
            id={mainId}
            tabIndex={-1}
          >
            {exampleData && (
              <p className="mb-6 rounded-xl border-2 border-line-strong bg-surface px-4 py-3 text-base text-ink">
                <strong>Example data.</strong> The people, medicines and doses here are made up.
                Clear the example in Settings when you want to enter your own.
              </p>
            )}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
                  {eyebrow}
                </p>
                <h1
                  className="mt-2 text-3xl font-bold tracking-tight focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-4xl"
                  id={viewHeadingId}
                  tabIndex={-1}
                >
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-lg leading-7 text-ink-muted">
                  {description}
                </p>
              </div>
              {action}
            </div>
            <div className="mt-8">{children}</div>
          </main>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}
