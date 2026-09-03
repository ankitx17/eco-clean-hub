import { useEffect, useState } from "react"
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth"
import { auth } from "../services/firebase"

function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState("citizen")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser)

        if (currentUser) {
          const tokenResult = await getIdTokenResult(currentUser)

          setRole(tokenResult.claims.role || "citizen")
        } else {
          setRole("citizen")
        }
      } catch (error) {
        console.error("Auth role error:", error)
        setRole("citizen")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    role,
    loading,
    isAuthenticated: !!user,
  }
}

export default useAuth