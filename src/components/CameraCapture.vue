<script>
import AWS from 'aws-sdk';

export default {
  data() {
    return {
      lambda: null
    };
  },
  mounted() {
    this.setupCamera();
    this.configureAWS();
  },
  methods: {
    setupCamera() {
      navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            this.$refs.video.srcObject = stream;
          })
          .catch(error => console.error("Erro ao acessar câmera:", error));
    },
    configureAWS() {
      AWS.config.update({
        region: process.env.CUSTOM_REGION
      });

      // 🔹 Configurar Credenciais Cognito
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: process.env.VUE_APP_COGNITO_IDENTITY_POOL
      });

      this.lambda = new AWS.Lambda({
        apiVersion: '2015-03-31'
      });
    },
    captureImage() {
      const canvas = this.$refs.canvas;
      const video = this.$refs.video;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png").split(",")[1];

      this.sendToLambda(imageData);
    },
    async sendToLambda(imageBase64) {
      try {
        const params = {
          FunctionName: "FaceAuthLambda",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({ image: imageBase64 })
        };

        const response = await this.lambda.invoke(params).promise();
        const result = JSON.parse(response.Payload);

        if (result.error) {
          alert("Erro: " + result.error);
        } else {
          alert("Usuário autenticado: " + result.user);
        }
      } catch (error) {
        console.error("Erro na requisição Lambda:", error);
      }
    }
  }
};
</script>
