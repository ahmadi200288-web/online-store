<template>
  <div class="contact-page">
    <div class="container">
      <h1>Contact Us</h1>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Name:</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div>
          <label>Email:</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div>
          <label>Message:</label>
          <textarea v-model="form.message" required></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const form = ref<ContactForm>({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = (): void => {
  alert('Thank you for contacting us!');
  form.value = { name: '', email: '', message: '' };
};
</script>

<style scoped>
.contact-page {
  padding: 60px 0;
  min-height: 80vh;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 30px;
  text-align: center;
}

form {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: var(--shadow);
}

div {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

input:focus,
textarea:focus {
  border-color: var(--primary);
  background: white;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

button {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
</style>