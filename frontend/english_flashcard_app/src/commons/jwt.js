import { jwtDecode } from 'jwt-decode';

export const getTokenExp = (token: string, adjustExp: int = 120): number | null => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return (decoded.exp - adjustExp) * 1000;
  } catch (error) {
    return null;
  }
}

export const checkTokenExpired = (token, adjustExp) => {
  const expiresAt = getTokenExp(token, adjustExp);
  return expiresAt && Date.now() >= expiresAt;
}

export const getTokenPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
}

