/**
 * Access Control — manages who can use the AI Coach (Oracle) feature
 * Default admin: "Ignis"
 */

const STORAGE_KEY = "strategos_access_list";
const DEFAULT_ADMIN = "Ignis";

/**
 * Get the access list from localStorage
 */
export function getAccessList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const list = JSON.parse(stored);
      // Ensure Ignis is always in the list
      if (!list.some((u) => u.username.toLowerCase() === DEFAULT_ADMIN.toLowerCase())) {
        list.unshift({ username: DEFAULT_ADMIN, isAdmin: true });
        saveAccessList(list);
      }
      return list;
    }
  } catch (e) {
    console.error("Failed to read access list:", e);
  }

  // Default list
  const defaultList = [{ username: DEFAULT_ADMIN, isAdmin: true }];
  saveAccessList(defaultList);
  return defaultList;
}

/**
 * Save access list to localStorage
 */
function saveAccessList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Check if a username has access to the Oracle
 */
export function hasOracleAccess(username) {
  if (!username) return false;
  const list = getAccessList();
  return list.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Check if a username is an admin
 */
export function isAdmin(username) {
  if (!username) return false;
  const list = getAccessList();
  const user = list.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  return user?.isAdmin === true;
}

/**
 * Grant Oracle access to a new username (only admins can do this)
 */
export function grantAccess(adminUsername, targetUsername) {
  if (!isAdmin(adminUsername)) {
    return { success: false, error: "Only admins can grant access" };
  }

  const list = getAccessList();
  if (list.some((u) => u.username.toLowerCase() === targetUsername.toLowerCase())) {
    return { success: false, error: "User already has access" };
  }

  list.push({ username: targetUsername, isAdmin: false });
  saveAccessList(list);
  return { success: true };
}

/**
 * Revoke Oracle access from a username (only admins can do this)
 */
export function revokeAccess(adminUsername, targetUsername) {
  if (!isAdmin(adminUsername)) {
    return { success: false, error: "Only admins can revoke access" };
  }

  if (targetUsername.toLowerCase() === DEFAULT_ADMIN.toLowerCase()) {
    return { success: false, error: "Cannot revoke admin access from the default admin" };
  }

  const list = getAccessList();
  const filtered = list.filter(
    (u) => u.username.toLowerCase() !== targetUsername.toLowerCase()
  );
  saveAccessList(filtered);
  return { success: true };
}

/**
 * Make a user an admin (only existing admins can do this)
 */
export function makeAdmin(adminUsername, targetUsername) {
  if (!isAdmin(adminUsername)) {
    return { success: false, error: "Only admins can promote users" };
  }

  const list = getAccessList();
  const user = list.find(
    (u) => u.username.toLowerCase() === targetUsername.toLowerCase()
  );

  if (!user) {
    return { success: false, error: "User not in access list" };
  }

  user.isAdmin = true;
  saveAccessList(list);
  return { success: true };
}
