<template>
  <div class="about-page">
    <div class="container">
      <h1>About Our Store</h1>
      <p>Welcome to our online store! We are dedicated to providing the best products and services.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple About Page - no data needed
</script>

<style scoped>
.about-page {
  padding: 60px 0;
  min-height: 80vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 20px;
}

p {
  font-size: 1.1rem;
  color: var(--light);
  line-height: 1.8;
}
</style>