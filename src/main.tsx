import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { openIndexedDbRepository } from './storage/indexedDbRepository'
import { createMemoryRepository } from './storage/memoryRepository'
import type { Repository, Snapshot } from './storage/repository'
import { seedSnapshot } from './storage/seed'
import './index.css'

// Sits above every screen, because a change that was not kept matters whichever
// screen it was made on.
function Root({ repository, initial }: { repository: Repository; initial: Snapshot }) {
  const [saveFailed, setSaveFailed] = useState(false)
  const notice = !repository.durable
    ? 'This browser is not letting AccessCare save on this device. Anything changed here will be lost when this page is closed or refreshed.'
    : saveFailed
      ? 'The last change could not be saved on this device. It will be lost when this page is closed or refreshed.'
      : ''

  return (
    <>
      <div role="alert">
        {notice && (
          <p className="bg-highlight px-5 py-3 text-center text-base font-bold text-on-highlight">
            {notice}
          </p>
        )}
      </div>
      <App initial={initial} onSaveFailed={() => setSaveFailed(true)} repository={repository} />
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
