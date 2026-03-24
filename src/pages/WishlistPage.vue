<template>
  <div class="wishlist-wrapper">
    <div class="custom-container">
      <h1 class="page-header">My Wishlist</h1>

      <div v-if="!cartStore.wishlist || cartStore.wishlist.length === 0" class="empty-status">
        <p>Your wishlist is currently empty.</p>
        <router-link to="/" class="return-btn">Return to Shop</router-link>
      </div>

      <div v-else class="products-layout">
        <div v-for="product in cartStore.wishlist" :key="product.id" class="item-card">
          
          <div v-if="product.isSale" class="sale-tag">SALE</div>

          <div class="image-box">
            <img :src="product.image" :alt="product.name" />
          </div>
          
          <div class="item-details">
            <h3 class="item-title">{{ product.name }}</h3>
            
            <div class="price-section">
              <template v-if="product.isSale">
                <span class="item-price old-price">${{ product.price }}</span>
                <span class="item-price new-price">${{ product.currentPrice }}</span>
              </template>
              <template v-else>
                <p class="item-price">${{ product.price }}</p>
              </template>
            </div>
            
            <div class="action-buttons">
              <button 
                @click="cartStore.addToCart(product as any, product.isSale ? product.currentPrice : product.price)" 
                class="add-btn"
              >
                Add to Cart
              </button>
              <button @click="cartStore.addToWishlist(product)" class="delete-btn" title="Remove">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '../store/cart';

const cartStore = useCartStore();

onMounted(async (): Promise<void> => {
  await cartStore.validateCartPrices();
});
</script>

<style scoped>
.wishlist-wrapper { 
  padding: 40px 0; 
  min-height: 80vh; 
  background-color: var(--bg); 
}

.custom-container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 20px; 
}

.page-header { 
  font-size: 1.8rem; 
  font-weight: 800; 
  color: var(--dark); 
  margin-bottom: 30px; 
  border-bottom: 1px solid var(--border); 
  padding-bottom: 15px; 
}

.products-layout { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 30px; 
}

.item-card { 
  position: relative; 
  background: white; 
  border: 1px solid transparent; 
  border-radius: var(--radius); 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  transition: all 0.3s ease; 
  box-shadow: var(--shadow); 
}

.item-card:hover { 
  transform: translateY(-5px); 
  box-shadow: var(--shadow-hover); 
  border-color: var(--primary); 
}

.image-box { 
  width: 100%; 
  height: 200px; 
  padding: 20px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}

.image-box img { 
  max-width: 100%; 
  max-height: 100%; 
  object-fit: contain; 
}

.item-details { 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  flex-grow: 1; 
}

.item-title { 
  font-size: 1rem; 
  font-weight: 700; 
  color: var(--dark); 
  margin-bottom: 10px; 
  height: 40px; 
  overflow: hidden; 
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price { 
  font-size: 1.2rem; 
  font-weight: 800; 
  color: var(--primary); 
  margin-bottom: 20px; 
}

.action-buttons { 
  display: flex; 
  gap: 10px; 
  margin-top: auto; 
}

.add-btn { 
  flex: 2; 
  padding: 10px; 
  background: var(--dark); 
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  transition: 0.2s;
  cursor: pointer;
}

.add-btn:hover { 
  background: var(--primary); 
}

.delete-btn { 
  flex: 1; 
  padding: 10px; 
  background: white; 
  color: var(--danger); 
  border: 1px solid var(--border); 
  border-radius: 8px; 
  font-weight: 600; 
  transition: 0.2s;
  cursor: pointer;
}

.delete-btn:hover { 
  background: #fee2e2; 
  border-color: var(--danger); 
}

.empty-status { 
  text-align: center; 
  padding: 80px 0; 
}

.return-btn { 
  display: inline-block; 
  margin-top: 20px; 
  padding: 12px 25px; 
  background: var(--primary); 
  color: white; 
  border-radius: 8px; 
  font-weight: 600; 
  text-decoration: none; 
}

.price-section { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.old-price { 
  text-decoration: line-through; 
  color: #999; 
  font-size: 1rem; 
}

.new-price { 
  color: var(--danger); 
}

.sale-tag { 
  position: absolute; 
  top: 10px; 
  left: 10px; 
  background: var(--danger); 
  color: white; 
  padding: 4px 10px; 
  border-radius: 4px; 
  font-size: 0.75rem; 
  font-weight: bold; 
  z-index: 2; 
}
</style>