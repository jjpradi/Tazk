export const UserRightsAuthorization = (user_rights, right_name, action) => {
  if (!user_rights) return false;

  const checkPermission = (item) => {
    if (item.menu_key !== right_name) return false;

    // dynamic field check
    return item[action] === 1;
  };

  // Object format
  if (!Array.isArray(user_rights)) {
    return checkPermission(user_rights);
  }

  // Array format
  if (user_rights.length > 0) {
    return user_rights.some(checkPermission);
  }

  return false;
};