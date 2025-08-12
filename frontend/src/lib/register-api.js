const API_BASE_URL = "https://merry-courage-production.up.railway.app"

export async function registerUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.detail || "Registration failed")
    }

    return {
      success: true,
      data: data,
      user: data.usuario || data.user,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}