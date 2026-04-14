import { useRef, useCallback, useEffect } from 'react'

/**
 * Touch-based drag and drop for a draggable handle.
 * Movement starts drag immediately (no long-press delay).
 * Uses document.elementFromPoint() to find drop targets.
 *
 * @param {object} opts
 * @param {() => object}   opts.getDragSrc  – returns the drag source descriptor
 * @param {(target: Element|null) => void} opts.onDrop – called on touchend with drop target el
 * @param {string}         opts.dropTargetSelector  – CSS selector to match valid drop targets
 * @param {string}         [opts.highlightClass]    – class added to hovered drop target
 */
export function useTouchDrag({ getDragSrc, onDrop, dropTargetSelector, highlightClass = 'touch-drop-target' }) {
  const stateRef = useRef(null)
  const handleRef = useRef(null)

  // Attach non-passive touchmove to the handle element (React synthetic handlers are passive in Chrome)
  useEffect(() => {
    const el = handleRef.current
    if (!el) return
    const onMove = (e) => {
      if (!stateRef.current) return
      e.preventDefault() // must be non-passive to stop page scroll during drag
      const touch = e.touches[0]

      if (!stateRef.current.dragging) {
        const dx = touch.clientX - stateRef.current.startX
        const dy = touch.clientY - stateRef.current.startY
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
        stateRef.current.dragging = true
        stateRef.current.dragEl?.classList.add('touch-dragging')
      }

      // Find element under finger (temporarily hide dragged el)
      const dragEl = stateRef.current.dragEl
      if (dragEl) dragEl.style.pointerEvents = 'none'
      const under = document.elementFromPoint(touch.clientX, touch.clientY)
      if (dragEl) dragEl.style.pointerEvents = ''

      // Highlight nearest matching drop target
      document.querySelectorAll('.' + highlightClass).forEach(n => n.classList.remove(highlightClass))
      const target = under?.closest(dropTargetSelector)
      if (target && target !== dragEl) {
        target.classList.add(highlightClass)
        stateRef.current.dropTarget = target
      } else {
        stateRef.current.dropTarget = null
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  })

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('[data-delstep],[data-deljob]')) return
    e.stopPropagation()
    const touch = e.touches[0]
    const dragEl = e.currentTarget.closest('[data-draggable]') || e.currentTarget.parentElement
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      dragging: false,
      dragEl,
      dropTarget: null,
    }
    // Set drag source immediately so it's ready when drop fires
    const src = getDragSrc()
    if (src) stateRef.current.src = src
  }, [getDragSrc])

  const handleTouchEnd = useCallback((e) => {
    if (!stateRef.current) return
    const { dragging, dragEl, dropTarget } = stateRef.current
    stateRef.current = null

    // Reset visual state
    dragEl?.classList.remove('touch-dragging')
    document.querySelectorAll('.' + highlightClass).forEach(n => n.classList.remove(highlightClass))

    if (dragging) {
      e.preventDefault() // stop click from firing after drag
      onDrop(dropTarget)
    }
  }, [onDrop, highlightClass])

  return { handleRef, handleTouchStart, handleTouchEnd }
}
