import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])) }
  catch { return null }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const user = token ? parseJwt(token) : null

  const login = (newToken) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook to use auth anywhere
export function useAuth() {
  return useContext(AuthContext)
}