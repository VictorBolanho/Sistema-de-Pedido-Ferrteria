export const ROLES = {
  ADMIN: "admin",
  ADVISOR: "advisor",
  CLIENT: "client",
};

export function getDefaultRouteByRole(role) {
  if (role === ROLES.ADMIN) {
    return "/admin";
  }
  if (role === ROLES.ADVISOR) {
    return "/advisor";
  }
  return "/catalog";
}

export function canAccessRole(role, allowedRoles = []) {
  return allowedRoles.includes(role);
}

export function getRoleLabel(role) {
  if (role === ROLES.ADMIN) {
    return "Admin";
  }
  if (role === ROLES.ADVISOR) {
    return "Asesor";
  }
  return "Cliente";
}

