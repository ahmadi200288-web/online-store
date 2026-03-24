<template>
  <div class="home-page">
    <!-- Hero Slider -->
    <section class="hero-slider">
      <div class="slider-container">
        <div v-for="(slide, index) in slides" :key="slide.id" :class="['slide', { active: index === currentSlide }]">
          <img :src="slide.image" :alt="slide.title" />
          <div class="slide-content">
            <h1>{{ slide.title }}</h1>
            <a v-if="slide.link" :href="slide.link" class="cta-btn">Shop Now</a>
          </div>
        </div>
        <button @click="prevSlide" class="nav-btn prev">❮</button>
        <button @click="nextSlide" class="nav-btn next">❯</button>
      </div>
    </section>

    <!-- Flash Sales Section -->
    <section v-if="flashSaleProducts.length > 0" class="flash-sales">
      <h2>Flash Sales</h2>
      <div class="flash-grid">
        <div v-for="product in flashSaleProducts" :key="product.id" class="flash-card">
          <div class="time-badge">⏱ {{ product.flashInfo?.timeLeft }}</div>
          
          <button class="wishlist-btn-flash" @click.stop="toggleFlashWishlist(product)">
            {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
          </button>

          <img :src="product.image" :alt="product.name" @click="$router.push('/product/' + product.id)" />
          <div class="flash-info">
            <h3>{{ product.name }}</h3>
            <div class="prices">
              <span class="old-price">${{ product.price }}</span>
              <span class="sale-price">${{ product.flashInfo?.discountPrice }}</span>
            </div>
            <button @click="addFlashToCart(product)" class="buy-btn">Buy Now</button>
          </div>
        </div>
      </div>
    </section>

    <!-- New Arrival Products -->
    <section class="new-arrivals">
      <h2>New Arrivals</h2>
      <div class="products-grid">
        <div v-for="product in newArrivalProducts" :key="product.id" class="product-card">
          <button class="wishlist-btn" @click.stop="toggleNewArrivalWishlist(product)">
            {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
          </button>
          <img :src="product.image" :alt="product.name" @click="$router.push('/product/' + product.id)" />
          <h3 @click="$router.push('/product/' + product.id)">{{ product.name }}</h3>
          <p class="brand">{{ product.brand }}</p>
          <span class="price">${{ product.price }}</span>
          <button @click="addProductToCart(product)" class="add-btn">Add to Cart</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useCartStore } from '../store/cart.ts';

interface Slide {
  id: string | number;
  title: string;
  image: string;
  link?: string;
}

interface FlashInfo {
  id?: string | number;
  productId?: string | number;
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
  [key: string]: any;
}

interface FlashSaleProduct extends Product {
  flashInfo: FlashInfo;
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

const cartStore = useCartStore();
const slides = ref<Slide[]>([]);
const allProducts = ref<Product[]>([]);
const flashSales = ref<FlashSale[]>([]);
const currentSlide = ref<number>(0);
let sliderTimer: ReturnType<typeof setInterval> | null = null;
let flashTimer: ReturnType<typeof setInterval> | null = null;

const flashSaleProducts = computed((): FlashSaleProduct[] => {
  const now = new Date().getTime();
  const result: FlashSaleProduct[] = [];

  allProducts.value.forEach((p: Product) => {
    const flash = flashSales.value.find((f: FlashSale) => String(f.productId) === String(p.id));
    if (flash && flash.endTime > now) {
      result.push({
        ...p,
        flashInfo: {
          id: flash.id,
          productId: flash.productId,
          discountPrice: flash.discountPrice,
          endTime: flash.endTime,
          timeLeft: flash.timeLeft || '0:0:0'
        }
      } as FlashSaleProduct);
    }
  });

  return result;
});

const newArrivalProducts = computed((): Product[] => {
  return allProducts.value.slice(0, 4);
});

const isInWishlist = (productId: string | number): boolean => {
  return cartStore.isInWishlist(productId);
};

const toggleFlashWishlist = (product: FlashSaleProduct): void => {
  const wishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    brand: product.brand
  };
  cartStore.addToWishlist(wishlistItem);
};

const toggleNewArrivalWishlist = (product: Product): void => {
  const wishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    brand: product.brand
  };
  cartStore.addToWishlist(wishlistItem);
};

const loadData = async (): Promise<void> => {
  try {
    const [sRes, pRes, fRes] = await Promise.all([
      axios.get<Slide[]>('http://localhost:3000/slides'),
      axios.get<Product[]>('http://localhost:3000/products'),
      axios.get<FlashSale[]>('http://localhost:3000/flashSale')
    ]);
    slides.value = sRes.data;
    allProducts.value = pRes.data;
    flashSales.value = fRes.data;
    startFlashTimer();
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const addFlashToCart = (product: FlashSaleProduct): void => {
  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    priceAtPurchase: product.flashInfo.discountPrice
  };

  cartStore.addToCart(cartItem, product.flashInfo.discountPrice);
  alert(`${product.name} به سبد خرید اضافه شد!`);
};

const addProductToCart = (product: Product): void => {
  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    priceAtPurchase: product.price
  };

  cartStore.addToCart(cartItem, product.price);
  alert(`${product.name} به سبد خرید اضافه شد!`);
};

const nextSlide = (): void => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = (): void => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

const startSliderTimer = (): void => {
  if (sliderTimer) clearInterval(sliderTimer);
  sliderTimer = setInterval((): void => {
    nextSlide();
  }, 5000);
};

const startFlashTimer = (): void => {
  if (flashTimer) clearInterval(flashTimer);
  flashTimer = setInterval((): void => {
    const now = new Date().getTime();
    flashSales.value = flashSales.value.map((sale: FlashSale) => {
      const dist = sale.endTime - now;
      if (dist > 0) {
        const h = Math.floor(dist / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        sale.timeLeft = `${h}:${m}:${s}`;
      }
      return sale;
    });
  }, 1000);
};

onMounted((): void => {
  loadData();
  startSliderTimer();
});

onUnmounted((): void => {
  if (sliderTimer) clearInterval(sliderTimer);
  if (flashTimer) clearInterval(flashTimer);
});
</script>

<style scoped>
.home-page {
  width: 100%;
}

/* Hero Slider */
.hero-slider {
  width: 100%;
  height: 500px;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  margin-bottom: 50px;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.slide.active {
  opacity: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  color: white;
  max-width: 500px;
  z-index: 2;
}

.slide-content h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
}

.cta-btn {
  display: inline-block;
  padding: 12px 30px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 3;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-btn.prev {
  left: 20px;
}

.nav-btn.next {
  right: 20px;
}

/* Flash Sales */
.flash-sales {
  padding: 40px 5%;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  margin-bottom: 50px;
}

.flash-sales h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: var(--dark);
  font-weight: 800;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 5%;
}

.flash-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
}

.flash-card {
  flex: 1 1 calc(25% - 15px);
  min-width: 180px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.flash-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

.time-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--danger);
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 2;
}

.wishlist-btn-flash {
  position: absolute;
  top: 10px;
  left: 10px;
  border: 1px solid var(--border);
  background: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0;
}

.wishlist-btn-flash:hover {
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.flash-card img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  cursor: pointer;
  padding: 10px;
  background: var(--bg);
}

.flash-info {
  padding: 15px;
}

.flash-info h3 {
  font-size: 0.95rem;
  margin-bottom: 8px;
  color: var(--dark);
  font-weight: 700;
}

.prices {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.old-price {
  text-decoration: line-through;
  color: var(--light);
  font-size: 0.9rem;
}

.sale-price {
  color: var(--danger);
  font-weight: 700;
  font-size: 1.1rem;
}

.buy-btn {
  width: 100%;
  padding: 8px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.buy-btn:hover {
  background: var(--primary-dark);
}

/* New Arrivals */
.new-arrivals {
  padding: 40px 5%;
}

.new-arrivals h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: var(--dark);
  font-weight: 800;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

.product-card {
  flex: 1 1 calc(25% - 19px);
  min-width: 180px;
  background: white;
  border-radius: 12px;
  padding: 15px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  text-align: center;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 1px solid var(--border);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0;
}

.wishlist-btn:hover {
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  cursor: pointer;
  margin-bottom: 10px;
}

.product-card h3 {
  font-size: 0.95rem;
  margin: 0 0 5px 0;
  color: var(--dark);
  font-weight: 700;
  cursor: pointer;
}

.brand {
  font-size: 0.8rem;
  color: var(--light);
  margin-bottom: 8px;
}

.price {
  display: block;
  font-size: 1.2rem;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 10px;
}

.add-btn {
  width: 100%;
  padding: 10px;
  background: var(--dark);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: var(--primary);
}

@media (max-width: 1200px) {
  .flash-card {
    flex: 1 1 calc(33.333% - 14px);
  }
  .product-card {
    flex: 1 1 calc(33.333% - 17px);
  }
}

@media (max-width: 768px) {
  .flash-card {
    flex: 1 1 calc(50% - 10px);
  }
  .product-card {
    flex: 1 1 calc(50% - 12.5px);
  }

  .slide-content h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .flash-card {
    flex: 1 1 100%;
  }
  .product-card {
    flex: 1 1 100%;
  }
}
</style>