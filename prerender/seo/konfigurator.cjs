const generateKonfiguratorMetaTags = (baseUrl, config) => {
  const description = "Unser interaktiver Growbox Konfigurator hilft dir dabei, das perfekte Indoor Growing Setup zusammenzustellen. Wähle aus verschiedenen Growbox-Größen, Beleuchtung, Belüftung und Extras. Bundle-Rabatte bis 36%!";
  const keywords = "Growbox Konfigurator, Indoor Growing, Growzelt, Beleuchtung, Belüftung, Growbox Setup, Indoor Garden";
  
  // Ensure URLs are properly formatted
  const canonicalUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const imageUrl = `${canonicalUrl}${config.images.placeholder}`; // Placeholder image

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Growbox Konfigurator - Stelle dein perfektes Indoor Grow Setup zusammen">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${canonicalUrl}/Konfigurator">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${config.siteName}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Growbox Konfigurator - Indoor Grow Setup">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}/Konfigurator">
  `;
};

module.exports = {
  generateKonfiguratorMetaTags,
}; 