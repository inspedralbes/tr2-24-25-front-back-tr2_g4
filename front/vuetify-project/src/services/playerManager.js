export default {
  data() {
    return {
      // Datos del carril del jugador
      carril: {
        name: "Rayo Veloz",
        avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png",
        position: 0, // Empezamos en la casilla 0
      },
      dado: 0,
      numeroDado: null, // Número mostrado en el dado durante el giro
      girando: false, // Controla el estado de giro del dado
      rotacion: 0, // Ángulo de rotación del dado
      dadoStyle: {
        width: "300px",
        height: "300px",
        backgroundColor: "white",
        borderRadius: "10px",
        fontSize: "32px",
        color: "black",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.5s ease, background-color 0.3s ease",
      },
      numeroDadoStyle: {
        transition: "transform 0.5s ease",
      },
      preguntaActual: null, // Pregunta actual
      opcionesRespuesta: [], // Opciones de respuesta
      respuestaCorrecta: null, // Respuesta correcta
      preguntaActiva: false, // Controla si la pregunta está activa
      bombas: [], // Posiciones de las bombas
      multipliers: [], // Posiciones de los multiplicadores
    };
  },
  created() {
    // Generar posiciones para las bombas y multiplicadores
    this.generateUniquePositions();
  },
  methods: {
    async lanzarDado() {
      if (this.girando || this.preguntaActiva) return; // Evitar lanzar el dado si está girando o hay una pregunta activa
    
      this.girando = true; // Bloquear clics
      this.numeroDado = null; // Reiniciar el dado
      this.dadoStyle.backgroundColor = "white"; // Fondo blanco al iniciar
      this.rotacion = 0;
    
      let iteraciones = 0;
      const interval = setInterval(() => {
        this.numeroDado = Math.floor(Math.random() * 6) + 1; // Número aleatorio
        this.rotacion += Math.floor(Math.random() * 180) + 90; // Rotación aleatoria
        this.dadoStyle.transform = `rotate(${this.rotacion}deg)`; // Rotación del dado
        iteraciones++;
    
        if (iteraciones === 10) {
          clearInterval(interval); // Detener el dado tras 10 giros
    
          // Asegurar que la rotación final sea múltiplo de 90
          this.rotacion = Math.ceil(this.rotacion / 90) * 90;
    
          // Fijar la posición del dado de manera recta
          this.dadoStyle.transform = `rotate(${this.rotacion}deg)`;
    
          // Ajustar la rotación del número para que siempre se vea recto
          this.numeroDadoStyle.transform = `rotate(${-this.rotacion}deg)`; // Rotación contraria
    
          this.dado = this.numeroDado; // Fijar el número final
          this.dadoStyle.backgroundColor = "green"; // Fondo verde
          console.log('Obteniendo pregunta...');
          this.obtenerPregunta() // Llama al método
            .then(() => console.log('Pregunta obtenida:', this.preguntaActual))
            .catch((error) => console.error('Error al obtener la pregunta:', error));
          this.girando = false; // Permitir clics (solo para el dado, pregunta seguirá bloqueando)
        }
      }, 400); // Giro cada 400ms para un total de 5 segundos
    },
    async obtenerPregunta() {
      try {
        const response = await fetch('http://localhost:3000/preguntas'); // Cambia esta URL si es necesario
        const preguntas = await response.json();
    
        if (preguntas.length > 0) {
          const pregunta = preguntas[0]; // Tomar la primera pregunta
          this.preguntaActual = pregunta.text_pregunta;
          this.respuestaCorrecta = pregunta.respuesta_correcta;
    
          // Generar respuestas aleatorias (si la respuesta correcta es numérica)
          const respuestasSimilares = new Set();
    
          // Asegurarnos de que no se repitan las respuestas
          while (respuestasSimilares.size < 3) {
            const respuestaAleatoria = Math.floor(Math.random() * 50) + 1; // Generar entre 1 y 20
            if (respuestaAleatoria != this.respuestaCorrecta) {
              respuestasSimilares.add(respuestaAleatoria);
            }
          }
    
          // Combinar respuestas y desordenarlas
          const opciones = [this.respuestaCorrecta, ...Array.from(respuestasSimilares)].sort(() => Math.random() - 0.5);
          this.opcionesRespuesta = opciones;
    
          this.preguntaActiva = true; // Activar la pregunta
        } else {
          throw new Error('No hay preguntas disponibles');
        }
      } catch (error) {
        console.error('Error al obtener la pregunta:', error);
        this.preguntaActual = 'No se pudo cargar la pregunta. Inténtalo de nuevo.';
        this.preguntaActiva = false;
      }
    },
    verificarRespuesta(respuesta) {
      if (respuesta === this.respuestaCorrecta) {
        // Respuesta correcta: actualizar posición
        let nuevaPosicion = this.carril.position + this.dado;
    
        // Verifica si la casilla es un multiplicador (x2)
        if (this.isMultiplier(this.carril.position)) {
          nuevaPosicion = Math.min(nuevaPosicion + this.dado, 39); // Duplicar el avance
          console.log("¡Multiplicador! Avanzando el doble.");
        }
    
        // Si es bomba, no se aplica la retrocesión en respuesta correcta
        if (this.isBomb(this.carril.position)) {
          console.log("¡Bomba! No retrocede por respuesta correcta.");
        }
    
        this.carril.position = nuevaPosicion;
        this.scrollCarril();
      } else {
        // Respuesta incorrecta: retroceder 2 posiciones si es bomba
        if (this.isBomb(this.carril.position)) {
          this.carril.position = Math.max(this.carril.position - 2, 0); // Retroceder 2 posiciones
          console.log("¡Bomba! Retrocediendo 2 posiciones por respuesta incorrecta.");
        }
    
        alert('Respuesta incorrecta. Intenta nuevamente.');
      }
    
      // Desactivar la pregunta después de responder
      this.preguntaActiva = false;
      this.preguntaActual = null;
      this.opcionesRespuesta = [];
    },
    
    scrollCarril() {
      const carrilContainer = this.$refs.carrilContainer;
      const desplazamiento = this.carril.position * 60; // 60px por casilla
      if (carrilContainer) {
        carrilContainer.scrollLeft = desplazamiento;
      }
    },
    generateUniquePositions() {
      let availablePositions = Array.from({ length: 39 }, (_, i) => i + 1);
      this.bombas = this.getRandomPositions(availablePositions, 2);
      availablePositions = availablePositions.filter((pos) => !this.bombas.includes(pos));
      this.multipliers = this.getRandomPositions(availablePositions, 2);
    },
    getRandomPositions(availablePositions, number) {
      const positions = [];
      for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        positions.push(availablePositions[randomIndex]);
        availablePositions.splice(randomIndex, 1);
      }
      return positions;
    },
    isBomb(index) {
      return this.bombas.includes(index);
    },
    isMultiplier(index) {
      return this.multipliers.includes(index);
    },
    getColor(index) {
      if (index === this.carril.position) return "white";
      return index % 2 === 0 ? "red" : "black";
    },
  },
};
