const generateHomepageMetaTags = (baseUrl, config) => {
  const description = config.descriptions.long;
  const keywords = config.keywords;
  const imageUrl = `${baseUrl}${config.images.logo}`;
  
  // Ensure URLs are properly formatted
  const canonicalUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${config.descriptions.short}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${config.siteName}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${config.descriptions.short}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
  `;
};

const generateHomepageJsonLd = (baseUrl, config, categories = []) => {
  // Ensure URLs are properly formatted
  const canonicalUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const logoUrl = `${canonicalUrl}${config.images.logo}`;

  const websiteJsonLd = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    name: config.brandName,
    url: canonicalUrl,
    description: config.descriptions.long,
    publisher: {
      "@type": "Organization",
      name: config.brandName,
      url: canonicalUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${canonicalUrl}/search?q={search_term_string}`,
      query: "required name=search_term_string"
    },
    mainEntity: {
      "@type": "WebPage",
      name: "Sitemap",
      url: `${canonicalUrl}/sitemap`,
      description: "Vollständige Sitemap mit allen Kategorien und Seiten",
    },
    sameAs: [
      // Add your social media URLs here if available
    ],
  };

  // Organization/LocalBusiness Schema for rich results
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": config.brandName,
    "alternateName": config.siteName,
    "description": config.descriptions.long,
    "url": canonicalUrl,
    "logo": logoUrl,
    "image": logoUrl,
    "telephone": "015208491860",
    "email": "service@growheads.de",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Trachenberger Strasse 14",
      "addressLocality": "Dresden",
      "postalCode": "01129",
      "addressCountry": "DE",
      "addressRegion": "Sachsen"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "51.083675",
      "longitude": "13.727215"
    },
    "openingHours": [
      "Mo-Fr 10:00:00-20:00:00",
      "Sa 11:00:00-19:00:00"
    ],
    "paymentAccepted": "Cash, Credit Card, PayPal, Bank Transfer",
    "currenciesAccepted": "EUR",
    "priceRange": "€€",
    "areaServed": {
      "@type": "Country",
      "name": "Germany"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "015208491860",
        "contactType": "customer service",
        "availableLanguage": "German",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "10:00:00",
          "closes": "20:00:00"
        }
      },
      {
        "@type": "ContactPoint",
        "email": "service@growheads.de",
        "contactType": "customer service",
        "availableLanguage": "German"
      }
    ],
    "sameAs": [
      // Add social media URLs when available
      // "https://www.facebook.com/growheads",
      // "https://www.instagram.com/growheads"
         ]
   };

  // FAQPage Schema for common questions
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Welche Zahlungsmethoden akzeptiert GrowHeads?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wir akzeptieren Kreditkarten, PayPal, Banküberweisung, Nachnahme und Barzahlung bei Abholung in unserem Laden in Dresden."
        }
      },
      {
        "@type": "Question", 
        "name": "Liefert GrowHeads deutschlandweit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, wir liefern deutschlandweit. Zusätzlich haben wir einen Laden in Dresden (Trachenberger Strasse 14) für lokale Kunden."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Produkte bietet GrowHeads?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wir bieten ein komplettes Sortiment für den Indoor-Anbau: Beleuchtung, Belüftung, Dünger, Töpfe, Zelte, Messgeräte und vieles mehr für professionelle Zuchtanlagen."
        }
      },
      {
        "@type": "Question",
        "name": "Hat GrowHeads einen physischen Laden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, unser Laden befindet sich in Dresden, Trachenberger Strasse 14. Öffnungszeiten: Mo-Fr 10-20 Uhr, Sa 11-19 Uhr. Sie können auch online bestellen."
        }
      },
      {
        "@type": "Question",
        "name": "Bietet GrowHeads Beratung zum Indoor-Anbau?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, unser erfahrenes Team berät Sie gerne zu allen Aspekten des Indoor-Anbaus. Kontaktieren Sie uns telefonisch unter 015208491860 oder besuchen Sie unseren Laden."
        }
      }
    ]
  };

  // Generate ItemList for all categories (more appropriate for homepage)
  const categoriesListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Produktkategorien",
    "description": "Alle verfügbaren Produktkategorien in unserem Online-Shop",
    "numberOfItems": categories.filter(category => category.seoName).length,
    "itemListElement": categories
      .filter(category => category.seoName) // Only include categories with seoName
      .map((category, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "name": category.name,
          "url": `${canonicalUrl}/Kategorie/${category.seoName}`
        }
      }))
  };

  // Return all JSON-LD scripts
  const websiteScript = `<script type="application/ld+json">${JSON.stringify(websiteJsonLd)}</script>`;
  const organizationScript = `<script type="application/ld+json">${JSON.stringify(organizationJsonLd)}</script>`;
  const faqScript = `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`;
  const categoriesScript = categories.length > 0 
    ? `<script type="application/ld+json">${JSON.stringify(categoriesListJsonLd)}</script>`
    : '';

  return websiteScript + '\n' + organizationScript + '\n' + faqScript + (categoriesScript ? '\n' + categoriesScript : '');
};

module.exports = {
  generateHomepageMetaTags,
  generateHomepageJsonLd,
}; 