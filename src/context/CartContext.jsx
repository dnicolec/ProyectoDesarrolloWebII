/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Agregar item al carrito
  const addToCart = (offer, quantity) => {
    setCart((prevCart) => {
      // Verificar si la oferta ya existe en el carrito
      const existingItem = prevCart.find((item) => item.id === offer.id);

      if (existingItem) {
        // Si existe, sumar la cantidad
        return prevCart.map((item) =>
          item.id === offer.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        return [...prevCart, { ...offer, quantity }];
      }
    });
  };

  // Remover item del carrito
  const removeFromCart = (offerId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== offerId));
  };

  // Actualizar cantidad de un item
  const updateQuantity = (offerId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(offerId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === offerId ? { ...item, quantity } : item
      )
    );
  };

  // Obtener cantidad total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Obtener total a pagar
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const costo = item.costo_cupon || 0;
      return total + costo * item.quantity;
    }, 0);
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
