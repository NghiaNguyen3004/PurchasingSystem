import { useEffect } from "react"

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase()
      if (["input", "textarea", "select"].includes(tag)) return

      shortcuts.forEach(({ key, shift, fn }) => {
        const shiftMatch = shift ? e.shiftKey:true
        if (e.key === key && shiftMatch)
          fn()
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}