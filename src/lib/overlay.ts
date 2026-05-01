const overlayStack: string[] = []

let bodyScrollLockCount = 0
let previousBodyOverflow = ''

export function pushOverlay(id: string) {
  const existingIndex = overlayStack.indexOf(id)

  if (existingIndex !== -1) {
    return existingIndex
  }

  overlayStack.push(id)

  return overlayStack.length - 1
}

export function removeOverlay(id: string) {
  const index = overlayStack.indexOf(id)

  if (index !== -1) {
    overlayStack.splice(index, 1)
  }
}

export function isTopOverlay(id: string) {
  return overlayStack.at(-1) === id
}

export function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  bodyScrollLockCount += 1
}

export function unlockBodyScroll() {
  if (bodyScrollLockCount === 0) return

  bodyScrollLockCount -= 1

  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
  }
}
