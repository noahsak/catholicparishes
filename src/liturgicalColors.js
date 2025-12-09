// src/liturgicalColors.js
export const accentColors = {
  WHITE: "#FFFFFF",
  RED: "#d43737ff",
  GREEN: "#0d5c0dff",
  PURPLE: "#8a218aff",
  ROSE: "#FFC0CB",
  BLACK: "#000000",
  BLUE: "#6496faff"
};

export const darkAccentColors = {
  WHITE: "#F5F5F5",
  RED: "#ff0606ff",
  GREEN: "#074b07ff",
  PURPLE: "#45236dff", 
  ROSE: "#ff8fa2ff",
  BLACK: "#AAAAAA",
  BLUE: "#4779efff"
};

// Add icon file paths dynamically
export const iconPaths = {
  WHITE: {
    light: require("./assets/church_icon_white_light.png"),
    dark: require("./assets/church_icon_white_dark.png"),
  },
  RED: {
    light: require("./assets/church_icon_red_light.png"),
    dark: require("./assets/church_icon_red_dark.png"),
  },
  GREEN: {
    light: require("./assets/church_icon_green_light.png"),
    dark: require("./assets/church_icon_green_dark.png"),
  },
  PURPLE: {
    light: require("./assets/church_icon_purple_light.png"),
    dark: require("./assets/church_icon_purple_dark.png"),
  },
  ROSE: {
    light: require("./assets/church_icon_rose_light.png"),
    dark: require("./assets/church_icon_rose_dark.png"),
    },
  BLUE: {
    light: require("./assets/church_icon_blue_light.png"),
    dark: require("./assets/church_icon_blue_dark.png"),
  },
};
