import React, { Component } from "react";
import { Box, Typography, CardMedia, Stack, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import AddToCartButton from "./AddToCartButton.js";
import Images from "./Images.js";

// Utility function to clean product names by removing trailing number in parentheses
const cleanProductName = (name) => {
  if (!name) return "";
  // Remove patterns like " (1)", " (3)", " (10)" at the end of the string
  return name.replace(/\s*\(\d+\)\s*$/, "").trim();
};

// Product detail page with image loading
class ProductDetailPage extends Component {
  constructor(props) {
    super(props);

    if (
      window.productDetailCache &&
      window.productDetailCache[this.props.seoName]
    ) {
      this.state = {
        product: window.productDetailCache[this.props.seoName],
        loading: false,
        error: null,
        attributeImages: {},
        attributes: [],
        isSteckling: false,
        imageDialogOpen: false,
        komponenten: [],
        komponentenLoaded: false,
        komponentenData: {}, // Store individual komponent data with loading states
        komponentenImages: {}, // Store tiny pictures for komponenten
        totalKomponentenPrice: 0,
        totalSavings: 0
      };
    } else {
      this.state = {
        product: null,
        loading: true,
        error: null,
        attributeImages: {},
        attributes: [],
        isSteckling: false,
        imageDialogOpen: false,
        komponenten: [],
        komponentenLoaded: false,
        komponentenData: {}, // Store individual komponent data with loading states
        komponentenImages: {}, // Store tiny pictures for komponenten
        totalKomponentenPrice: 0,
        totalSavings: 0
      };
    }
  }

  componentDidMount() {
    this.loadProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.seoName !== this.props.seoName)
      this.setState(
        { product: null, loading: true, error: null, imageDialogOpen: false },
        this.loadProductData
      );
    
    // Handle socket connection changes
    const wasConnected = prevProps.socket && prevProps.socket.connected;
    const isNowConnected = this.props.socket && this.props.socket.connected;
    
    if (!wasConnected && isNowConnected && this.state.loading) {
      // Socket just connected and we're still loading, retry loading data
      this.loadProductData();
    }
  }

  loadKomponentImage = (komponentId, pictureList) => {
    // Initialize cache if it doesn't exist
    if (!window.smallPicCache) {
      window.smallPicCache = {};
    }

    // Skip if no pictureList
    if (!pictureList || pictureList.length === 0) {
      return;
    }

    // Get the first image ID from pictureList
    const bildId = pictureList.split(',')[0];
    
    // Check if already cached
    if (window.smallPicCache[bildId]) {
      this.setState(prevState => ({
        komponentenImages: {
          ...prevState.komponentenImages,
          [komponentId]: window.smallPicCache[bildId]
        }
      }));
      return;
    }

    // Check if socketB is available
    if (!this.props.socketB || !this.props.socketB.connected) {
      console.log("SocketB not connected yet, skipping image load for komponent:", komponentId);
      return;
    }

    // Fetch image from server
    this.props.socketB.emit('getPic', { bildId, size: 'small' }, (res) => {
      if (res.success) {
        // Cache the image
        window.smallPicCache[bildId] = URL.createObjectURL(new Blob([res.imageBuffer], { type: 'image/jpeg' }));
        
        // Update state
        this.setState(prevState => ({
          komponentenImages: {
            ...prevState.komponentenImages,
            [komponentId]: window.smallPicCache[bildId]
          }
        }));
      } else {
        console.log('Error loading komponent image:', res);
      }
    });
  }

  loadKomponent = (id, count) => {
    // Initialize cache if it doesn't exist
    if (!window.productDetailCache) {
      window.productDetailCache = {};
    }

    // Check if this komponent is already cached
    if (window.productDetailCache[id]) {
      const cachedProduct = window.productDetailCache[id];
      
      // Load komponent image if available
      if (cachedProduct.pictureList) {
        this.loadKomponentImage(id, cachedProduct.pictureList);
      }
      
      // Update state with cached data
      this.setState(prevState => {
        const newKomponentenData = {
          ...prevState.komponentenData,
          [id]: {
            ...cachedProduct,
            count: parseInt(count),
            loaded: true
          }
        };
        
        // Check if all remaining komponenten are loaded
        const allLoaded = prevState.komponenten.every(k => 
          newKomponentenData[k.id] && newKomponentenData[k.id].loaded
        );
        
        // Calculate totals if all loaded
        let totalKomponentenPrice = 0;
        let totalSavings = 0;
        
        if (allLoaded) {
          totalKomponentenPrice = prevState.komponenten.reduce((sum, k) => {
            const komponentData = newKomponentenData[k.id];
            if (komponentData && komponentData.loaded) {
              return sum + (komponentData.price * parseInt(k.count));
            }
            return sum;
          }, 0);
          
          // Calculate savings (difference between buying individually vs as set)
          const setPrice = prevState.product ? prevState.product.price : 0;
          totalSavings = Math.max(0, totalKomponentenPrice - setPrice);
        }
        
        console.log("Cached komponent loaded:", id, "data:", newKomponentenData[id]);
        console.log("All loaded (cached):", allLoaded);
        
        return {
          komponentenData: newKomponentenData,
          komponentenLoaded: allLoaded,
          totalKomponentenPrice,
          totalSavings
        };
      });
      
      return;
    }

    // If not cached, fetch from server (similar to loadProductData)
    if (!this.props.socket || !this.props.socket.connected) {
      console.log("Socket not connected yet, waiting for connection to load komponent data");
      return;
    }

    // Mark this komponent as loading
    this.setState(prevState => ({
      komponentenData: {
        ...prevState.komponentenData,
        [id]: {
          ...prevState.komponentenData[id],
          loading: true,
          loaded: false,
          count: parseInt(count)
        }
      }
    }));

    this.props.socket.emit(
      "getProductView",
      { articleId: id },
      (res) => {
        if (res.success) {
          // Cache the successful response
          window.productDetailCache[id] = res.product;
          
          // Load komponent image if available
          if (res.product.pictureList) {
            this.loadKomponentImage(id, res.product.pictureList);
          }
          
          // Update state with loaded data
          this.setState(prevState => {
            const newKomponentenData = {
              ...prevState.komponentenData,
              [id]: {
                ...res.product,
                count: parseInt(count),
                loading: false,
                loaded: true
              }
            };
            
                    // Check if all remaining komponenten are loaded
        const allLoaded = prevState.komponenten.every(k => 
          newKomponentenData[k.id] && newKomponentenData[k.id].loaded
        );
            
            // Calculate totals if all loaded
            let totalKomponentenPrice = 0;
            let totalSavings = 0;
            
            if (allLoaded) {
              totalKomponentenPrice = prevState.komponenten.reduce((sum, k) => {
                const komponentData = newKomponentenData[k.id];
                if (komponentData && komponentData.loaded) {
                  return sum + (komponentData.price * parseInt(k.count));
                }
                return sum;
              }, 0);
              
              // Calculate savings (difference between buying individually vs as set)
              const setPrice = prevState.product ? prevState.product.price : 0;
              totalSavings = Math.max(0, totalKomponentenPrice - setPrice);
            }
            
            console.log("Updated komponentenData for", id, ":", newKomponentenData[id]);
            console.log("All loaded:", allLoaded);
            
            return {
              komponentenData: newKomponentenData,
              komponentenLoaded: allLoaded,
              totalKomponentenPrice,
              totalSavings
            };
          });
          
          console.log("getProductView (komponent)", res);
        } else {
          console.error("Error loading komponent:", res.error || "Unknown error", res);
          
          // Remove failed komponent from the list and check if all remaining are loaded
          this.setState(prevState => {
            const newKomponenten = prevState.komponenten.filter(k => k.id !== id);
            const newKomponentenData = { ...prevState.komponentenData };
            
            // Remove failed komponent from data
            delete newKomponentenData[id];
            
            // Check if all remaining komponenten are loaded
            const allLoaded = newKomponenten.length === 0 || newKomponenten.every(k => 
              newKomponentenData[k.id] && newKomponentenData[k.id].loaded
            );
            
            // Calculate totals if all loaded
            let totalKomponentenPrice = 0;
            let totalSavings = 0;
            
            if (allLoaded && newKomponenten.length > 0) {
              totalKomponentenPrice = newKomponenten.reduce((sum, k) => {
                const komponentData = newKomponentenData[k.id];
                if (komponentData && komponentData.loaded) {
                  return sum + (komponentData.price * parseInt(k.count));
                }
                return sum;
              }, 0);
              
              // Calculate savings (difference between buying individually vs as set)
              const setPrice = this.state.product ? this.state.product.price : 0;
              totalSavings = Math.max(0, totalKomponentenPrice - setPrice);
            }
            
            console.log("Removed failed komponent:", id, "remaining:", newKomponenten.length);
            console.log("All loaded after removal:", allLoaded);
            
            return {
              komponenten: newKomponenten,
              komponentenData: newKomponentenData,
              komponentenLoaded: allLoaded,
              totalKomponentenPrice,
              totalSavings
            };
          });
        }
      }
    );
  }

  loadProductData = () => {
    if (!this.props.socket || !this.props.socket.connected) {
      // Socket not connected yet, but don't show error immediately on first load
      // The componentDidUpdate will retry when socket connects
      console.log("Socket not connected yet, waiting for connection to load product data");
      return;
    }

    this.props.socket.emit(
      "getProductView",
      { seoName: this.props.seoName },
      (res) => {
        if (res.success) {
          res.product.seoName = this.props.seoName;
          
          // Initialize cache if it doesn't exist
          if (!window.productDetailCache) {
            window.productDetailCache = {};
          }
          
          // Cache the product data
          window.productDetailCache[this.props.seoName] = res.product;
          
          const komponenten = [];
          if(res.product.komponenten) {
            for(const komponent of res.product.komponenten.split(",")) {
              // Handle both "x" and "×" as separators
              const [id, count] = komponent.split(/[x×]/);
              komponenten.push({id: id.trim(), count: count.trim()});
            }
          }
          this.setState({
            product: res.product,
            loading: false,
            error: null,
            imageDialogOpen: false,
            attributes: res.attributes,
            komponenten: komponenten,
            komponentenLoaded: komponenten.length === 0 // If no komponenten, mark as loaded
          }, () => {
              if(komponenten.length > 0) {
                for(const komponent of komponenten) {
                  this.loadKomponent(komponent.id, komponent.count);
                }
              }
          });
          console.log("getProductView", res);

          // Initialize window-level attribute image cache if it doesn't exist
          if (!window.attributeImageCache) {
            window.attributeImageCache = {};
          }

          if (res.attributes && res.attributes.length > 0) {
            const attributeImages = {};

            for (const attribute of res.attributes) {
              const cacheKey = attribute.kMerkmalWert;

              if (attribute.cName == "Anzahl")
                this.setState({ isSteckling: true });

              // Check if we have a cached result (either URL or negative result)
              if (window.attributeImageCache[cacheKey]) {
                const cached = window.attributeImageCache[cacheKey];
                if (cached.url) {
                  // Use cached URL
                  attributeImages[cacheKey] = cached.url;
                }
              } else {
                // Not in cache, fetch from server
                if (this.props.socketB && this.props.socketB.connected) {
                  this.props.socketB.emit(
                    "getAttributePicture",
                    { id: cacheKey },
                    (res) => {
                    console.log("getAttributePicture", res);
                    if (res.success && !res.noPicture) {
                      const blob = new Blob([res.imageBuffer], {
                        type: "image/jpeg",
                      });
                      const url = URL.createObjectURL(blob);

                      // Cache the successful URL
                      window.attributeImageCache[cacheKey] = {
                        url: url,
                        timestamp: Date.now(),
                      };

                      // Update state and force re-render
                      this.setState(prevState => ({
                        attributeImages: {
                          ...prevState.attributeImages,
                          [cacheKey]: url
                        }
                      }));
                    } else {
                      // Cache negative result to avoid future requests
                      // This handles both failure cases and success with noPicture: true
                      window.attributeImageCache[cacheKey] = {
                        noImage: true,
                        timestamp: Date.now(),
                      };
                    }
                  }
                );
                }
              }
            }

            // Set initial state with cached images
            if (Object.keys(attributeImages).length > 0) {
              this.setState({ attributeImages });
            }
          }
        } else {
          console.error(
            "Error loading product:",
            res.error || "Unknown error",
            res
          );
          this.setState({
            product: null,
            loading: false,
            error: "Error loading product",
            imageDialogOpen: false,
          });
        }
      }
    );
  };

  handleOpenDialog = () => {
    this.setState({ imageDialogOpen: true });
  };

  handleCloseDialog = () => {
    this.setState({ imageDialogOpen: false });
  };

  render() {
    const { product, loading, error, attributeImages, isSteckling, attributes, komponentenLoaded, komponentenData, komponentenImages, totalKomponentenPrice, totalSavings } =
      this.state;

    if (loading) {
      return (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Produkt wird geladen...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom color="error">
            Fehler
          </Typography>
          <Typography>{error}</Typography>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography color="primary" sx={{ mt: 2 }}>
              Zurück zur Startseite
            </Typography>
          </Link>
        </Box>
      );
    }

    if (!product) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Produkt nicht gefunden
          </Typography>
          <Typography>
            Das gesuchte Produkt existiert nicht oder wurde entfernt.
          </Typography>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography color="primary" sx={{ mt: 2 }}>
              Zurück zur Startseite
            </Typography>
          </Link>
        </Box>
      );
    }
    // Format price with tax
    const priceWithTax = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(product.price);

    return (
      <Box
        sx={{
          p: { xs: 2, md: 2 },
          pb: { xs: 4, md: 8 },
          maxWidth: "1400px",
          mx: "auto",
        }}
      >
        {/* Breadcrumbs */}
        <Box
          sx={{
            mb: 2,
            position: ["-webkit-sticky", "sticky"], // Provide both prefixed and standard
            top: {
              xs: "80px",
              sm: "80px",
              md: "80px",
              lg: "80px",
            } /* Offset to sit below the header 120 mith menu for md and lg*/,
            left: 0,
            width: "100%",
            display: "flex",
            zIndex: (theme) =>
              theme.zIndex.appBar - 1 /* Just below the AppBar */,
            py: 0,
            px: 2,
          }}
        >
          <Box
            sx={{
              ml: { xs: 0, md: 0 },
              display: "inline-flex",
              px: 0,
              py: 1,
              backgroundColor: "#2e7d32", //primary dark green
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <Link
                to="/"
                onClick={() => this.props.navigate(-1)}
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  textDecoration: "none",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Zurück
              </Link>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "555px" },
              maxWidth: "100%",
              minHeight: "400px",
              background: "#f8f8f8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!product.pictureList && (
              <CardMedia
                component="img"
                height="400"
                image="/assets/images/nopicture.jpg"
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
            )}
            {product.pictureList && (
              <Images
                socket={this.props.socket}
                socketB={this.props.socketB}
                pictureList={product.pictureList}
                fullscreenOpen={this.state.imageDialogOpen}
                onOpenFullscreen={this.handleOpenDialog}
                onCloseFullscreen={this.handleCloseDialog}
              />
            )}
          </Box>

          {/* Product Details */}
          <Box
            sx={{
              flex: "1 1 60%",
              p: { xs: 2, md: 4 },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Product identifiers */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Artikelnummer: {product.articleNumber} {product.gtin ? ` | GTIN: ${product.gtin}` : ""}
              </Typography>
            </Box>

            {/* Product title */}
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600, color: "#333" }}
            >
              {cleanProductName(product.name)}
            </Typography>

            {/* Manufacturer if available */}
            {product.manufacturer && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  Hersteller: {product.manufacturer}
                </Typography>
              </Box>
            )}

            {/* Attribute images and chips */}
            {(attributes.some(attr => attributeImages[attr.kMerkmalWert]) || attributes.some(attr => !attributeImages[attr.kMerkmalWert])) && (
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
                {attributes
                  .filter(attribute => attributeImages[attribute.kMerkmalWert])
                  .map((attribute) => {
                    const key = attribute.kMerkmalWert;
                    return (
                      <Box key={key} sx={{ mb: 1 }}>
                        <CardMedia
                          component="img"
                          image={attributeImages[key]}
                          alt={`Attribute ${key}`}
                          sx={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "contain",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    );
                  })}
                {attributes
                  .filter(attribute => !attributeImages[attribute.kMerkmalWert])
                  .map((attribute) => (
                    <Chip
                      key={attribute.kMerkmalWert}
                      label={attribute.cWert}
                      disabled
                      sx={{ mb: 1 }}
                    />
                  ))}
              </Stack>
            )}

            {/* Weight */}
            {product.weight > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Gewicht: {product.weight.toFixed(1).replace(".", ",")} kg
                </Typography>
              </Box>
            )}

            {/* Price and availability section */}
            <Box
              sx={{
                mt: "auto",
                p: 3,
                background: "#f9f9f9",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "flex-start" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {priceWithTax}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    inkl. {product.vat}% MwSt.
                    {product.cGrundEinheit && product.fGrundPreis && (
                      <>; {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(product.fGrundPreis)}/{product.cGrundEinheit}</>
                    )}
                  </Typography>

                  {product.versandklasse &&
                    product.versandklasse != "standard" &&
                    product.versandklasse != "kostenlos" && (
                      <Typography variant="body2" color="text.secondary">
                        {product.versandklasse}
                      </Typography>
                    )}
                </Box>

                {/* Savings comparison - positioned between price and cart button */}
                {product.komponenten && komponentenLoaded && totalKomponentenPrice > product.price && 
                 (totalKomponentenPrice - product.price >= 2 && 
                  (totalKomponentenPrice - product.price) / product.price >= 0.02) && (
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    minWidth: { xs: "100%", sm: "200px" }
                  }}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: "#e8f5e8", textAlign: "center" }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: "bold",
                          color: "success.main"
                        }}
                      >
                        Sie sparen: {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(totalKomponentenPrice - product.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Günstiger als Einzelkauf
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: "flex-start",
                  }}
                >
                  {isSteckling && product.available == 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <AddToCartButton
                        steckling={true}
                        cartButton={true}
                        seoName={product.seoName}
                        pictureList={product.pictureList}
                        available={product.available}
                        id={product.id + "steckling"}
                        price={0}
                        vat={product.vat}
                        weight={product.weight}
                        availableSupplier={product.availableSupplier}
                        komponenten={product.komponenten}
                        name={cleanProductName(product.name) + " Stecklingsvorbestellung 1 Stück"}
                        versandklasse={"nur Abholung"}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontStyle: "italic",
                          color: "text.secondary",
                          textAlign: "center",
                          mt: 1
                        }}
                      >
                        Abholpreis: 19,90 € pro Steckling.
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AddToCartButton
                      cartButton={true}
                      seoName={product.seoName}
                      pictureList={product.pictureList}
                      available={product.available}
                      id={product.id}
                      availableSupplier={product.availableSupplier}
                      komponenten={product.komponenten}
                      cGrundEinheit={product.cGrundEinheit}
                      fGrundPreis={product.fGrundPreis}
                      price={product.price}
                      vat={product.vat}
                      weight={product.weight}
                      name={cleanProductName(product.name)}
                      versandklasse={product.versandklasse}
                    />

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontStyle: "italic",
                        color: "text.secondary",
                        textAlign: "center",
                        mt: 1
                      }}
                    >
                      {product.id.toString().endsWith("steckling") ? "Lieferzeit: 14 Tage" :
                       product.available == 1 ? "Lieferzeit: 2-3 Tage" : 
                       product.availableSupplier == 1 ? "Lieferzeit: 7-9 Tage" : ""}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Product full description */}
        {product.description && (
          <Box
            sx={{
              mt: 4,
              p: 4,
              background: "#fff",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                mt: 2,
                lineHeight: 1.7,
                "& p": { mt: 0, mb: 2 },
                "& strong": { fontWeight: 600 },
              }}
            >
              {parse(product.description)}
            </Box>
          </Box>
        )}

        {product.komponenten && product.komponenten.split(",").length > 0 && (
          <Box sx={{ mt: 4, p: 4, background: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h4" gutterBottom>Bestehend aus:</Typography>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
            
                        {(console.log("komponentenLoaded:", komponentenLoaded), komponentenLoaded) ? (
              <>
                {console.log("Rendering loaded komponenten:", this.state.komponenten.length, "komponentenData:", Object.keys(komponentenData).length)}
                {this.state.komponenten.map((komponent, index) => {
                  const komponentData = komponentenData[komponent.id];
                  console.log(`Rendering komponent ${komponent.id}:`, komponentData);
                  
                  // Don't show border on last item (pricing section has its own top border)
                  const isLastItem = index === this.state.komponenten.length - 1;
                  const showBorder = !isLastItem;
                  
                  if (!komponentData || !komponentData.loaded) {
                    return (
                      <Box key={komponent.id} sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        py: 1, 
                        borderBottom: showBorder ? "1px solid #eee" : "none",
                        minHeight: "70px" // Consistent height to prevent layout shifts
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ width: 50, height: 50, flexShrink: 0, backgroundColor: "#f5f5f5", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                            {/* Empty placeholder for image */}
                          </Box>
                          <Box>
                            <Typography variant="body1">
                              {index + 1}. Lädt...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {komponent.count}x
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          -
                        </Typography>
                      </Box>
                    );
                  }
                  
                  const itemPrice = komponentData.price * parseInt(komponent.count);
                  const formattedPrice = new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(itemPrice);
                  
                  return (
                    <Box 
                      key={komponent.id} 
                      component={Link}
                      to={`/Artikel/${komponentData.seoName}`}
                      sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        py: 1, 
                        borderBottom: showBorder ? "1px solid #eee" : "none",
                        textDecoration: "none",
                        color: "inherit",
                        minHeight: "70px", // Consistent height to prevent layout shifts
                        "&:hover": {
                          backgroundColor: "#f5f5f5"
                        }
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ width: 50, height: 50, flexShrink: 0 }}>
                          {komponentenImages[komponent.id] ? (
                            <CardMedia
                              component="img"
                              height="50"
                              image={komponentenImages[komponent.id]}
                              alt={komponentData.name}
                              sx={{ 
                                objectFit: "contain",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0"
                              }}
                            />
                          ) : (
                            <CardMedia
                              component="img"
                              height="50"
                              image="/assets/images/nopicture.jpg"
                              alt={komponentData.name}
                              sx={{ 
                                objectFit: "contain",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0"
                              }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {index + 1}. {cleanProductName(komponentData.name)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {komponent.count}x à {new Intl.NumberFormat("de-DE", {
                              style: "currency",
                              currency: "EUR",
                            }).format(komponentData.price)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formattedPrice}
                      </Typography>
                    </Box>
                  );
                })}
                
                {/* Total price and savings display - only show when prices differ meaningfully */}
                {totalKomponentenPrice > product.price && 
                 (totalKomponentenPrice - product.price >= 2 && 
                  (totalKomponentenPrice - product.price) / product.price >= 0.02) && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: "2px solid #eee" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">
                        Einzelpreis gesamt:
                      </Typography>
                      <Typography variant="h6" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(totalKomponentenPrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">
                        Set-Preis:
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(product.price)}
                      </Typography>
                    </Box>
                    {totalSavings > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, p: 2, backgroundColor: "#e8f5e8", borderRadius: 1 }}>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: "bold" }}>
                          Ihre Ersparnis:
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: "bold" }}>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(totalSavings)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            ) : (
              // Loading state
              <Box>
                {this.state.komponenten.map((komponent, index) => {
                  // For loading state, we don't know if pricing will be shown, so show all borders
                  return (
                    <Box key={komponent.id} sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      py: 1, 
                      borderBottom: "1px solid #eee",
                      minHeight: "70px" // Consistent height to prevent layout shifts
                    }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 50, height: 50, flexShrink: 0, backgroundColor: "#f5f5f5", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                        {/* Empty placeholder for image */}
                      </Box>
                      <Box>
                        <Typography variant="body1">
                          {index + 1}. Lädt Komponent-Details...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {komponent.count}x
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      -
                    </Typography>
                                      </Box>
                  );
                })}
              </Box>
            )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}

export default ProductDetailPage;
