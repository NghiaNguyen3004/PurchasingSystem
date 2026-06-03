import {useEffect, useRef} from 'react';

function getFocusableElements(container){
    return [...container.querySelectorAll("*")].filter(el =>{
        if (el.offsetParent === null) return false
        if (el.disabled) return false
        return el.tabIndex >= 0;
    }
    )
}

export function useFocusTrap(active = true){
    const ref = useRef(null)
    useEffect(() =>{
        if (!active || !ref.current) return 
        const focusable = getFocusableElements(ref.current)
        focusable[0]?.focus()

        const handleKeyDown = (e) =>{
            if(e.key !== "Tab") return
            const focusable = getFocusableElements(ref.current)
            const first = focusable[0]
            const last = focusable[focusable.length -1]

            // Trapping the focus inside the modal
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last?.focus()
                }
            } else {
                    if (document.activeElement === last) {
                    e.preventDefault()
                    first?.focus()
                }
            }


        }  
        document.addEventListener("keydown", handleKeyDown)
        return() => document.removeEventListener("keydown", handleKeyDown)
    }, [active])
    
    return ref
}

