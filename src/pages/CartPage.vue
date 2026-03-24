<template>
  <div class="cart-page">
    <div class="container">
      <h1>Your Shopping Cart</h1>
      
      <div v-if="cartStore.items.length === 0" class="empty">
        <p>Your cart is empty!</p>
        <button @click="$router.push('/')">Go Shopping</button>
      </div>
      <div v-else>
        <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
          <img :src="item.image" />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>Quantity: {{ item.quantity }}</p>
            <p style="font-size: 0.8rem; color: #888;">Unit Price: ${{ item.priceAtPurchase || item.price }}</p>
          </div>
          <div class="item-price">${{ (item.priceAtPurchase || item.price) * item.quantity }}</div>
          <button @click="cartStore.removeFromCart(item.id)" class="remove">Remove</button>
        </div>
        <div class="total-section">
          <h2>Total: ${{ cartStore.totalPrice }}</h2>
          <button class="checkout-btn">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '../store/cart.ts';

const cartStore = useCartStore();

onMounted(async (): Promise<void> => {
  await cartStore.validateCartPrices();
});
</script>

<style scoped>
.cart-page { padding: 60px 0; }
.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

h1 { 
  font-size: 2rem; 
  font-weight: 800; 
  color: var(--dark); 
  margin-bottom: 30px; 
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
  border: 1px solid transparent;
  transition: 0.2s;
}

.cart-item:hover { 
  border-color: var(--primary); 
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background: #f9fafb;
  padding: 5px;
}

.item-info { 
  flex: 1; 
}

.item-info h3 { 
  margin: 0 0 5px 0; 
  font-size: 1.1rem; 
  color: var(--dark); 
}

.item-info p { 
  margin: 0; 
  font-size: 0.9rem; 
  color: var(--light); 
}

.item-price { 
  font-weight: 700; 
  font-size: 1.1rem; 
  color: var(--primary); 
  text-align: right; 
  min-width: 80px; 
}

.remove {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: 0.2s;
  margin-left: 15px;
}

.remove:hover { 
  background: var(--danger); 
  color: white; 
}

.total-section {
  margin-top: 40px;
  background: white;
  padding: 30px;
  border-radius: 16px;
  text-align: right;
  box-shadow: var(--shadow);
}

.total-section h2 { 
  margin-bottom: 20px; 
  color: var(--dark); 
}

.checkout-btn {
  padding: 12px 30px;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  transition: 0.3s;
  cursor: pointer;
}

.checkout-btn:hover { 
  background: #059669; 
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); 
}

.empty { 
  text-align: center; 
  padding: 80px 0; 
  color: var(--light); 
}

.empty button { 
  margin-top: 20px; 
  padding: 10px 25px; 
  background: var(--primary); 
  color: white; 
  border: none; 
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 600px) {
  .cart-item { 
    flex-direction: column; 
    text-align: center; 
  }
  .remove { 
    width: 100%; 
    margin: 10px 0 0 0; 
  }
  .total-section { 
    text-align: center; 
  }
  .checkout-btn { 
    width: 100%; 
  }
}
</style>