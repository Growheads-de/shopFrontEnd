const fs = require('fs');
const path = require('path');

const fetchCategoryProducts = (socket, categoryId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching products for category ${categoryId}`));
    }, 5000);

    socket.emit("getCategoryProducts", { categoryId: parseInt(categoryId) }, (response) => {
      clearTimeout(timeout);
      if (response && response.products !== undefined) {
        resolve(response);
      } else {
        reject(new Error(`Invalid response for category ${categoryId}: ${JSON.stringify(response)}`));
      }
    });
  });
};

const fetchProductDetails = (socket, productSeoName) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching product details for product ${productSeoName}`));
    }, 5000);

    socket.emit('getProductView', { seoName: productSeoName }, (response) => {
      clearTimeout(timeout);
      if (response && response.product) {
        resolve(response);
      } else {
        reject(new Error(`Invalid product response for product ${productSeoName}: ${JSON.stringify(response)}`));
      }
    });
  });
};

const fetchProductImage = (socket, bildId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching image ${bildId}`));
    }, 10000);

    socket.emit('getPic', { bildId, size: 'medium' }, (res) => {
      clearTimeout(timeout);
      if (res.success && res.imageBuffer) {
        resolve(res.imageBuffer);
      } else {
        reject(new Error(`Failed to fetch image ${bildId}: ${JSON.stringify(res)}`));
      }
    });
  });
};

const saveProductImages = async (socket, products, categoryName, outputDir) => {
  if (!products || products.length === 0) return;

  const assetsPath = path.resolve(outputDir, 'assets', 'images');
  
  // Ensure assets/images directory exists
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  let imagesSaved = 0;
  let imagesSkipped = 0;

  console.log(`   📷 Fetching images for ${products.length} products in "${categoryName}"...`);

  for (const product of products) {
    if (product.pictureList && product.pictureList.trim()) {
      // Parse pictureList string to get image IDs
      const imageIds = product.pictureList.split(',').map(id => id.trim()).filter(id => id);
      
      if (imageIds.length > 0) {
        // Process first image for each product
        const bildId = parseInt(imageIds[0]);
        const estimatedFilename = `prod${bildId}.jpg`; // We'll generate a filename based on the ID
        
        const imagePath = path.join(assetsPath, estimatedFilename);
        
        // Skip if image already exists
        if (fs.existsSync(imagePath)) {
          imagesSkipped++;
          continue;
        }

        try {
          const imageBuffer = await fetchProductImage(socket, bildId);
          fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
          imagesSaved++;
          
          // Small delay to avoid overwhelming server
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.log(`     ⚠️ Failed to fetch image ${estimatedFilename} (ID: ${bildId}): ${error.message}`);
        }
      }
    }
  }

  if (imagesSaved > 0 || imagesSkipped > 0) {
    console.log(`   📷 Images: ${imagesSaved} saved, ${imagesSkipped} already exist`);
  }
};

module.exports = {
  fetchCategoryProducts,
  fetchProductDetails,
  fetchProductImage,
  saveProductImages
}; 