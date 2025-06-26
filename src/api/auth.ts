const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (!response.ok) {
      const message = data?.error || "Signup failed. Please try again.";
      throw new Error(message);
    }

    return data;
  } catch (err: any) {
    console.error("Signup error:", err);
    throw new Error(err.message || "Something went wrong during signup.");
  }
};
