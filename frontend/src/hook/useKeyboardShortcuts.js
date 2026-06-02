import { useEffect } from "react"

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase()
      const isFormField = ["input", "textarea", "select"].includes(tag)

      shortcuts.forEach(({ key, fn }) => {
        if (e.key === key && (!isFormField)) {
          fn()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}