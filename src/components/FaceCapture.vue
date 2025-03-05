<template>
  <div class="camera-container">
    <div class="video-wrapper">
      <video ref="video" autoplay></video>
      <canvas ref="canvas" style="display: none"></canvas>
      <!-- Agora o Guidelines.vue estará sobre o vídeo corretamente -->
      <Guidelines :status="faceStatus" :message="guidanceMessage" />
    </div>
    <button @click="captureImage">Capturar</button>
  </div>
</template>

<script>
import { analyzeFace, uploadImage, saveToDynamo } from "../services/api";
import Guidelines from "./Guidelines.vue";

export default {
  components: { Guidelines },
  data() {
    return {
      faceStatus: '', // "correct" ou "incorrect"
      guidanceMessage: 'Posicione seu rosto corretamente.',
    };
  },
  mounted() {
    this.startCamera();
  },
  methods: {
    async startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        this.$refs.video.srcObject = stream;
      } catch (error) {
        console.error("Erro ao acessar a câmera:", error.message);
      }
    },
    captureImage() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1];
          await this.processImage(base64data);
        };
      }, "image/jpeg");
    },
    async processImage(base64data) {
      try {
        const faceResponse = await analyzeFace(base64data);

        if (faceResponse.message === "Face válida") {
          this.faceStatus = "correct";
          this.guidanceMessage = "Posição correta!";
          const uploadResponse = await uploadImage(base64data);
          await saveToDynamo(uploadResponse.fileName, uploadResponse.bucket);
          alert("Imagem salva com sucesso!");
        } else {
          this.faceStatus = "incorrect";
          this.guidanceMessage = faceResponse.message;
        }
      } catch (error) {
        console.error("Erro ao processar a imagem:", error);
      }
    },
  },
};
</script>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

video {
  width: 100%;
  display: block;
  border-radius: 8px;
}

button {
  margin-top: 10px;
}
</style>

