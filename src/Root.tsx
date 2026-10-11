import { useEffect, useState } from 'react'
import App from './App'
import type { Repository, Snapshot } from './storage/repository'
import { emptySnapshot, exampleSnapshot, isFirstRun } from './storage/snapshots'
import { mainId, screenNames, viewHeadingId } from './screens/navigation'

// Sits above every screen, because a change that was not kept matters whichever
// screen it was made on. The skip link and the view announcement are here for
// the same reason: the screens are replaced whole, and a live region only
// speaks if it was already in the document before its text changed.
export function Root({ repository, initial }: { repository: Repository; initial: Snapshot }) {
  const [saveFailed, setSaveFailed] = useState(false)
  const [viewName, setViewName] = useState('')
  // What the app was last started from. Loading or clearing the example swaps
  // everything at once, so the app is started again from the new snapshot
  // rather than every hook being taught to reset itself.
  const [loaded, setLoaded] = useState({ snapshot: initial, generation: 0 })
  const notice = !repository.durable
    ? 'This browser is not letting AccessCare save on this device. Anything changed here will be lost when this page is closed or refreshed.'
    : saveFailed
      ? 'The last change could not be saved on this device. It will be lost when this page is closed or refreshed.'
      : ''

  const replaceEverything = (snapshot: Snapshot) => {
    // Stored first, so the screen never shows data the device does not hold.
    repository
      .replaceAll(snapshot)
      .then(() => setLoaded(({ generation }) => ({ snapshot, generation: generation + 1 })))
      .catch(() => setSaveFailed(true))
  }

  // A restart is a change of view like any other: focus goes to the new
  // heading and the view is named. Not on first load.
  useEffect(() => {
    if (loaded.generation === 0) return
    document.getElementById(viewHeadingId)?.focus()
    setViewName(isFirstRun(loaded.snapshot) ? screenNames.welcome : screenNames.dashboard)
    window.scrollTo({ top: 0 })
  }, [loaded])

  return (
    <>
      <a
        className="absolute left-3 top-3 z-50 flex min-h-11 -translate-y-[200%] items-center rounded-xl bg-primary px-5 font-bold text-on-primary focus:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
        href={`#${mainId}`}
      >
        Skip to main content
      </a>
      <div role="alert">
        {notice && (
          <p className="bg-highlight px-5 py-3 text-center text-base font-bold text-on-highlight">
            {notice}
          </p>
        )}
      </div>
      <div aria-live="polite" className="sr-only">
        {viewName}
      </div>
      <App
        clearExample={() => replaceEverything(emptySnapshot())}
        initial={loaded.snapshot}
        key={loaded.generation}
        loadExample={() => replaceEverything(exampleSnapshot(new Date()))}
        onSaveFailed={() => setSaveFailed(true)}
        onViewChange={setViewName}
        repository={repository}
      />
    </>
  )
}
