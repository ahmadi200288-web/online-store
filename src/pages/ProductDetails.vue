<template>
  <div class="product-details">
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="product" class="container">
      <div class="breadcrumb">
        <router-link to="/">Home</router-link>
        <span> / </span>
        <router-link :to="`/products/${product.category}/all`">{{ product.category }}</router-link>
        <span> / </span>
        <span>{{ product.name }}</span>
      </div>

      <div class="product-grid">
        <!-- Product Image -->
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div v-if="product.flashInfo" class="flash-badge">
            SALE | {{ product.flashInfo.timeLeft }}
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h1>{{ product.name }}</h1>

          <div class="meta-info">
            <span class="brand">Brand: {{ product.brand }}</span>
            <span class="category">Category: {{ product.category }}</span>
          </div>

          <div class="rating">
            <span class="stars">★★★★★</span>
            <span class="reviews">(125 reviews)</span>
          </div>

          <!-- Price Section -->
          <div class="price-section">
            <template v-if="product.flashInfo">
              <span class="original-price">${{ product.price }}</span>
              <span class="sale-price">${{ product.flashInfo.discountPrice }}</span>
              <span class="discount-percent">
                -{{ calculateDiscount() }}%
              </span>
            </template>
            <template v-else>
              <span class="sale-price">${{ product.price }}</span>
            </template>
          </div>

          <!-- Description -->
          <div class="description">
            <p>{{ product.description || 'No description available' }}</p>
          </div>

          <!-- Quantity Selector -->
          <div class="quantity-selector">
            <label>Quantity:</label>
            <div class="qty-control">
              <button @click="decreaseQuantity">−</button>
              <input v-model.number="quantity" type="number" min="1" />
              <button @click="increaseQuantity">+</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="actions">
            <button class="add-to-cart-btn" @click="handleAddToCart">
              🛒 Add to Cart
            </button>
            <button class="wishlist-btn" @click="toggleWishlist">
              {{ isInWishlist ? '❤️' : '🤍' }} Wishlist
            </button>
          </div>

          <!-- Stock Status -->
          <div class="stock-status">
            <span v-if="inStock" class="in-stock">✓ In Stock</span>
            <span v-else class="out-of-stock">✗ Out of Stock</span>
          </div>

          <!-- Shipping Info -->
          <div class="shipping-info">
            <p>📦 Free shipping on orders over $50</p>
            <p>🔄 Easy returns within 30 days</p>
            <p>✓ Authentic product guaranteed</p>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="related-products">
        <h2>Related Products</h2>
        <div class="related-grid">
          <div v-for="item in relatedProducts" :key="item.id" class="related-card">
            <img :src="item.image" :alt="item.name" @click="$router.push('/product/' + item.id)" />
            <h4 @click="$router.push('/product/' + item.id)">{{ item.name }}</h4>
            <span class="price">${{ item.price }}</span>
            <button @click="addRelatedToCart(item)" class="add-btn">Add</button>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="not-found">
      <p>Product not found</p>
      <router-link to="/" class="home-link">Return to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useCartStore } from '../store/cart.ts';

interface FlashInfo {
  id: string | number;
  productId: string | number;
  discountPrice: number;
  endTime: number;
  timeLeft?: string;
}

interface Product {
  id: string | number;
  name: string;
  image: string;
  price: number;
  category: string;
  brand: string;
  description?: string;
  flashInfo?: FlashInfo | null;
  [key: string]: any;
}

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  priceAtPurchase?: number;
  [key: string]: any;
}

interface FlashSale {
  id: string | number;
  productId: string | number;
  discountPrice: number;
  endTime: number;
  timeLeft?: string;
}

const route = useRoute();
const cartStore = useCartStore();

const product = ref<Product | null>(null);
const relatedProducts = ref<Product[]>([]);
const flashSales = ref<FlashSale[]>([]);
const loading = ref<boolean>(true);
const quantity = ref<number>(1);
const inStock = ref<boolean>(true);

const productId = computed(() => route.params.id);

const isInWishlist = computed((): boolean => {
  if (!product.value) return false;
  return cartStore.isInWishlist(product.value.id);
});

const calculateDiscount = (): number => {
  if (!product.value || !product.value.flashInfo) return 0;
  const discount = Math.round(
    ((product.value.price - product.value.flashInfo.discountPrice) / product.value.price) * 100
  );
  return Math.max(0, discount);
};

const loadProduct = async (): Promise<void> => {
  loading.value = true;
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get<Product>(`http://localhost:3000/products/${productId.value}`),
      axios.get<FlashSale[]>('http://localhost:3000/flashSale')
    ]);

    product.value = pRes.data;
    flashSales.value = fRes.data;

    // Attach flash info
    if (product.value) {
      const flash = flashSales.value.find(
        (f: FlashSale) => String(f.productId) === String(product.value!.id)
      );
      if (flash) {
        const now = new Date().getTime();
        if (flash.endTime > now) {
          product.value.flashInfo = flash;
          updateFlashTime();
        }
      }
    }

    // Load related products
    if (product.value) {
      const allProducts = await axios.get<Product[]>('http://localhost:3000/products');
      relatedProducts.value = allProducts.data
        .filter((p: Product) => p.category === product.value!.category && p.id !== product.value!.id)
        .slice(0, 4);
    }
  } catch (error) {
    console.error('Error loading product:', error);
    product.value = null;
  } finally {
    loading.value = false;
  }
};

const updateFlashTime = (): void => {
  const timer = setInterval((): void => {
    if (!product.value || !product.value.flashInfo) {
      clearInterval(timer);
      return;
    }

    const now = new Date().getTime();
    const dist = product.value.flashInfo.endTime - now;

    if (dist < 0) {
      product.value.flashInfo = null;
      clearInterval(timer);
      return;
    }

    const h = Math.floor(dist / 3600000);
    const m = Math.floor((dist % 3600000) / 60000);
    const s = Math.floor((dist % 60000) / 1000);
    product.value.flashInfo.timeLeft = `${h}:${m}:${s}`;
  }, 1000);
};

const increaseQuantity = (): void => {
  quantity.value++;
};

const decreaseQuantity = (): void => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = (): void => {
  if (!product.value) {
    alert('محصول یافت نشد');
    return;
  }

  const now = new Date().getTime();
  const isValidSale = product.value.flashInfo && product.value.flashInfo.endTime > now;
  const finalPrice = isValidSale ? product.value.flashInfo!.discountPrice : product.value.price;

  const cartItem: CartItem = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    quantity: quantity.value,
    priceAtPurchase: finalPrice
  };

  cartStore.addToCart(cartItem, finalPrice);
  alert(`${quantity.value} × ${product.value.name} به سبد خرید اضافه شد!`);
  quantity.value = 1;
};

const toggleWishlist = (): void => {
  if (!product.value) return;
  cartStore.addToWishlist({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    category: product.value.category,
    brand: product.value.brand
  });
  alert(isInWishlist.value ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد');
};

const addRelatedToCart = (item: Product): void => {
  const cartItem: CartItem = {
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: 1,
    priceAtPurchase: item.price
  };

  cartStore.addToCart(cartItem, item.price);
  alert(`${item.name} به سبد خرید اضافه شد!`);
};

onMounted((): void => {
  loadProduct();
});
</script>

<style scoped>
.product-details {
  padding: 40px 5%;
  min-height: 80vh;
}

.loading, .not-found {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.2rem;
  color: var(--light);
}

.home-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
}

.breadcrumb {
  font-size: 0.9rem;
  color: var(--light);
  margin-bottom: 30px;
}

.breadcrumb a {
  color: var(--primary);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  margin-bottom: 60px;
}

.product-image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border-radius: 12px;
  padding: 30px;
  min-height: 400px;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.flash-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--danger);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.product-info h1 {
  font-size: 2.2rem;
  color: var(--dark);
  margin-bottom: 15px;
  font-weight: 800;
}

.meta-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: var(--light);
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
}

.stars {
  font-size: 1.2rem;
  color: #ffc107;
}

.reviews {
  color: var(--light);
  font-size: 0.9rem;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: var(--bg);
  border-radius: 8px;
}

.original-price {
  text-decoration: line-through;
  color: var(--light);
  font-size: 1.1rem;
}

.sale-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.discount-percent {
  background: var(--danger);
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
}

.description {
  margin-bottom: 30px;
  line-height: 1.8;
  color: var(--light);
}

.quantity-selector {
  margin-bottom: 30px;
}

.quantity-selector label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--dark);
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
}

.qty-control button {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  font-weight: 700;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.qty-control button:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.qty-control input {
  width: 60px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 14px 25px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.wishlist-btn {
  padding: 14px 25px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wishlist-btn:hover {
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.stock-status {
  margin-bottom: 25px;
  font-weight: 600;
}

.in-stock {
  color: var(--secondary);
}

.out-of-stock {
  color: var(--danger);
}

.shipping-info {
  padding: 20px;
  background: var(--bg);
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.shipping-info p {
  margin: 8px 0;
  color: var(--dark);
  font-size: 0.95rem;
}

/* Related Products */
.related-products {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid var(--border);
}

.related-products h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: var(--dark);
  font-weight: 800;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.related-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.related-card img {
  width: 100%;
  height: 140px;
  object-fit: contain;
  margin-bottom: 10px;
}

.related-card h4 {
  font-size: 0.9rem;
  color: var(--dark);
  margin-bottom: 8px;
  font-weight: 700;
}

.related-card .price {
  display: block;
  color: var(--primary);
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.related-card .add-btn {
  width: 100%;
  padding: 8px;
  background: var(--dark);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.related-card .add-btn:hover {
  background: var(--primary);
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .product-info h1 {
    font-size: 1.6rem;
  }

  .sale-price {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>