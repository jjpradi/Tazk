
  export const getRoleAuthorization = (user_rights, right_name) => {
    if (!user_rights) return false;
    // New object format from NavigationReducer
    if (!Array.isArray(user_rights)) {
      return !!user_rights[right_name];
    }
    // Old array format from roleReducer
    if (user_rights.length > 0) {
      return user_rights.some(item => item.right_name === right_name && item.value === true);
    }
    return false;
  };

