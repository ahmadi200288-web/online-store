<template>
  <div id="app">
    <SiteHeader />
    <main class="main-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --danger: #ef4444;
  --dark: #1f2937;
  --light: #6b7280;
  --bg: #f3f4f6;
  --border: #e5e7eb;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.1);
  --radius: 12px;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--bg);
  color: var(--dark);
  letter-spacing: 0.3px;
  line-height: 1.6;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: 'Poppins', inherit;
  letter-spacing: 0.3px;
}

input, textarea, select {
  font-family: 'Poppins', inherit;
  letter-spacing: 0.3px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', inherit;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>