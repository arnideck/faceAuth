<template>
  <div>
    <CameraCapture @imageCaptured="processImage" />
    <p v-if="loading">Validando...</p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>

import CameraCapture from "./CameraCapture.vue";
  export default {
  components: {
  CameraCapture,
},
};
</script>

<style scoped>
.login-container {
  text-align: center;
  padding: 20px;
}
</style>

