import React from 'react'
import ReactDOM from 'react-dom/client'
import { Root } from './Root'
import { openIndexedDbRepository } from './storage/indexedDbRepository'
import { createMemoryRepository } from './storage/memoryRepository'
import type { Repository, Snapshot } from './storage/repository'
import { emptyDetails, emptySnapshot } from './storage/snapshots'
import './index.css'

// Everything is read before the first render, so no screen ever shows a routine
// that is about to be replaced by the stored one. A device that has never been
// used starts empty, at the welcome page.
async function start() {
  let repository: Repository
  let initial: Snapshot
  try {
    repository = await openIndexedDbRepository(emptyDetails)
    initial = await repository.load()
  } catch {
    repository = createMemoryRepository(emptySnapshot())
    initial = await repository.load()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Root initial={initial} repository={repository} />
    </React.StrictMode>,
  )
}

start()
