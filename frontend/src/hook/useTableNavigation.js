import {useEffect, useState} from 'react'

export function useTableNavigation(rows){
    const [focusedIndex, setFocusedIndex] = useState(null)
    useEffect(()=>{
        const handleKeyDown = (e) =>{
            if(focusedIndex === null) return

            if(e.key === "ArrowDown"){
                e.preventDefault()
                setFocusedIndex( i => Math.min(i + 1, rows.length-1))
            }

            if(e.key === "ArrowUp"){
                e.preventDefault()
                setFocusedIndex(i => Math.max(i-1, 0))
            }

            if(e.key === "Escape"){
                setFocusedIndex(null)
            }

        }

        window.addEventListener("keydown", handleKeyDown)
        return() => window.removeEventListener("keydown",handleKeyDown)
    }, [focusedIndex, rows.length])

    return {focusedIndex, setFocusedIndex}
}