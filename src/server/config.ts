// Server configuration with environment variables and defaults
const getEnv = (key: string, defaultValue: string): string => {
  // In development, try to read from process.env
  // In production/bundled code, use defaults
  return process.env[key] ?? defaultValue;
};

export const config = {
  server: {
    port: parseInt(getEnv('SERVER_PORT', '3000'), 10),
  },
  client: {
    port: parseInt(getEnv('CLIENT_PORT', '5173'), 10),
  },
  game: {
    maxPlayers: parseInt(getEnv('MAX_PLAYERS', '12'), 10),
    minPlayers: parseInt(getEnv('MIN_PLAYERS', '4'), 10),
  },
};

export default config;
