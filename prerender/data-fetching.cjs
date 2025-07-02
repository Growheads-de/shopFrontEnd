const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const fetchCategoryTree = (socket, categoryId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(`Timeout fetching category tree for category ${categoryId}`)
      );
    }, 5000);

    socket.emit(
      "categoryList",
      { categoryId: parseInt(categoryId) },
      (response) => {
        clearTimeout(timeout);
        if (response && response.categoryTree) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Invalid category tree response for category ${categoryId}: ${JSON.stringify(
                response
              )}`
            )
          );
        }
      }
    );
  });
};

const fetchCategoryProducts = (socket, categoryId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching products for category ${categoryId}`));
    }, 5000);

    socket.emit(
      "getCategoryProducts",
      { categoryId: parseInt(categoryId) },
      (response) => {
        clearTimeout(timeout);
        if (response && response.products !== undefined) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Invalid response for category ${categoryId}: ${JSON.stringify(
                response
              )}`
            )
          );
        }
      }
    );
  });
};

const fetchProductDetails = (socket, productSeoName) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Timeout fetching product details for product ${productSeoName}`
        )
      );
    }, 5000);

    socket.emit("getProductView", { seoName: productSeoName, nocount: true }, (response) => {
      clearTimeout(timeout);
      if (response && response.product) {
        response.product.seoName = productSeoName;
        resolve(response);
      } else {
        reject(
          new Error(
            `Invalid product response for product ${productSeoName}: ${JSON.stringify(
              response
            )}`
          )
        );
      }
    });
  });
};

const fetchProductImage = (socket, bildId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching image ${bildId}`));
    }, 10000);

    socket.emit("getPic", { bildId, size: "medium" }, (res) => {
      clearTimeout(timeout);
      if (res.success && res.imageBuffer) {
        resolve(res.imageBuffer);
      } else {
        reject(
          new Error(`Failed to fetch image ${bildId}: ${JSON.stringify(res)}`)
        );
      }
    });
  });
};

const fetchCategoryImage = (socket, categoryId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching category image for category ${categoryId}`));
    }, 10000);

    socket.emit("getCategoryPic", { categoryId }, (response) => {
      clearTimeout(timeout);
      if (response.success && response.image) {
        resolve(response.image);
      } else {
        reject(
          new Error(`Failed to fetch category image for ${categoryId}: ${JSON.stringify(response)}`)
        );
      }
    });
  });
};

const saveProductImages = async (socket, products, categoryName, outputDir) => {
  if (!products || products.length === 0) return;

  const assetsPath = path.resolve(
    __dirname,
    "..",
    outputDir,
    "assets",
    "images"
  );
  const overlayPath = path.resolve(
    __dirname,
    "..",
    "public",
    "assets",
    "images",
    "sh.png"
  );

  // Ensure assets/images directory exists
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  // Check if overlay file exists
  if (!fs.existsSync(overlayPath)) {
    console.log(
      `   ⚠️ Overlay file not found at ${overlayPath} - images will be saved without overlay`
    );
  }

  let imagesSaved = 0;
  let imagesSkipped = 0;

  console.log(
    `   📷 Fetching images for ${products.length} products in "${categoryName}"...`
  );

  for (const product of products) {
    if (product.pictureList && product.pictureList.trim()) {
      // Parse pictureList string to get image IDs
      const imageIds = product.pictureList
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);

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

          // If overlay exists, apply it to the image
          if (fs.existsSync(overlayPath)) {
            try {
              // Get image dimensions to center the overlay
              const baseImage = sharp(Buffer.from(imageBuffer));
              const baseMetadata = await baseImage.metadata();
                          
              const overlaySize = Math.min(baseMetadata.width, baseMetadata.height) * 0.4;
              
              // Resize overlay to 20% of base image size and get its buffer
              const resizedOverlayBuffer = await sharp(overlayPath)
                .resize({
                  width: Math.round(overlaySize),
                  height: Math.round(overlaySize),
                  fit: 'contain', // Keep full overlay visible
                  background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background instead of black bars
                })
                .toBuffer();

              // Calculate center position for the resized overlay
              const centerX = Math.floor((baseMetadata.width - overlaySize) / 2);
              const centerY = Math.floor((baseMetadata.height - overlaySize) / 2);

              const processedImageBuffer = await baseImage
                .composite([
                  {
                    input: resizedOverlayBuffer,
                    top: centerY,
                    left: centerX,
                    blend: "multiply", // Darkens the image, visible on all backgrounds
                    opacity: 0.3, 
                  },
                ])
                .jpeg() // Ensure output is JPEG
                .toBuffer();

              fs.writeFileSync(imagePath, processedImageBuffer);
              console.log(
                `     ✅ Applied centered inverted sh.png overlay to ${estimatedFilename}`
              );
            } catch (overlayError) {
              console.log(
                `     ⚠️ Failed to apply overlay to ${estimatedFilename}: ${overlayError.message}`
              );
              // Fallback: save without overlay
              fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
            }
          } else {
            // Save without overlay if overlay file doesn't exist
            fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
          }

          imagesSaved++;

          // Small delay to avoid overwhelming server
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.log(
            `     ⚠️ Failed to fetch image ${estimatedFilename} (ID: ${bildId}): ${error.message}`
          );
        }
      }
    }
  }

  if (imagesSaved > 0 || imagesSkipped > 0) {
    console.log(
      `   📷 Images: ${imagesSaved} saved, ${imagesSkipped} already exist`
    );
  }
};

const saveCategoryImages = async (socket, categories, outputDir) => {
  if (!categories || categories.length === 0) {
    console.log("   ⚠️ No categories provided for image collection");
    return;
  }

  console.log(`   📂 Attempting to fetch images for ${categories.length} categories via socket calls...`);
  
  // Debug: Log categories that will be processed
  console.log("   🔍 Categories to process:");
  categories.forEach((cat, index) => {
    console.log(`     ${index + 1}. "${cat.name}" (ID: ${cat.id}) -> cat${cat.id}.jpg`);
  });

  const assetsPath = path.resolve(
    __dirname,
    "..",
    outputDir,
    "assets",
    "images"
  );

  // Ensure assets/images directory exists
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  let imagesSaved = 0;
  let imagesSkipped = 0;
  let categoriesProcessed = 0;

  console.log(
    `   📂 Processing categories for image collection...`
  );

  for (const category of categories) {
    categoriesProcessed++;
    
    const estimatedFilename = `cat${category.id}.jpg`; // Use 'cat' prefix with category ID
    const imagePath = path.join(assetsPath, estimatedFilename);

    // Skip if image already exists
    if (fs.existsSync(imagePath)) {
      imagesSkipped++;
      console.log(`     ⏭️ Category image already exists: ${estimatedFilename} (${category.name})`);
      continue;
    }

    try {
      console.log(`     🔍 Fetching image for category "${category.name}" (ID: ${category.id})...`);
      const imageBuffer = await fetchCategoryImage(socket, category.id);

      // Convert to Uint8Array if needed (similar to CategoryBox.js)
      const uint8Array = new Uint8Array(imageBuffer);

      // Save category images without overlay processing
      fs.writeFileSync(imagePath, Buffer.from(uint8Array));
      console.log(
        `     💾 Saved category image: ${estimatedFilename} (${category.name})`
      );

      imagesSaved++;

      // Small delay to avoid overwhelming server
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(
        `     ⚠️ Failed to fetch category image for "${category.name}" (ID: ${category.id}): ${error.message}`
      );
      // Continue processing other categories even if one fails
    }
  }

  console.log(
    `   📂 Category image collection complete: ${imagesSaved} saved, ${imagesSkipped} already exist`
  );
  console.log(
    `   📊 Summary: ${categoriesProcessed}/${categories.length} categories processed`
  );
  
  if (imagesSaved === 0 && imagesSkipped === 0) {
    console.log("   ⚠️ No category images were found via socket calls - categories may not have images available");
  }
};

module.exports = {
  fetchCategoryTree,
  fetchCategoryProducts,
  fetchProductDetails,
  fetchProductImage,
  fetchCategoryImage,
  saveProductImages,
  saveCategoryImages,
};
