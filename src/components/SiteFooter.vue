<template>
  <footer class="site-footer">
    <div class="footer-content">
      <router-link to="/about" class="link">About Us</router-link>
      <router-link to="/contact" class="link">Contact Us</router-link>
      
      <a href="https://www.google.com/maps?q=40.7128,-74.0060" target="_blank" class="map-link" title="Visit our Store">
        <img src="/images/4.jpg" alt="Map" class="map-icon" />
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Simple Footer Component - no logic needed
</script>

<style scoped>
.site-footer {
  background: rgba(230, 226, 226, 0.95);
  border-top: 1px solid var(--border);
  padding: 40px 20px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.link {
  color: black;
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  padding-bottom: 2px;
  text-decoration: none;
}

.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s;
}

.link:hover { color: var(--primary); }
.link:hover::after { width: 100%; }

.map-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  padding: 2px;
  transition: transform 0.3s, border-color 0.3s;
  display: block;
}

.map-icon:hover {
  transform: scale(1.15) rotate(5deg);
  border-color: var(--primary);
}
</style>