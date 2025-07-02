import React, { Component } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";

if (!Array.isArray(window.cart)) window.cart = [];

class AddToCartButton extends Component {
  constructor(props) {
    super(props);
    if (!Array.isArray(window.cart)) window.cart = [];
    this.state = {
      quantity: window.cart.find((i) => i.id === this.props.id)
        ? window.cart.find((i) => i.id === this.props.id).quantity
        : 0,
      isEditing: false,
      editValue: "",
    };
  }

  componentDidMount() {
    this.cart = () => {
      if (!Array.isArray(window.cart)) window.cart = [];
      const item = window.cart.find((i) => i.id === this.props.id);
      const newQuantity = item ? item.quantity : 0;
      if (this.state.quantity !== newQuantity)
        this.setState({ quantity: newQuantity });
    };
    window.addEventListener("cart", this.cart);
  }

  componentWillUnmount() {
    window.removeEventListener("cart", this.cart);
  }

  handleIncrement = () => {
    if (!window.cart) window.cart = [];
    const idx = window.cart.findIndex((item) => item.id === this.props.id);
    if (idx === -1) {
      window.cart.push({
        id: this.props.id,
        name: this.props.name,
        seoName: this.props.seoName,
        pictureList: this.props.pictureList,
        price: this.props.price,
        quantity: 1,
        weight: this.props.weight,
        vat: this.props.vat,
        versandklasse: this.props.versandklasse,
        availableSupplier: this.props.availableSupplier,
        available: this.props.available
      });
    } else {
      window.cart[idx].quantity++;
    }
    window.dispatchEvent(new CustomEvent("cart"));
  };

  handleDecrement = () => {
    if (!window.cart) window.cart = [];
    const idx = window.cart.findIndex((item) => item.id === this.props.id);
    if (idx !== -1) {
      if (window.cart[idx].quantity > 1) {
        window.cart[idx].quantity--;
      } else {
        window.cart.splice(idx, 1);
      }
      window.dispatchEvent(new CustomEvent("cart"));
    }
  };

  handleClearCart = () => {
    if (!window.cart) window.cart = [];
    const idx = window.cart.findIndex((item) => item.id === this.props.id);
    if (idx !== -1) {
      window.cart.splice(idx, 1);
      window.dispatchEvent(new CustomEvent("cart"));
    }
  };

  handleEditStart = () => {
    this.setState({
      isEditing: true,
      editValue: this.state.quantity > 0 ? this.state.quantity.toString() : "",
    });
  };

  handleEditChange = (event) => {
    // Only allow numbers
    const value = event.target.value.replace(/[^0-9]/g, "");
    this.setState({ editValue: value });
  };

  handleEditComplete = () => {
    let newQuantity = parseInt(this.state.editValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0;
    }
    if (!window.cart) window.cart = [];
    const idx = window.cart.findIndex((item) => item.id === this.props.id);
    if (idx !== -1) {
      window.cart[idx].quantity = newQuantity;
      window.dispatchEvent(
        new CustomEvent("cart", {
          detail: { id: this.props.id, quantity: newQuantity },
        })
      );
    }
    this.setState({ isEditing: false });
  };

  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.handleEditComplete();
    }
  };

  toggleCart = () => {
    // Dispatch an event that Header.js can listen for to toggle the cart
    window.dispatchEvent(new CustomEvent("toggle-cart"));
  };

  render() {
    const { quantity, isEditing, editValue } = this.state;
    const { available, size, incoming, availableSupplier } = this.props;

    // Button is disabled if product is not available
    if (!available) {
      if (incoming) {
        return (
          <Button
            fullWidth
            variant="contained"
            size={size || "medium"}
            sx={{
              borderRadius: 2,
              fontWeight: "bold",
              backgroundColor: "#ffeb3b",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#fdd835",
              },
            }}
          >
            Ab{" "}
            {new Date(incoming).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>
        );
      }
      
      // If availableSupplier is 1, handle both quantity cases
      if (availableSupplier === 1) {
        // If no items in cart, show simple "Add to Cart" button with yellowish green
        if (quantity === 0) {
          return (
            <Button
              fullWidth
              variant="contained"
              size={size || "medium"}
              onClick={this.handleIncrement}
              startIcon={<ShoppingCartIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: "bold",
                backgroundColor: "#9ccc65", // yellowish green
                color: "#000000",
                "&:hover": {
                  backgroundColor: "#8bc34a",
                },
              }}
            >
              {this.props.steckling ? "Als Steckling vorbestellen" : "In den Korb"}
            </Button>
          );
        }
        
        // If items are in cart, show quantity controls with yellowish green
        if (quantity > 0) {
          return (
            <Box sx={{ width: "100%" }}>
              <ButtonGroup
                fullWidth
                variant="contained"
                color="primary"
                size={size || "medium"}
                sx={{
                  borderRadius: 2,
                  "& .MuiButtonGroup-grouped:not(:last-of-type)": {
                    borderRight: "1px solid rgba(255,255,255,0.3)",
                  },
                }}
              >
                <IconButton
                  color="inherit"
                  onClick={this.handleDecrement}
                  sx={{ width: "28px", borderRadius: 0, flexGrow: 1 }}
                >
                  <RemoveIcon />
                </IconButton>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    flexGrow: 2,
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={this.handleEditStart}
                >
                  {isEditing ? (
                    <TextField
                      autoFocus
                      value={editValue}
                      onChange={this.handleEditChange}
                      onBlur={this.handleEditComplete}
                      onKeyPress={this.handleKeyPress}
                      onFocus={(e) => e.target.select()}
                      size="small"
                      variant="standard"
                      inputProps={{
                        style: {
                          textAlign: "center",
                          width: "30px",
                          fontSize: "14px",
                          padding: "2px",
                          fontWeight: "bold",
                        },
                        "aria-label": "quantity",
                      }}
                      sx={{ my: -0.5 }}
                    />
                  ) : (
                    <Typography variant="button" sx={{ fontWeight: "bold" }}>
                      {quantity}
                    </Typography>
                  )}
                </Box>

                <IconButton
                  color="inherit"
                  onClick={this.handleIncrement}
                  sx={{ width: "28px", borderRadius: 0, flexGrow: 1 }}
                >
                  <AddIcon />
                </IconButton>

                <Tooltip title="Aus dem Warenkorb entfernen" arrow>
                  <IconButton
                    color="inherit"
                    onClick={this.handleClearCart}
                    sx={{
                      borderRadius: 0,
                      "&:hover": { color: "error.light" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                {this.props.cartButton && (
                  <Tooltip title="Warenkorb öffnen" arrow>
                    <IconButton
                      color="inherit"
                      onClick={this.toggleCart}
                      sx={{
                        borderRadius: 0,
                        "&:hover": { color: "primary.light" },
                      }}
                    >
                      <ShoppingCartIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ButtonGroup>
            </Box>
          );
        }
      }
      
      return (
        <Button
          disabled
          fullWidth
          variant="contained"
          size={size || "medium"}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
          }}
        >
          Out of Stock
        </Button>
      );
    }



    // If no items in cart, show simple "Add to Cart" button
    if (quantity === 0) {
      return (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size={size || "medium"}
          onClick={this.handleIncrement}
          startIcon={<ShoppingCartIcon />}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          {this.props.steckling ? "Als Steckling vorbestellen" : "In den Korb"}
        </Button>
      );
    }

    // If items are in cart, show quantity controls
    return (
      <Box sx={{ width: "100%" }}>
        <ButtonGroup
          fullWidth
          variant="contained"
          color="primary"
          size={size || "medium"}
          sx={{
            borderRadius: 2,
            "& .MuiButtonGroup-grouped:not(:last-of-type)": {
              borderRight: "1px solid rgba(255,255,255,0.3)",
            },
          }}
        >
          <IconButton
            color="inherit"
            onClick={this.handleDecrement}
            sx={{ width: "28px", borderRadius: 0, flexGrow: 1 }}
          >
            <RemoveIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              flexGrow: 2,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={this.handleEditStart}
          >
            {isEditing ? (
              <TextField
                autoFocus
                value={editValue}
                onChange={this.handleEditChange}
                onBlur={this.handleEditComplete}
                onKeyPress={this.handleKeyPress}
                onFocus={(e) => e.target.select()}
                size="small"
                variant="standard"
                inputProps={{
                  style: {
                    textAlign: "center",
                    width: "30px",
                    fontSize: "14px",
                    padding: "2px",
                    fontWeight: "bold",
                  },
                  "aria-label": "quantity",
                }}
                sx={{ my: -0.5 }}
              />
            ) : (
              <Typography variant="button" sx={{ fontWeight: "bold" }}>
                {quantity}
              </Typography>
            )}
          </Box>

          <IconButton
            color="inherit"
            onClick={this.handleIncrement}
            sx={{ width: "28px", borderRadius: 0, flexGrow: 1 }}
          >
            <AddIcon />
          </IconButton>

          <Tooltip title="Aus dem Warenkorb entfernen" arrow>
            <IconButton
              color="inherit"
              onClick={this.handleClearCart}
              sx={{
                borderRadius: 0,
                "&:hover": { color: "error.light" },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {this.props.cartButton && (
            <Tooltip title="Warenkorb öffnen" arrow>
              <IconButton
                color="inherit"
                onClick={this.toggleCart}
                sx={{
                  borderRadius: 0,
                  "&:hover": { color: "primary.light" },
                }}
              >
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </Box>
    );
  }
}

export default AddToCartButton;
