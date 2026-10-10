/**
 * Settings that differ per deployment. One built image serves every environment: the container
 * entrypoint writes `/deployment-config.json` from environment variables at startup (see
 * docker/40-deployment-config.sh) and any value set there overrides the defaults below.
 *
 * To add a setting: add it here with a default, then map an environment variable to it in the
 * entrypoint script.
 */
export interface DeploymentConfig {
  /** Prefix for API calls. Same-origin (`/api`) by default so no CORS is needed. */
  apiBaseUrl: string;
  /** OIDC issuer the SPA signs in against. */
  oidcAuthority: string;
  /** Public (PKCE) client registered for the SPA. */
  oidcClientId: string;
  oidcScope: string;
}

/** Defaults match the local Keycloak stack in docker/docker-compose.yml. */
export const DEFAULT_DEPLOYMENT_CONFIG: DeploymentConfig = {
  apiBaseUrl: '/api',
  oidcAuthority: 'http://localhost:8081/realms/template-realm',
  oidcClientId: 'angular-spa',
  oidcScope: 'openid profile email roles',
};

/** Overlays non-empty string values from `overrides` onto the defaults; unknown keys are ignored. */
export function mergeDeploymentConfig(overrides: unknown): DeploymentConfig {
  const merged: DeploymentConfig = { ...DEFAULT_DEPLOYMENT_CONFIG };
  if (!overrides || typeof overrides !== 'object') {
    return merged;
  }

  const target = merged as unknown as Record<string, string>;
  for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
    if (key in DEFAULT_DEPLOYMENT_CONFIG && typeof value === 'string' && value.trim() !== '') {
      target[key] = value.trim();
    }
  }
  return merged;
}
