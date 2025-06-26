import api from '../components/api'; // adjust path if needed

export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/api/signup', {
      name,
      email,
      password,
    });

    return response.data;
  } catch (err: any) {
    console.error("Signup error:", err);

    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Signup failed. Please try again.";

    throw new Error(message);
  }
};
