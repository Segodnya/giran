/**
 * Environment configuration for GitHub integration
 * Validates and exposes environment variables
 */

export const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
  folder: process.env.GITHUB_REPO_FOLDER || 'content',
} as const;

/**
 * Check if GitHub integration is enabled
 * Returns true if all required environment variables are set
 */
export const isGitHubEnabled = () => {
  return Boolean(
    GITHUB_CONFIG.token && GITHUB_CONFIG.owner && GITHUB_CONFIG.repo,
  );
};

/**
 * Validate GitHub configuration and throw if invalid
 */
