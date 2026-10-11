import { useEffect, useRef, useState } from "react";
import { screenNames, viewHeadingId, type Screen } from "../screens/navigation";

export function useNavigation({
  initialScreen,
  onViewChange,
}: {
  initialScreen: Screen;
  onViewChange: (name: string) => void;
}) {
  const [screen, setScreen] = useState<Screen>(initialScreen);

  // The tab and the history entry say which view this is.
  useEffect(() => {
    document.title = `${screenNames[screen]} · AccessCare`;
  }, [screen]);

  // Views are swapped rather than navigated to, so nothing tells a screen
  // reader that the page changed. Focus goes to the new heading and the name is
  // announced, once the new view is in the document. Not on first load, where
  // moving focus would take it from wherever the browser put it.
  const shown = useRef(screen);
  useEffect(() => {
    if (shown.current === screen) return;
    shown.current = screen;
    document.getElementById(viewHeadingId)?.focus();
    onViewChange(screenNames[screen]);
  }, [onViewChange, screen]);

  const goTo = (target: Screen) => {
    setScreen(target);
    // No behaviour is passed, so the stylesheet decides whether this glides or
    // jumps. That is where both reduced motion rules live.
    window.scrollTo({ top: 0 });
  };

  return { goTo, screen };
}
