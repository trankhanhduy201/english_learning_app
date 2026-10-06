export const memberToUserData = (member) => ({
  username: member.member_username ?? "",
  full_name: member.member_name ?? "",
  first_name: member.member_first_name ?? "",
  last_name: member.member_last_name ?? "",
  avatar: member.member_avatar ?? null,
});