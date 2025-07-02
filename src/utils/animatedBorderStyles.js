// Utility for generating animated border styles with configurable gradients

/**
 * Generates animated border CSS styles with configurable gradients
 * @param {Object} config - Configuration object
 * @param {Array} config.gradientColors - Array of color strings for the gradient
 * @param {string} config.animationDirection - 'spin' or 'spinReverse'
 * @param {number} config.animationDuration - Duration in seconds (default: 5)
 * @param {string} config.className - CSS class name for the card
 * @param {Object} config.boxShadow - Box shadow configuration
 * @param {number} config.borderPadding - Border padding in px (default: 8)
 * @param {number} config.borderRadius - Border radius in px (default: 24)
 * @returns {string} CSS string for the animated border
 */
export const generateAnimatedBorderStyle = ({
  gradientColors,
  animationDirection = "spin",
  animationDuration = 5,
  className,
  boxShadow,
  borderPadding = 8,
  borderRadius = 24,
}) => {
  const gradientString = gradientColors.join(", ");

  return `
  .${className} {
    padding: ${borderPadding}px !important;
    border-radius: ${borderRadius}px !important;
    ${boxShadow ? `box-shadow: ${boxShadow} !important;` : ""}
  }

  .${className}::before {
    content: '' !important;
    position: absolute !important;
    top: -50% !important;
    left: -50% !important;
    width: 200% !important;
    height: 200% !important;
    background: conic-gradient(
      from 0deg,
      ${gradientString}
    ) !important;
    animation: ${animationDirection} ${animationDuration}s linear infinite !important;
  }
  `;
};

/**
 * Base CSS for animated border functionality
 */
export const baseAnimatedBorderStyle = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spinReverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  /* Seamless carousel animation */
  @keyframes seamless-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-33.333%);
    }
  }

  /* Carousel container styles */
  .carousel-container {
    overflow: hidden !important;
    position: relative !important;
    width: 100% !important;
    padding: 20px 0 !important;
  }

  .carousel-track {
    display: flex !important;
    animation: seamless-scroll 45s linear infinite !important;
    gap: 20px !important;
    width: fit-content !important;
  }

  .carousel-track:hover {
    animation-play-state: paused !important;
  }

  .carousel-item {
    flex: 0 0 130px !important;
    height: 130px !important;
  }

  /* Base container with border space */
  .animated-border-card {
    position: relative !important;
    display: block !important;
    border-radius: 20px !important;
    padding: 4px !important;
    overflow: hidden !important;
    background: #000 !important;
  }

  /* Inner content with white background */
  .animated-border-card > a {
    position: relative !important;
    display: block !important;
    background: white !important;
    border-radius: 16px !important;
    z-index: 1 !important;
  }
`;

/**
 * Predefined gradient configurations
 */
export const gradientPresets = {
  seeds: {
    gradientColors: [
      "#1B5E20",
      "#2E7D32",
      "#388E3C",
      "#43A047",
      "#4CAF50",
      "#66BB6A",
      "#81C784",
      "#A5D6A7",
      "#C8E6C9",
      "#E8F5E8",
      "#C8E6C9",
      "#A5D6A7",
      "#81C784",
      "#66BB6A",
      "#4CAF50",
      "#43A047",
      "#388E3C",
      "#2E7D32",
      "#1B5E20",
    ],
    animationDirection: "spin",
    className: "seeds-card",
    borderPadding: 8,
    borderRadius: 24,
    boxShadow:
      "0 0 40px rgba(0, 200, 83, 0.5), 0 0 80px rgba(76, 175, 80, 0.3)",
  },
  cutlings: {
    gradientColors: [
      "#D4B896",
      "#C8A882",
      "#B8A082",
      "#A8956E",
      "#9E8B5A",
      "#8D7F46",
      "#7A7F32",
      "#6B8E23",
      "#7CB342",
      "#8BC34A",
      "#9CCC65",
      "#AED581",
      "#C5E1A5",
      "#DCEDC8",
      "#C5E1A5",
      "#AED581",
      "#9CCC65",
      "#8BC34A",
      "#7CB342",
      "#6B8E23",
      "#7A7F32",
      "#8D7F46",
      "#9E8B5A",
      "#A8956E",
      "#B8A082",
      "#C8A882",
      "#D4B896",
    ],
    animationDirection: "spinReverse",
    className: "cutlings-card",
    borderPadding: 8,
    borderRadius: 24,
    boxShadow:
      "0 0 20px rgba(212, 184, 150, 0.4), 0 0 40px rgba(168, 149, 110, 0.3)",
  },
};

/**
 * Generates complete animated border styles using presets or custom config
 * @param {string|Object} config - Preset name or custom configuration object
 * @returns {string} Complete CSS string
 */
export const getAnimatedBorderStyles = (config) => {
  let styleConfig;

  if (typeof config === "string" && gradientPresets[config]) {
    styleConfig = gradientPresets[config];
  } else if (typeof config === "object") {
    styleConfig = config;
  } else {
    throw new Error("Invalid configuration provided");
  }

  return baseAnimatedBorderStyle + generateAnimatedBorderStyle(styleConfig);
};

/**
 * Generates styles for multiple presets efficiently (avoids duplicate base styles)
 * @param {Array<string>} presetNames - Array of preset names
 * @returns {string} Complete CSS string with all presets
 */
export const getCombinedAnimatedBorderStyles = (presetNames) => {
  const specificStyles = presetNames
    .map((presetName) => {
      if (!gradientPresets[presetName]) {
        throw new Error(`Preset '${presetName}' not found`);
      }
      return generateAnimatedBorderStyle(gradientPresets[presetName]);
    })
    .join("");

  return baseAnimatedBorderStyle + specificStyles;
};
