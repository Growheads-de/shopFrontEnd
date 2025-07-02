if (!window.sessionSettings) {
  window.sessionSettings = {};
}
export const getSessionSetting = (key) => {
  return window.sessionSettings[key];
};
export const setSessionSetting = (key, value) => {
  window.sessionSettings[key] = value;
};
export const removeSessionSetting = (key) => {
  delete window.sessionSettings[key];
};
export const clearAllSessionSettings = () => {
  window.sessionSettings = {};
};
export const getAllSettingsWithPrefix = (prefix) => {
  const filteredSettings = {};
  Object.keys(window.sessionSettings).forEach(key => {
    if (key.startsWith(prefix)) {
      filteredSettings[key] = window.sessionSettings[key];
    }
  });
  return filteredSettings;
}; 