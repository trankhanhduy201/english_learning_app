import { API_BASE_URL } from "../configs/apiConfig";

const AVATAR_COLORS = [
  "#003BFF",
  "#008F3C",
  "#D50000",
  "#E65100",
  "#5200CC",
  "#008F78",
  "#0097C7",
  "#3500B8",
  "#C00068",
  "#E69A00",
];

const normalizeNameValue = (value) =>
  (value ?? "")
    .toString()
    .trim();

export const getUserDisplayName = (user) => {
  if (!user || typeof user !== "object") {
    return "User";
  }

  const candidate =
    user.full_name ||
    user.username ||
    "User";

  return normalizeNameValue(candidate);
};

export const getUserAvatarInitial = (user) => {
  const fullName = getUserDisplayName(user);
  return (fullName.charAt(0) || "U").toUpperCase();
};

export const getUserAvatarBackground = (user) => {
  const source = getUserDisplayName(user);
  const hash = Array.from(source).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const resolveAvatarUrl = (avatarValue) => {
  if (!avatarValue) {
    return null;
  }

  const value = avatarValue.toString().trim();
  if (!value) {
    return null;
  }

  return value.startsWith("http") ? value : `${API_BASE_URL}/media/${value}`;
};

export const getUserAvatarImageSrc = (user) => {
  return resolveAvatarUrl(user?.avatar ?? null);
};

export const UserAvatar = ({
  user,
  size = 32,
  className = "",
  style = {},
  alt,
}) => {
  const src = getUserAvatarImageSrc(user);
  const initial = getUserAvatarInitial(user);
  const backgroundColor = getUserAvatarBackground(user);

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? getUserAvatarInitial(user)}
        className={`rounded-circle ${className}`.trim()}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "cover",
          ...style,
        }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold ${className}`.trim()}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor,
        fontSize: `${Math.max(12, size * 0.42)}px`,
        ...style,
      }}
      title={alt ?? getUserDisplayName(user)}
      aria-label={alt ?? getUserDisplayName(user)}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
