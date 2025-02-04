import errorAudio from '@/assets/error.mp3';
import { useUserStore } from '@/stores/userStore'; // Importa el store de usuario
import { io } from 'socket.io-client';
const API_URL = import.meta.env.VITE_API_BACK;
export default {
  data() {
    return {
      // Datos del carril del jugador
      carril: {
        name: "",
        avatar: "https://cdn-icons-png.freepik.com/512/32/32689.png",
        position: 0, // Empezamos en la casilla 0
      },
      mensajeRespuesta: "", // Mensaje que muestra la respuesta al usuario
      dado: 0, // Número del dado que se obtiene tras el giro
      numeroDado: null, // Número mostrado en el dado durante el giro
      girando: false, // Controla el estado de giro del dado (para evitar clics múltiples)
      rotacion: 0, // Ángulo de rotación del dado para simular el giro
      dadoStyle: { // Estilos para el dado
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
      numeroDadoStyle: { // Estilos para el número del dado
        transition: "transform 0.5s ease",
      },
      preguntaActual: null, // Pregunta que se obtiene tras el giro del dado
      opcionesRespuesta: [], // Opciones de respuesta generadas aleatoriamente
      respuestaCorrecta: null, // Respuesta correcta a la pregunta
      preguntaActiva: false, // Controla si la pregunta está activa
      bombas: [], // Posiciones de las bombas en el tablero
      multiplicadores: [], // Posiciones de los multiplicadores en el tablero
      audioIncorrecto: null,
      nom: '', // Aquí se guarda el nombre del alumno
    };
  },
  created() { 
    try {
      const estadoGuardado = localStorage.getItem('estadoCarril');
      if (estadoGuardado) {
        const { carril, bombas, multiplicadores } = JSON.parse(estadoGuardado);
        if (carril && Array.isArray(bombas) && Array.isArray(multiplicadores)) {
          // Restaurar estado guardado si es válido
          this.carril = carril;
          this.bombas = bombas;
          this.multiplicadores = multiplicadores;
        } else {
          // Generar nuevas posiciones si el estado guardado es inválido
          this.generateUniquePositions();
        }
      } else {
        // Generar nuevas posiciones si no hay estado guardado
        this.generateUniquePositions();
      }
    } catch (error) {
      console.error('Error al cargar el estado del carril:', error);
      this.generateUniquePositions();
    }
    this.socket = io(`${API_URL}`);
    this.audioIncorrecto = new Audio(errorAudio);
    this.obtenerAlumno();
    console.log('Datos enviados:', {
      carril: this.carril,
      nombre: this.nom,
      bombas: this.bombas,
      multiplicadores: this.multiplicadores
    });
    
},

  methods: {
    guardarEstadoCarril() {
      localStorage.setItem('estadoCarril', JSON.stringify({
        carril: this.carril,
        bombas: this.bombas,
        multiplicadores: this.multiplicadores,
      }));
    },
    // Método para obtener el nombre del alumno
    async obtenerAlumno() {
    
      try {
        const userStore = useUserStore();
        const email = userStore.user.email;
        const response = await fetch(`${API_URL}./alumno/`+ (email)); // Suponiendo que el id del alumno es 1
        const data = await response.json();
        if (data.nom) {
          this.nom = data.nom; // Asignamos el nombre del alumno
          this.carril.name = this.nom; // Asignamos el nombre del alumno al carril
        } else {
          console.error("Alumno no encontrado");
        }
      } catch (error) {
        console.error('Error al obtener el alumno:', error);
      }
    },

    // Método para devolver un color aleatorio para las opciones de respuesta
    getOpcionColor(index) {
      const colors = ['#9C27B0', '#FF9800', '#E91E63', '#c3de30']; // Colores morado, naranja, rosa y amarillo
      return {
        backgroundColor: colors[index % colors.length], // Cicla entre los colores
      };
    },

    // Método que simula el giro del dado
    async lanzarDado() {
      // Si el dado está girando o hay una pregunta activa, no se puede girar de nuevo
      if (this.girando || this.preguntaActiva) return; 
    
      this.girando = true; // Bloquear clics mientras se gira el dado
      this.numeroDado = null; // Reiniciar el número del dado
      this.dadoStyle.backgroundColor = "white"; // Fondo blanco al iniciar el giro
      this.rotacion = 0; // Reiniciar la rotación
      this.mensajeRespuesta = ""; // Borrar el mensaje de respuesta
    
      let iteraciones = 0; 
      // Intervalo para generar el giro aleatorio del dado
      const interval = setInterval(() => {
        this.numeroDado = Math.floor(Math.random() * 6) + 1; // Número aleatorio entre 1 y 6
        this.rotacion += Math.floor(Math.random() * 180) + 90; // Rotación aleatoria del dado
        this.dadoStyle.transform = `rotate(${this.rotacion}deg)`; // Aplicamos la rotación al dado
        iteraciones++;
    
        if (iteraciones === 10) {
          clearInterval(interval); // Detener el giro tras 10 iteraciones
    
          // Aseguramos que la rotación final sea un múltiplo de 90 grados
          this.rotacion = Math.ceil(this.rotacion / 90) * 90;
    
          // Ajustar la rotación del dado y el número para que siempre se vea recto
          this.dadoStyle.transform = `rotate(${this.rotacion}deg)`;
          this.numeroDadoStyle.transform = `rotate(${-this.rotacion}deg)`; // Rotación contraria para que el número quede recto
    
          this.dado = this.numeroDado; // Fijar el número final del dado
          this.dadoStyle.backgroundColor = "green"; // Fondo verde al terminar el giro
          console.log('Obteniendo pregunta...');
          this.obtenerPregunta() // Llamada al método que obtiene la pregunta
            .then(() => console.log('Pregunta obtenida:', this.preguntaActual))
            .catch((error) => console.error('Error al obtener la pregunta:', error));
          this.girando = false; // Permitir clics de nuevo
        }
      }, 400); // 400ms por giro, por lo que el dado gira durante 4 segundos
    },

    // Método para obtener una pregunta desde la API
    async obtenerPregunta() {
      try {
        const response = await fetch(`${API_URL}./preguntas`); // URL de la API para obtener las preguntas
        const preguntas = await response.json();
    
        if (preguntas.length > 0) {
          const pregunta = preguntas[0]; // Tomamos la primera pregunta
          this.preguntaActual = pregunta; // Guardamos la pregunta completa
          this.respuestaCorrecta = pregunta.respuesta_correcta;
    
          // Generación de respuestas aleatorias (si la respuesta correcta es un número)
          const respuestasSimilares = new Set();
    
          while (respuestasSimilares.size < 3) {
            let respuestaAleatoria;
            // Generamos respuestas aleatorias cercanas a la respuesta correcta
            if (this.respuestaCorrecta <= 50) {
              respuestaAleatoria = Math.max(0, Math.floor(Math.random() * 41) + (this.respuestaCorrecta - 20));
            } else if (this.respuestaCorrecta > 50 && this.respuestaCorrecta <= 150) {
              respuestaAleatoria = Math.max(0, Math.floor(Math.random() * 61) + (this.respuestaCorrecta - 30));
            } else {
              respuestaAleatoria = Math.max(0, Math.floor(Math.random() * 201) + (this.respuestaCorrecta - 100));
            }
          
            // Verificar si la respuesta aleatoria es diferente de la respuesta correcta y de las demás respuestas
            if (respuestaAleatoria !== this.respuestaCorrecta && !respuestasSimilares.has(respuestaAleatoria)) {
              respuestasSimilares.add(respuestaAleatoria);
            } else {
              // Si se repite o es igual a la correcta, lo volvemos a intentar
              console.log("Generando nueva respuesta, ya existe o es la correcta.");
            }
          }
          
          // Mezclamos las respuestas y las mostramos
          const opciones = [this.respuestaCorrecta, ...Array.from(respuestasSimilares)].sort(() => Math.random() - 0.5);
          this.opcionesRespuesta = opciones;
    
          this.preguntaActiva = true; // Activamos la pregunta
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
        let nuevaPosicion = this.carril.position + this.dado;
    
        // Si la nueva posición es mayor que 39, ponemos al jugador en la última casilla
        if (nuevaPosicion >= 39) {
          this.carril.position = 39; // Aseguramos que no se pase de la última casilla
          this.mensajeRespuesta = '¡Felicidades! Has alcanzado la meta. ¡Has ganado!';
    
          this.scrollCarril(); // Actualizamos la vista al movimiento final
    
          // Usamos un retraso para permitir que el jugador vea el movimiento antes de mostrar el alert
          setTimeout(() => {
            alert("¡Felicidades! Has alcanzado la meta. No puedes continuar.");
    
            // Limpiar el localStorage
            localStorage.removeItem('estadoCarril');
    
            // Aquí podrías redirigir a otra pantalla (por ejemplo, "alumno-dashboard").
            setTimeout(() => {
              window.location.href = '/alumno-dashboard'; // Redirige a la pantalla de alumno-dashboard
            }, 2000); // Redirige después de 2 segundos, por ejemplo
          }, 500); // Retraso de 500ms antes del alert
    
        } else {
          // Si no llegamos al final, se avanza normalmente
          this.carril.position = nuevaPosicion;
          this.mensajeRespuesta = '¡Respuesta correcta! Avanzando.';
          this.scrollCarril();
        }
      } else {
        // Si la respuesta es incorrecta, reproducir el audio
        if (this.audioIncorrecto) {
          this.audioIncorrecto.play().catch((error) => {
            console.error('Error al reproducir el audio:', error);
          });
        }
    
        this.mensajeRespuesta = 'Respuesta incorrecta';
      }
    
      // Guardar resultado y actualizar estado
      this.guardarResultado(respuesta);
      this.preguntaActiva = false;
      this.preguntaActual = null;
      this.opcionesRespuesta = [];
      console.log('Datos enviados:', {
        carril: this.carril,
        nombre: this.nom,
        bombas: this.bombas,
        multiplicadores: this.multiplicadores
      });
      this.socket.emit('updateCarril', this.carril, this.nom, this.avatar, this.bombas, this.multiplicadores);
      this.guardarEstadoCarril();
    },
    
    
    // Método para guardar el resultado
    async guardarResultado(respuesta) {
      const esCorrecto = respuesta === this.respuestaCorrecta;
      const nombreAlumno = this.nom; // Usamos el nombre del alumno

      // Accede a los campos 'id' y 'difficulty_level' de 'preguntaActual'
      const preguntaId = this.preguntaActual.id; // Usamos el 'id' de la pregunta
      const dificultad = this.preguntaActual.difficulty_level; // Usamos 'difficulty_level' de la pregunta
      const tipoPregunta = this.preguntaActual.type;

      try {
        const response = await fetch(`${API_URL}./guardar-resultado`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preguntaId,
            dificultad,
            esCorrecto,
            nombreAlumno,
            tipoPregunta,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log(data.mensaje); // "Resultado guardado exitosamente"
        } else {
          console.error(data.mensaje);
        }
      } catch (error) {
        console.error('Error al guardar el resultado:', error);
      }
    },

    // Método para hacer scroll en el carril según la posición
    scrollCarril() {
      const carrilContainer = this.$refs.carrilContainer;
      const desplazamiento = this.carril.position * 60; // 60px por casilla
      if (carrilContainer) {
        carrilContainer.scrollLeft = desplazamiento; // Desplazamos el carril
      }
    },

    // Método para generar posiciones únicas para las bombas y multiplicadores
    generateUniquePositions() {
      let availablePositions = Array.from({ length: 39 }, (_, i) => i + 1); // Casillas disponibles
      this.bombas = this.getRandomPositions(availablePositions, 2); // Seleccionamos 2 bombas
      availablePositions = availablePositions.filter((pos) => !this.bombas.includes(pos)); // Excluimos las bombas de las opciones
      this.multiplicadores = this.getRandomPositions(availablePositions, 2);
      this.guardarEstadoCarril(); // Seleccionamos 2 multiplicadores
    },

    // Método para obtener posiciones aleatorias de un conjunto de posiciones disponibles
    getRandomPositions(availablePositions, number) {
      const positions = [];
      for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        positions.push(availablePositions[randomIndex]); // Añadimos una posición aleatoria
        availablePositions.splice(randomIndex, 1); // Eliminamos la posición seleccionada
      }
      return positions;
    },

    // Método para verificar si una posición corresponde a una bomba
    isBomb(index) {
      return this.bombas.includes(index); // Retorna true si es una bomba
    },

    // Método para verificar si una posición corresponde a un multiplicador
    isMultiplier(index) {
      return this.multiplicadores.includes(index); // Retorna true si es un multiplicador
    },

    // Método para obtener el color de la casilla en el carril
    getColor(index) {
      if (index === this.carril.position) return "white"; // Color de la casilla actual
      return index % 2 === 0 ? "red" : "black"; // Color alternado para las demás casillas
    },
  },
};