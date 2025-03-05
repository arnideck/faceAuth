<template>
  <div>
    <h1>Face Detection App</h1>
    <FaceCapture />
  </div>
</template>

<script>
import FaceCapture from "./components/FaceCapture.vue";

export default {
  components: { FaceCapture },
};
</script>
