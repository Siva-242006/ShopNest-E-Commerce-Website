import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUserDetails } from "./UserContext";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { userId } = useUserDetails();

  const fetchCart = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiUrl}/cart/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      const items = data.items || [];

      setCartItems(items);
      setCartCount(items.length);
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  }, [userId]);

  const clearCart = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${apiUrl}/cart/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear cart");

      setCartItems([]);
      setCartCount(0);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        setCartCount,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
