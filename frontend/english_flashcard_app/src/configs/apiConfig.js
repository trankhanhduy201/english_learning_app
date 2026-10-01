const isSecure = window.location.protocol === "https:";

export const API_BASE_URL =
  `${isSecure ? "https" : "http"}://localhost:54080`;

export const WS_BASE_URL =
  `${isSecure ? "wss" : "ws"}://localhost:54080`;

// export const API_BASE_URL =
//   `${isSecure ? "https" : "http"}://demo2api.trankhanhduy201.io.vn`;

// export const WS_BASE_URL =
//   `${isSecure ? "wss" : "ws"}://demo2api.trankhanhduy201.io.vn`;
