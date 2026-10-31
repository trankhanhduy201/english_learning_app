import { jwtDecode } from 'jwt-decode';

export const getTokenExp = (token, adjustExp = 120) => {
  try {
    const decoded = getTokenPayload(token);
    return (decoded.exp - adjustExp) * 1000;
  } catch (error) {
    return null;
  }
}

export const checkTokenExpired = (token, adjustExp) => {
  const expiresAt = getTokenExp(token, adjustExp);
  return expiresAt === null || Date.now() >= expiresAt;
}

export const getTokenPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
}

