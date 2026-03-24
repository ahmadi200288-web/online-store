import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase?: number;
  image?: string;
  [key: string]: any;
}

interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  currentPrice?: number;
  isSale?: boolean;
  image?: string;
  [key: string]: any;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
}

interface CartData {
  id: string;
  userId: string;
  items: CartItem[];
  wishlist: WishlistItem[];
}

interface FlashSaleItem {
  id: string | number;
  productId: string | number;
  discountPrice: number;
  endTime: number;
}

export const useCartStore = defineStore("cart", {
  state: (): CartState => ({
    items: JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[],
    wishlist: JSON.parse(localStorage.getItem("wishlist") || "[]") as WishlistItem[]
  }),
  
  getters: {
    totalPrice: (state): number => {
      return state.items.reduce((sum, item) => {
        const price = item.priceAtPurchase || item.price;
        return sum + price * (item.quantity || 1);
      }, 0);
    },
    cartCount: (state): number => state.items.length,
    wishlistCount: (state): number => state.wishlist.length
  },
  
  actions: {
    addToCart(product: CartItem, customPrice: number | null = null): void {
      const existingItem = this.items.find(item => item.id === product.id);
      const priceToUse = customPrice !== null ? customPrice : product.price;

      if (existingItem) {
        existingItem.quantity++;
        existingItem.priceAtPurchase = priceToUse;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          priceAtPurchase: priceToUse
        });
      }
      this.save();
    },

    removeFromCart(productId: string | number): void {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
    },

    clearCart(): void {
      this.items = [];
      this.wishlist = [];
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
    },

    addToWishlist(product: WishlistItem): void {
      if (!product) return;
      const index = this.wishlist.findIndex(p => p.id === product.id);
      if (index === -1) {
        this.wishlist.push(product);
      } else {
        this.wishlist.splice(index, 1);
      }
      this.save();
    },

    isInWishlist(productId: string | number): boolean {
      return this.wishlist.some(p => String(p.id) === String(productId));
    },

    async loadUserCart(): Promise<void> {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = String(user.id);

      try {
        const res = await axios.get(`http://localhost:3000/carts/${userId}`);
        if (res.data) {
          this.items = res.data.items || [];
          this.wishlist = res.data.wishlist || [];
          localStorage.setItem("cart", JSON.stringify(this.items));
          localStorage.setItem("wishlist", JSON.stringify(this.wishlist));
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status !== 404) {
          console.error("Error loading cart:", error);
        }
      }
    },

    async validateCartPrices(): Promise<void> {
      try {
        const res = await axios.get("http://localhost:3000/flashSale");
        const pRes = await axios.get("http://localhost:3000/products");
        const flashSales: FlashSaleItem[] = res.data;
        const allProducts: any[] = pRes.data;
        const now = new Date().getTime();
        let hasChanged = false;

        this.items.forEach(item => {
          const sale = flashSales.find(f => String(f.productId) === String(item.id));
          const isSaleValid = sale && sale.endTime > now;
          if (isSaleValid) {
            if (item.priceAtPurchase !== sale.discountPrice) {
              item.priceAtPurchase = sale.discountPrice;
              hasChanged = true;
            }
          } else {
            if (item.priceAtPurchase !== item.price) {
              item.priceAtPurchase = item.price;
              hasChanged = true;
            }
          }
        });

        this.wishlist.forEach(wishItem => {
          const sale = flashSales.find(f => String(f.productId) === String(wishItem.id));
          const originalProduct = allProducts.find(p => String(p.id) === String(wishItem.id));
          const isSaleValid = sale && sale.endTime > now;

          if (isSaleValid) {
            if (wishItem.currentPrice !== sale.discountPrice) {
              wishItem.currentPrice = sale.discountPrice;
              wishItem.isSale = true;
              hasChanged = true;
            }
          } else if (originalProduct) {
            if (wishItem.currentPrice !== originalProduct.price) {
              wishItem.currentPrice = originalProduct.price;
              wishItem.isSale = false;
              hasChanged = true;
            }
          }
        });

        if (hasChanged) {
          this.save();
        }
      } catch (error) {
        console.error("Price validation error:", error);
      }
    },

    async save(): Promise<void> {
      localStorage.setItem("cart", JSON.stringify(this.items));
      localStorage.setItem("wishlist", JSON.stringify(this.wishlist));

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = String(user.id);

      const cartData: CartData = {
        id: userId,
        userId: userId,
        items: this.items,
        wishlist: this.wishlist
      };

      try {
        await axios.put(`http://localhost:3000/carts/${userId}`, cartData);
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 404) {
          await axios.post(`http://localhost:3000/carts`, cartData);
        }
      }
    }
  }
});