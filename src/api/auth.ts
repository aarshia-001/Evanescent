// src/api/auth.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const signup = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};
