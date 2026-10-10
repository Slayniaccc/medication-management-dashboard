import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { openIndexedDbRepository } from './storage/indexedDbRepository'
import { createMemoryRepository } from './storage/memoryRepository'
import type { Repository, Snapshot } from './storage/repository'
import { seedSnapshot } from './storage/seed'
import { mainId } from './screens/navigation'
import './index.css'

// Sits above every screen, because a change that was not kept matters whichever
// screen it was made on. The skip link and the view announcement are here for
// the same reason: the screens are replaced whole, and a live region only
// speaks if it was already in the document before its text changed.
function Root({ repository, initial }: { repository: Repository; initial: Snapshot }) {
  const [saveFailed, setSaveFailed] = useState(false)
  const [viewName, setViewName] = useState('')
  const notice = !repository.durable
    ? 'This browser is not letting AccessCare save on this device. Anything changed here will be lost when this page is closed or refreshed.'
    : saveFailed
      ? 'The last change could not be saved on this device. It will be lost when this page is closed or refreshed.'
      : ''

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
        initial={initial}
        onSaveFailed={() => setSaveFailed(true)}
        onViewChange={setViewName}
        repository={repository}
      />
    </>
  )
}

// Everything is read before the first render, so no screen ever shows a routine
// that is about to be replaced by the stored one.
async function start() {
  const seed = seedSnapshot(new Date())
  let repository: Repository
  let initial: Snapshot
  try {
    repository = await openIndexedDbRepository(seed)
    initial = await repository.load()
  } catch {
    repository = createMemoryRepository(seed)
    initial = await repository.load()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Root initial={initial} repository={repository} />
    </React.StrictMode>,
  )
}

start()
