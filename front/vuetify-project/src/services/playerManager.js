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
        // Definir las posiciones de las bombas y los multiplicadores
        bombas: [],
        multipliers: [],
      };
    },
    created() {
      // Generar posiciones para las bombas y multiplicadores
      this.generateUniquePositions();
    },
    methods: {
      lanzarDado() {
        if (this.girando) return;
      
        this.girando = true; // Bloquear clics
        this.numeroDado = null; // Reiniciar el dado
        this.dadoStyle.backgroundColor = "white"; // Fondo rojo al iniciar
        this.rotacion = 0;
      
        let iteraciones = 0;
        const interval = setInterval(() => {
          this.numeroDado = Math.floor(Math.random() * 6) + 1; // Número aleatorio
          this.rotacion += Math.floor(Math.random() * 180) + 90; // Rotación aleatoria
          this.dadoStyle.transform = `rotate(${this.rotacion}deg)`;
          iteraciones++;
      
          if (iteraciones === 10) {
            clearInterval(interval); // Detener el dado tras 10 giros
      
            // Asegurar que la rotación final sea múltiplo de 90
            this.rotacion = Math.ceil(this.rotacion / 90) * 90;
      
            // Fijar la posición del dado de manera recta
            this.dadoStyle.transform = `rotate(${this.rotacion}deg)`;
      
            this.dado = this.numeroDado; // Fijar el número final
            this.dadoStyle.backgroundColor = "green"; // Fondo verde
            this.actualizarPosicion(); // Mover al jugador
            this.girando = false; // Permitir clics
          }
        }, 400); // Giro cada 500ms para un total de 5 segundos
      },
      actualizarPosicion() {
        const nuevaPosicion = Math.min(this.carril.position + this.dado, 39);
        this.carril.position = nuevaPosicion;
        this.scrollCarril();
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
        availablePositions = availablePositions.filter(pos => !this.bombas.includes(pos));
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
    }
  };
  