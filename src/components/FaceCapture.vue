<template>
  <div class="camera-container">
    <video ref="video" autoplay muted playsinline></video>
    <canvas ref="overlayCanvas"></canvas>
    <button v-if="faceDetected" class="capture-btn" @click="confirmCapture">Confirmar Captura</button>
    <p>{{ message }}</p>
  </div>
</template>


<!-- <script>
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
</script>-->

<script>
import { analyzeFace, uploadImage, saveToDynamo } from "../services/api";
export default {
  data() {
    return {
      faceDetected: false,
      currentBase64Image: null,
      message: "Posicione seu rosto corretamente.",
      captureInterval: null
    };
  },
  mounted() {
    this.startCamera();
  },
  methods: {
    async startCamera() {
      const video = this.$refs.video;
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;

      this.captureInterval = setInterval(this.captureFrame, 2000);
    },

    async captureFrame() {
      const video = this.$refs.video;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const base64data = canvas.toDataURL("image/jpeg").split(",")[1];
      const result = await analyzeFace(base64data);

      if (result.success && result.boundingBox) {
        this.message = "Rosto detectado! Clique para confirmar.";
        this.currentBase64Image = base64data;
        this.faceDetected = true;
        this.drawFaceRectangle(result.boundingBox);
      } else {
        this.message = "Nenhum rosto detectado. Ajuste sua posição.";
        this.faceDetected = false;
        this.clearCanvas();
      }
    },

    drawFaceRectangle(box) {
      const video = this.$refs.video;
      const canvas = this.$refs.overlayCanvas;

      // Ajuste importante para evitar distorções:
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
      if (!this.currentBase64Image) {
        this.message = "Nenhuma imagem disponível.";
        return;
      }

      try {
        // 1) Captura atualizada (se realmente precisar capturar novamente)
        await this.captureFrame();

        // 2) Upload no S3
        this.message = "Enviando imagem para o S3...";
        const uploadResponse = await uploadImage(this.currentBase64Image);

       // console.log(uploadResponse.fileName);
      //  console.log(uploadResponse);

        if (uploadResponse.param && uploadResponse.Bucket) {
          this.message = "Salvando registro no DynamoDB...";
          const dynamoResponse = await saveToDynamo(
              uploadResponse.key,
              uploadResponse.bucket
          );

          if (dynamoResponse.message) {
            this.message = "Registro salvo com sucesso!";
            clearInterval(this.captureInterval);
          } else {
            this.message = "Erro ao gravar no DynamoDB.";
          }
        } else {
          this.message = "Erro ao enviar imagem.";
        }
      } catch (e) {
        this.message = "Erro ao confirmar captura: " + e.message;
      }
    }
  }
};

</script>

<style scoped>
.camera-container {
  position: fixed;   /* ou absolute, dependendo do layout desejado */
  top: 0;
  left: 0;
  width: 100vw;      /* 100% da largura da tela */
  height: 100vh;     /* 100% da altura da tela */
  overflow: hidden;
  background: black; /* evita espaços brancos */
}

video,
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* cobre a tela sem distorção */
}

button {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

p {
  position: absolute;
  bottom: 80px;
  width: 100%;
  color: #fff;
  text-align: center;
  z-index: 10;
}

</style>

