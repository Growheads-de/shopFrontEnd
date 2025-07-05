const generateCategoryJsonLd = (category, products = [], baseUrl, config) => {
  const categoryUrl = `${baseUrl}/Kategorie/${category.seoName}`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    name: category.name,
    url: categoryUrl,
    description: `${category.name} - Entdecken Sie unsere Auswahl an hochwertigen Produkten`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: categoryUrl,
        },
      ],
    },
  };

  // Add product list if products are available
  if (products && products.length > 0) {
    jsonLd.mainEntity = {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: `${baseUrl}/Artikel/${product.seoName}`,
          image:
            product.pictureList && product.pictureList.trim()
              ? `${baseUrl}/assets/images/prod${product.pictureList
                  .split(",")[0]
                  .trim()}.jpg`
              : `${baseUrl}/assets/images/nopicture.jpg`,
          description: product.description 
            ? product.description.replace(/<[^>]*>/g, "").substring(0, 200)
            : `${product.name} - Hochwertiges Growshop Produkt`,
          sku: product.articleNumber || product.seoName,
          brand: {
            "@type": "Brand",
            name: product.manufacturer || config.brandName,
          },
          offers: {
            "@type": "Offer",
            url: `${baseUrl}/Artikel/${product.seoName}`,
            price: product.price && !isNaN(product.price) ? product.price.toString() : "0.00",
            priceCurrency: config.currency,
            availability: product.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: config.brandName,
            },
            itemCondition: "https://schema.org/NewCondition",
          },
        },
      })),
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

module.exports = {
  generateCategoryJsonLd,
}; 