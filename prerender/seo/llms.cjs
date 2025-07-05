const generateLlmsTxt = (allCategories = [], allProductsData = [], baseUrl, config) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // Group products by category for statistics
  const productsByCategory = {};
  allProductsData.forEach((product) => {
    const categoryId = product.categoryId || 'uncategorized';
    if (!productsByCategory[categoryId]) {
      productsByCategory[categoryId] = [];
    }
    productsByCategory[categoryId].push(product);
  });

  // Find category names for organization
  const categoryMap = {};
  allCategories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  let llmsTxt = `# ${config.siteName} - Site Map for LLMs

Generated: ${currentDate}
Base URL: ${baseUrl}

## About ${config.brandName}
GrowHeads.de is a German online shop and local store in Dresden specializing in high-quality seeds, plants, and gardening supplies for cannabis cultivation. 

## Site Structure

### Static Pages
- **Home** - ${baseUrl}/
- **Datenschutz (Privacy Policy)** - ${baseUrl}/datenschutz
- **Impressum (Legal Notice)** - ${baseUrl}/impressum
- **AGB (Terms & Conditions)** - ${baseUrl}/agb
- **Widerrufsrecht (Right of Withdrawal)** - ${baseUrl}/widerrufsrecht
- **Batteriegesetzhinweise (Battery Law Notice)** - ${baseUrl}/batteriegesetzhinweise
- **Sitemap** - ${baseUrl}/sitemap
- **Growbox Konfigurator** - ${baseUrl}/Konfigurator - Interactive tool to configure grow box setups with bundle discounts
- **Profile** - ${baseUrl}/profile - User account and order management

### Site Features
- **Language**: German (${config.language})
- **Currency**: ${config.currency} (Euro)
- **Shipping**: ${config.country}
- **Payment Methods**: Credit Cards, PayPal, Bank Transfer, Cash on Delivery, Cash on Pickup

### Product Categories (${allCategories.length} categories)

`;

  // Add categories with links to their detailed LLM files
  allCategories.forEach((category) => {
    if (category.seoName) {
      const productCount = productsByCategory[category.id]?.length || 0;
      const categorySlug = category.seoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const productsPerPage = 50;
      const totalPages = Math.ceil(productCount / productsPerPage);
      
      llmsTxt += `#### ${category.name} (${productCount} products)`;
      
      if (totalPages > 1) {
        llmsTxt += `
- **Product Catalog**: ${totalPages} pages available
- **Page 1**: ${baseUrl}/llms-${categorySlug}-page-1.txt (Products 1-${Math.min(productsPerPage, productCount)})`;
        
        if (totalPages > 2) {
          llmsTxt += `
- **Page 2**: ${baseUrl}/llms-${categorySlug}-page-2.txt (Products ${productsPerPage + 1}-${Math.min(productsPerPage * 2, productCount)})`;
        }
        
        if (totalPages > 3) {
          llmsTxt += `
- **...**: Additional pages available`;
        }
        
        if (totalPages > 2) {
          llmsTxt += `
- **Page ${totalPages}**: ${baseUrl}/llms-${categorySlug}-page-${totalPages}.txt (Products ${((totalPages - 1) * productsPerPage) + 1}-${productCount})`;
        }
        
        llmsTxt += `
- **Access Pattern**: Replace "page-X" with desired page number (1-${totalPages})`;
      } else if (productCount > 0) {
        llmsTxt += `
- **Product Catalog**: ${baseUrl}/llms-${categorySlug}-page-1.txt`;
      } else {
        llmsTxt += `
- **Product Catalog**: No products available`;
      }
      
      llmsTxt += `

`;
    }
  });

  llmsTxt += `
---

*This sitemap is automatically generated during the site build process and includes all publicly accessible content. For technical inquiries, please refer to our contact information in the Impressum.*
`;

  return llmsTxt;
};

const generateCategoryLlmsTxt = (category, categoryProducts = [], baseUrl, config, pageNumber = 1, productsPerPage = 50) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const categorySlug = category.seoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Calculate pagination
  const totalProducts = categoryProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (pageNumber - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
  const pageProducts = categoryProducts.slice(startIndex, endIndex);

  let categoryLlmsTxt = `# ${category.name} - Product Catalog (Page ${pageNumber} of ${totalPages})

Generated: ${currentDate}
Base URL: ${baseUrl}
Category: ${category.name} (ID: ${category.id})
Category URL: ${baseUrl}/Kategorie/${category.seoName}

## Category Overview
This file contains products ${startIndex + 1}-${endIndex} of ${totalProducts} in the "${category.name}" category from ${config.siteName}. 

**Statistics:**
- **Total Products in Category**: ${totalProducts}
- **Products on This Page**: ${pageProducts.length}
- **Current Page**: ${pageNumber} of ${totalPages}
- **Category ID**: ${category.id}
- **Category URL**: ${baseUrl}/Kategorie/${category.seoName}
- **Back to Main Sitemap**: ${baseUrl}/llms.txt

`;

  // Add navigation hints for LLMs
  if (totalPages > 1) {
    categoryLlmsTxt += `## Navigation for LLMs

**How to access other pages in this category:**
`;
    
    if (pageNumber > 1) {
      categoryLlmsTxt += `- **Previous Page**: ${baseUrl}/llms-${categorySlug}-page-${pageNumber - 1}.txt
`;
    }
    
    if (pageNumber < totalPages) {
      categoryLlmsTxt += `- **Next Page**: ${baseUrl}/llms-${categorySlug}-page-${pageNumber + 1}.txt
`;
    }
    
    categoryLlmsTxt += `- **First Page**: ${baseUrl}/llms-${categorySlug}-page-1.txt
- **Last Page**: ${baseUrl}/llms-${categorySlug}-page-${totalPages}.txt

**All pages in this category:**
`;
    
    for (let i = 1; i <= totalPages; i++) {
      categoryLlmsTxt += `- **Page ${i}**: ${baseUrl}/llms-${categorySlug}-page-${i}.txt (Products ${((i-1) * productsPerPage) + 1}-${Math.min(i * productsPerPage, totalProducts)})
`;
    }
    
    categoryLlmsTxt += `

`;
  }

  if (pageProducts.length > 0) {
    pageProducts.forEach((product, index) => {
      if (product.seoName) {
        // Clean description for markdown (remove HTML tags and limit length)
        const cleanDescription = product.description
          ? product.description
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .trim()
              .substring(0, 300)
          : "";

        const globalIndex = startIndex + index + 1;
        categoryLlmsTxt += `## ${globalIndex}. ${product.name}

- **Product URL**: ${baseUrl}/Artikel/${product.seoName}
- **Article Number**: ${product.articleNumber || 'N/A'}
- **Price**: €${product.price || '0.00'}
- **Brand**: ${product.manufacturer || config.brandName}
- **Availability**: ${product.available ? 'In Stock' : 'Out of Stock'}`;

        if (product.gtin) {
          categoryLlmsTxt += `
- **GTIN**: ${product.gtin}`;
        }

        if (product.weight && !isNaN(product.weight)) {
          categoryLlmsTxt += `
- **Weight**: ${product.weight}g`;
        }

        if (cleanDescription) {
          categoryLlmsTxt += `

**Description:**
${cleanDescription}${product.description && product.description.length > 300 ? '...' : ''}`;
        }

        categoryLlmsTxt += `

---

`;
      }
    });
  } else {
    categoryLlmsTxt += `## No Products Available

This category currently contains no products.

`;
  }

  // Add footer navigation for convenience
  if (totalPages > 1) {
    categoryLlmsTxt += `## Page Navigation

`;
    if (pageNumber > 1) {
      categoryLlmsTxt += `← [Previous Page](${baseUrl}/llms-${categorySlug}-page-${pageNumber - 1}.txt) | `;
    }
    
    categoryLlmsTxt += `[Category Overview](${baseUrl}/llms-${categorySlug}-page-1.txt)`;
    
    if (pageNumber < totalPages) {
      categoryLlmsTxt += ` | [Next Page](${baseUrl}/llms-${categorySlug}-page-${pageNumber + 1}.txt) →`;
    }
    
    categoryLlmsTxt += `

`;
  }

  categoryLlmsTxt += `---

*This category product list is automatically generated during the site build process. Product availability and pricing are updated in real-time on the main website.*
`;

  return categoryLlmsTxt;
};

// Helper function to generate all pages for a category
const generateAllCategoryLlmsPages = (category, categoryProducts = [], baseUrl, config, productsPerPage = 50) => {
  const totalProducts = categoryProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const pages = [];
  
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const pageContent = generateCategoryLlmsTxt(category, categoryProducts, baseUrl, config, pageNumber, productsPerPage);
    const categorySlug = category.seoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `llms-${categorySlug}-page-${pageNumber}.txt`;
    
    pages.push({
      fileName,
      content: pageContent,
      pageNumber,
      totalPages
    });
  }
  
  return pages;
};

module.exports = {
  generateLlmsTxt,
  generateCategoryLlmsTxt,
  generateAllCategoryLlmsPages,
}; 