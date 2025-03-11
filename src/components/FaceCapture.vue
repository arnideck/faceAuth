<template>
  <div class="camera-container">
    <video ref="video" autoplay muted playsinline></video>
    <canvas ref="overlayCanvas"></canvas>
    <button v-if="faceDetected" @click="confirmCapture">Confirmar Captura</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { analyzeFace, uploadImage, saveToDynamo } from "../services/api";

export default {
  data() {
    return {
      message: "Posicione seu rosto corretamente.",
      autoCapture: true,
      captureInterval: null,
      currentBase64Image: null,
      faceDetected: false,
    };
  },
  mounted() {
    this.startCamera();
  },
  beforeUnmount() {
    clearInterval(this.captureInterval);
  },
  methods: {
    async startCamera() {
      const video = this.$refs.video;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      if (this.autoCapture) {
        this.captureInterval = setInterval(this.autoCaptureFrame, 2000);
      }
    },

    async autoCaptureFrame() {
      const video = this.$refs.video;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const base64data = canvas.toDataURL("image/jpeg").split(",")[1];
      const result = await analyzeFace(base64data);

      if (result.boundingBox) {
        this.message = "Rosto detectado! Clique para confirmar.";
        this.drawFaceRectangle(result.boundingBox);
        this.currentBase64Image = base64data;
        this.faceDetected = true;
      } else {
        this.message = "Nenhum rosto detectado. Ajuste sua posição.";
        this.clearCanvas();
        this.faceDetected = false;
      }
    },

    drawFaceRectangle(box) {
      const video = this.$refs.video;
      const canvas = this.$refs.overlayCanvas;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 3;

      ctx.strokeRect(
          box.Left * canvas.width,
          box.Top * canvas.height,
          box.Width * canvas.width,
          box.Height * canvas.height
      );
    },

    clearCanvas() {
      const canvas = this.$refs.overlayCanvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    async confirmCapture() {
      if (!this.currentBase64Image) return;

      this.message = "Enviando imagem para S3...";
      const uploadResponse = await uploadImage(this.currentBase64Image);

      if (uploadResponse.fileName && uploadResponse.bucket) {
        this.message = "Salvando registro no DynamoDB...";
        const dynamoResponse = await saveToDynamo(
            uploadResponse.fileName,
            uploadResponse.bucket
        );

        if (dynamoResponse.message) {
          this.message = dynamoResponse.message;
          clearInterval(this.captureInterval);
        } else {
          this.message = "Erro ao registrar acesso no DynamoDB.";
        }
      } else {
        this.message = "Erro ao fazer upload da imagem.";
      }
    },
  },
};
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: black;
  overflow: hidden;
}

video,
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

p {
  position: absolute;
  bottom: 50px;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 18px;
  z-index: 10;
}
</style>
