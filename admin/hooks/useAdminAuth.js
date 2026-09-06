import { useEffect, useState } from "react"
import {
  getIdTokenResult,
  onAuthStateChanged,
} from "firebase/auth"

import { auth } from "../../src/services/firebase"

function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mounted) return

        if (!currentUser) {
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        try {
          const tokenResult = await getIdTokenResult(
            currentUser,
            true
          )

          const role = tokenResult?.claims?.role

          if (!mounted) return

          setUser(currentUser)
          setIsAdmin(role === "admin")
        } catch (error) {
          console.error(
            "Admin authentication error:",
            error
          )

          if (!mounted) return

          setUser(currentUser)
          setIsAdmin(false)
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return {
    user,
    isAdmin,
    loading,
    isAuthenticated: Boolean(user),
  }
}

export default useAdminAuth