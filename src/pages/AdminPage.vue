<template>
  <div class="admin-page">
    <div class="container">
      <h1>Admin Dashboard</h1>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Products Tab -->
      <div v-if="activeTab === 'Products'" class="tab-content">
        <h2>Manage Products</h2>
        <button @click="showAddProduct = !showAddProduct" class="add-btn">
          {{ showAddProduct ? 'Cancel' : 'Add Product' }}
        </button>

        <form v-if="showAddProduct" @submit.prevent="addProduct" class="form">
          <div class="form-group">
            <label>Product Name:</label>
            <input v-model="newProduct.name" placeholder="Product Name" required />
          </div>
          <div class="form-group">
            <label>Price:</label>
            <input v-model.number="newProduct.price" type="number" placeholder="Price" required />
          </div>
          <div class="form-group">
            <label>Category:</label>
            <input v-model="newProduct.category" placeholder="Category" required />
          </div>
          <div class="form-group">
            <label>Brand:</label>
            <input v-model="newProduct.brand" placeholder="Brand" required />
          </div>
          <div class="form-group">
            <label>Image URL:</label>
            <input v-model="newProduct.image" placeholder="Image URL" required />
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea v-model="newProduct.description" placeholder="Description"></textarea>
          </div>
          <button type="submit" class="submit-btn">Add Product</button>
        </form>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>{{ product.id }}</td>
                <td>{{ product.name }}</td>
                <td>${{ product.price }}</td>
                <td>{{ product.category }}</td>
                <td>{{ product.brand }}</td>
                <td>
                  <button @click="deleteProduct(product.id)" class="delete-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Flash Sales Tab -->
      <div v-if="activeTab === 'Flash Sales'" class="tab-content">
        <h2>Manage Flash Sales</h2>
        <button @click="showAddFlash = !showAddFlash" class="add-btn">
          {{ showAddFlash ? 'Cancel' : 'Add Flash Sale' }}
        </button>

        <form v-if="showAddFlash" @submit.prevent="addFlashSale" class="form">
          <div class="form-group">
            <label>Select Product:</label>
            <select v-model.number="newFlash.productId" required @change="updateProductPrice">
              <option value="">Select Product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} - ${{ product.price }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="selectedProduct && selectedProduct.id">
            <label>Original Price:</label>
            <input type="text" :value="`$${selectedProduct.price}`" disabled class="original-price" />
          </div>

          <div class="form-group">
            <label>Discount Price:</label>
            <input 
              v-model.number="newFlash.discountPrice" 
              type="number" 
              placeholder="Enter discount price (must be less than original price)" 
              required 
              @input="validateDiscountPrice"
            />
            <span v-if="discountError" class="error-msg">{{ discountError }}</span>
          </div>

          <div class="form-group" v-if="newFlash.discountPrice && selectedProduct && selectedProduct.id && !discountError">
            <label>Discount Amount & Percent:</label>
            <input 
              type="text" 
              :value="`$${(selectedProduct.price - newFlash.discountPrice).toFixed(2)} OFF (${calculateDiscountPercent()}%)`" 
              disabled 
              class="discount-amount" 
            />
          </div>

          <div class="form-group">
            <label>Duration (hours):</label>
            <input v-model.number="newFlash.duration" type="number" placeholder="Duration (hours)" required min="1" />
          </div>

          <button type="submit" class="submit-btn" :disabled="!!discountError || !selectedProduct || !selectedProduct.id">Add Sale</button>
        </form>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Original Price</th>
                <th>Discount Price</th>
                <th>Discount %</th>
                <th>End Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in flashSales" :key="sale.id">
                <td class="product-name">{{ getProductName(sale.productId) }}</td>
                <td class="price">${{ getProductPrice(sale.productId) }}</td>
                <td class="discount-price">${{ sale.discountPrice }}</td>
                <td class="discount-percent">{{ calculateTableDiscountPercent(sale.productId, sale.discountPrice) }}%</td>
                <td>{{ formatDate(sale.endTime) }}</td>
                <td>
                  <button @click="deleteFlashSale(sale.id)" class="delete-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sliders Tab -->
      <div v-if="activeTab === 'Sliders'" class="tab-content">
        <h2>Manage Sliders</h2>
        <button @click="showAddSlide = !showAddSlide" class="add-btn">
          {{ showAddSlide ? 'Cancel' : 'Add Slider' }}
        </button>

        <form v-if="showAddSlide" @submit.prevent="addSlide" class="form">
          <div class="form-group">
            <label>Slide Title:</label>
            <input v-model="newSlide.title" placeholder="Slide Title" required />
          </div>
          <div class="form-group">
            <label>Image URL:</label>
            <input v-model="newSlide.image" placeholder="Image URL" required />
          </div>
          <div class="form-group">
            <label>Link (optional):</label>
            <input v-model="newSlide.link" placeholder="Link (optional)" />
          </div>
          <button type="submit" class="submit-btn">Add</button>
        </form>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Image</th>
                <th>Link</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slide in slides" :key="slide.id">
                <td>{{ slide.title }}</td>
                <td><img :src="slide.image" class="thumb" /></td>
                <td>{{ slide.link || '-' }}</td>
                <td>
                  <button @click="deleteSlide(slide.id)" class="delete-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  description?: string;
}

interface FlashSale {
  id: string | number;
  productId: string | number;
  discountPrice: number;
  endTime: number;
}

interface Slide {
  id: string | number;
  title: string;
  image: string;
  link?: string;
}

interface NewProduct {
  name: string;
  price: number | null;
  category: string;
  brand: string;
  image: string;
  description: string;
}

interface NewFlash {
  productId: number | null;
  discountPrice: number | null;
  duration: number | null;
}

interface NewSlide {
  title: string;
  image: string;
  link: string;
}

const activeTab = ref<string>('Products');
const tabs = ['Products', 'Flash Sales', 'Sliders'];

const products = ref<Product[]>([]);
const flashSales = ref<FlashSale[]>([]);
const slides = ref<Slide[]>([]);

const showAddProduct = ref<boolean>(false);
const showAddFlash = ref<boolean>(false);
const showAddSlide = ref<boolean>(false);

const selectedProduct = ref<Product | null>(null);
const discountError = ref<string>("");

const newProduct = ref<NewProduct>({
  name: '',
  price: null,
  category: '',
  brand: '',
  image: '',
  description: ''
});

const newFlash = ref<NewFlash>({
  productId: null,
  discountPrice: null,
  duration: null
});

const newSlide = ref<NewSlide>({
  title: '',
  image: '',
  link: ''
});

const loadData = async (): Promise<void> => {
  try {
    const [pRes, fRes, sRes] = await Promise.all([
      axios.get<Product[]>('http://localhost:3000/products'),
      axios.get<FlashSale[]>('http://localhost:3000/flashSale'),
      axios.get<Slide[]>('http://localhost:3000/slides')
    ]);
    products.value = pRes.data;
    flashSales.value = fRes.data;
    slides.value = sRes.data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const addProduct = async (): Promise<void> => {
  try {
    await axios.post('http://localhost:3000/products', newProduct.value);
    await loadData();
    showAddProduct.value = false;
    newProduct.value = {
      name: '',
      price: null,
      category: '',
      brand: '',
      image: '',
      description: ''
    };
    alert('محصول با موفقیت اضافه شد!');
  } catch (error) {
    console.error('Error adding product:', error);
    alert('خطا در افزودن محصول');
  }
};

const deleteProduct = async (id: string | number): Promise<void> => {
  if (!confirm('آیا مطمئن هستید؟')) return;
  try {
    await axios.delete(`http://localhost:3000/products/${id}`);
    await loadData();
    alert('محصول حذف شد!');
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

const updateProductPrice = (): void => {
  const productId = newFlash.value.productId;
  console.log('Selected Product ID:', productId);
  
  if (productId) {
    const found = products.value.find((p: Product) => Number(p.id) === Number(productId));
    console.log('Found Product:', found);
    selectedProduct.value = found || null;
  } else {
    selectedProduct.value = null;
  }
  
  newFlash.value.discountPrice = null;
  discountError.value = "";
};

const validateDiscountPrice = (): void => {
  if (!selectedProduct.value || !selectedProduct.value.id || !newFlash.value.discountPrice) {
    discountError.value = "";
    return;
  }

  const originalPrice = selectedProduct.value.price;
  const discountPrice = newFlash.value.discountPrice;

  if (discountPrice <= 0) {
    discountError.value = "❌ Discount price must be greater than $0";
    return;
  }

  if (discountPrice >= originalPrice) {
    discountError.value = `❌ Discount price must be less than $${originalPrice}`;
    return;
  }

  discountError.value = "";
};

const calculateDiscountPercent = (): number => {
  if (!selectedProduct.value || !selectedProduct.value.id || !newFlash.value.discountPrice) return 0;
  const originalPrice = selectedProduct.value.price;
  const discountPrice = newFlash.value.discountPrice;
  const percent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return Math.max(0, percent);
};

const getProductName = (productId: string | number): string => {
  const product = products.value.find((p: Product) => Number(p.id) === Number(productId));
  return product ? product.name : `Product #${productId}`;
};

const getProductPrice = (productId: string | number): number => {
  const product = products.value.find((p: Product) => Number(p.id) === Number(productId));
  return product ? product.price : 0;
};

const calculateTableDiscountPercent = (productId: string | number, discountPrice: number): number => {
  const originalPrice = getProductPrice(productId);
  if (originalPrice === 0 || originalPrice <= discountPrice) return 0;
  const percent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return Math.max(0, percent);
};

const addFlashSale = async (): Promise<void> => {
  if (!newFlash.value.productId || !newFlash.value.discountPrice || !newFlash.value.duration) {
    alert('لطفاً تمام فیلدها را پر کنید');
    return;
  }

  validateDiscountPrice();
  
  if (discountError.value) {
    alert(discountError.value);
    return;
  }

  try {
    const endTime = new Date().getTime() + (newFlash.value.duration * 3600000);
    await axios.post('http://localhost:3000/flashSale', {
      productId: newFlash.value.productId,
      discountPrice: newFlash.value.discountPrice,
      endTime: endTime
    });
    await loadData();
    showAddFlash.value = false;
    selectedProduct.value = null;
    discountError.value = "";
    newFlash.value = { productId: null, discountPrice: null, duration: null };
    alert('فلش سیل با موفقیت اضافه شد!');
  } catch (error) {
    console.error('Error adding flash sale:', error);
    alert('خطا در افزودن فلش سیل');
  }
};

const deleteFlashSale = async (id: string | number): Promise<void> => {
  if (!confirm('آیا مطمئن هستید؟')) return;
  try {
    await axios.delete(`http://localhost:3000/flashSale/${id}`);
    await loadData();
    alert('فلش سیل حذف شد!');
  } catch (error) {
    console.error('Error deleting flash sale:', error);
  }
};

const addSlide = async (): Promise<void> => {
  try {
    await axios.post('http://localhost:3000/slides', newSlide.value);
    await loadData();
    showAddSlide.value = false;
    newSlide.value = { title: '', image: '', link: '' };
    alert('اسلاید با موفقیت اضافه شد!');
  } catch (error) {
    console.error('Error adding slide:', error);
    alert('خطا در افزودن اسلاید');
  }
};

const deleteSlide = async (id: string | number): Promise<void> => {
  if (!confirm('آیا مطمئن هستید؟')) return;
  try {
    await axios.delete(`http://localhost:3000/slides/${id}`);
    await loadData();
    alert('اسلاید حذف شد!');
  } catch (error) {
    console.error('Error deleting slide:', error);
  }
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US');
};

onMounted((): void => {
  loadData();
});
</script>

<style scoped>
.admin-page {
  padding: 60px 0;
  min-height: 100vh;
  background: var(--bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  color: var(--dark);
  margin-bottom: 20px;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--border);
  flex-wrap: wrap;
}

.tabs button {
  padding: 12px 20px;
  background: none;
  border: none;
  color: var(--light);
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.tabs button:hover {
  color: var(--primary);
}

.tabs button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: var(--shadow);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.add-btn {
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.form {
  background: #f9fafb;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid var(--border);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--dark);
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Poppins', inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

.form-group input[disabled],
.original-price,
.discount-amount {
  background: #e5e7eb !important;
  color: var(--dark);
  font-weight: 600;
  border: 1px solid var(--border) !important;
  cursor: not-allowed;
}

.original-price {
  color: var(--danger) !important;
  font-size: 1.05rem;
}

.discount-amount {
  color: var(--secondary) !important;
  font-size: 1.05rem;
}

.error-msg {
  color: var(--danger);
  font-weight: 600;
  font-size: 0.85rem;
  display: block;
  margin-top: 5px;
}

.submit-btn {
  padding: 12px 24px;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.submit-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #999;
}

.submit-btn:disabled:hover {
  background: #999;
  transform: none;
  box-shadow: none;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 700;
  font-size: 0.95rem;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

tbody tr {
  transition: all 0.3s ease;
}

tbody tr:hover {
  background: #f9fafb;
  transform: scale(1.01);
}

tbody tr:last-child td {
  border-bottom: none;
}

.product-name {
  font-weight: 600;
  color: var(--dark);
}

.price {
  font-weight: 600;
  color: var(--dark);
}

.discount-price {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--primary);
}

.discount-percent {
  font-weight: 700;
  color: var(--secondary);
  font-size: 1.05rem;
}

.delete-btn {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.delete-btn:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
}

.thumb {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid var(--border);
  padding: 3px;
  background: white;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .tabs {
    gap: 5px;
    margin-bottom: 20px;
  }

  .tabs button {
    padding: 10px 15px;
    font-size: 0.85rem;
  }

  .tab-content {
    padding: 20px;
  }

  .form {
    padding: 15px;
  }

  .table-wrapper {
    font-size: 0.8rem;
  }

  th, td {
    padding: 10px;
    font-size: 0.85rem;
  }

  .thumb {
    width: 40px;
    height: 40px;
  }
}
</style>