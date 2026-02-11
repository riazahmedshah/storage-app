import axios from "../configs/axios"

export const googleAuth = async (token: string) => {
  const { data } = await axios.post("/auth/google",{
    token
  });
  return data;
}