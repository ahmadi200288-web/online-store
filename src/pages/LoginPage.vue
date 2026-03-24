<template>
  <div class="auth-page">
    <h1>Login</h1>

    <form @submit.prevent="handleLogin">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div>
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from "axios";
import { useRouter } from 'vue-router';
import { useUserStore } from "../store/user.ts";
import { useCartStore } from "../store/cart.ts";

interface LoginResponse {
  id: string | number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const email = ref<string>("");
const password = ref<string>("");

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const handleLogin = async (): Promise<void> => {
  try {
    const res = await axios.get<LoginResponse[]>("http://localhost:3000/users", {
      params: { email: email.value, password: password.value }
    });

    if (res.data.length === 0) {
      alert("ایمیل یا رمز عبور اشتباه است");
      return;
    }

    const user: LoginResponse = res.data[0];
    userStore.login(user as any);
    await cartStore.loadUserCart();
    router.push("/");
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("خطا در ورود:", axiosError);
    alert("ارتباط با سرور برقرار نشد");
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  flex-direction: column;
}

h1 { 
  margin-bottom: 30px; 
  color: var(--dark); 
  font-weight: 800; 
}

form {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-hover);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f9fafb;
  outline: none;
  transition: 0.3s;
}

input:focus { 
  border-color: var(--primary); 
  background: white; 
}

button {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  transition: 0.3s;
  cursor: pointer;
}

button:hover { 
  background: var(--primary-dark); 
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); 
}
</style>