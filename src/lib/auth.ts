export const AUTH_CONFIG = {
  username: "Rahil",
  password: "MadOmedia@2026",
  cookieName: "madomedia_crm_session",
  sessionToken: "madomedia_auth_token_rahil_2026_secured",
};

export function isValidSession(cookieValue?: string): boolean {
  return cookieValue === AUTH_CONFIG.sessionToken;
}
