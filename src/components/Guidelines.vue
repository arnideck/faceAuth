<template>
  <div class="guidelines-container">
    <div class="overlay">
      <div class="horizontal-line"></div>
      <div class="vertical-line"></div>
    </div>
    <div class="guidelines" :class="statusClass">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    status: String, // "correct", "incorrect" ou vazio
    message: String, // Mensagem a ser exibida
  },
  computed: {
    statusClass() {
      return {
        correct: this.status === "correct",
        incorrect: this.status === "incorrect",
      };
    },
  },
};
</script>

<style scoped>
/* Container para alinhar corretamente com o vídeo */
.guidelines-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  max-width: 400px; /* Ajustado para se alinhar ao vídeo */
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 10;
}

/* Ajuste no overlay para cobrir exatamente o vídeo */
.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* Linha horizontal (para alinhar os olhos) */
.horizontal-line {
  position: absolute;
  top: 30%; /* Ajustado para ficar na altura dos olhos */
  left: 10%;
  width: 80%;
  height: 2px;
  background: red;
  opacity: 0.8;
}

/* Linha vertical (para centralizar o rosto) */
.vertical-line {
  position: absolute;
  top: 10%;
  left: 30%;
  width: 2px;
  height: 80%;
  background: red;
  opacity: 0.8;
}

/* Estilização da mensagem */
.guidelines {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
}

.correct {
  color: green;
}

.incorrect {
  color: red;
}
</style>

