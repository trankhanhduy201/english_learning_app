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

const normalizeUserName = (user) => {
  if (!user || typeof user !== "object") {
    return "User";
  }

  const candidate =
    user.last_name ||
    user.member_name ||
    user.name ||
    user.username ||
    user.first_name ||
    user.email ||
    "User";

  return normalizeNameValue(candidate);
};

export const getUserAvatarInitial = (user) => {
  const fullName = normalizeUserName(user);
  const lastName = fullName.split(/\s+/).pop() || fullName;
  return (lastName.charAt(0) || "U").toUpperCase();
};

export const getUserAvatarBackground = (user) => {
  const source = normalizeUserName(user);
  const hash = Array.from(source).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const getUserAvatarImageSrc = (user) => {
  const avatarValue =
    user?.avatar ??
    user?.avartar ??
    user?.profile?.avatar ??
    user?.image_url ??
    null;

  if (!avatarValue) {
    return null;
  }

  const value = avatarValue.toString();
  return value.startsWith("http") ? value : `${API_BASE_URL}${value}`;
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
      title={alt ?? normalizeUserName(user)}
      aria-label={alt ?? normalizeUserName(user)}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
