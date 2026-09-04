import { useCallback, useState } from "react"
import { getCurrentPosition } from "../services/locationService"

function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getLocation = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const currentLocation = await getCurrentPosition()

      setLocation(currentLocation)
    } catch (error) {
      console.error("Location Error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    location,
    loading,
    error,
    getLocation,
    hasLocation: !!location,
  }
}

export default useGeolocation