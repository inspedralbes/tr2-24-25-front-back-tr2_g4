<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal que llena toda la pantalla -->
    <v-container fluid class="fill-height d-flex justify-center align-center fondo">
      <!-- Texto de bienvenida centrado en la parte superior -->
      <v-row class="w-100 align-center">
        <v-col class="d-flex justify-center align-center" cols="12">
          <div class="welcome-text">
            <v-spacer style="padding: 20px;"></v-spacer>
            <h1 class="welcome-title">
              ¡BIENVENIDO!
            </h1>
            <h2 class="welcome-subtitle">
              ¡Prepárate para jugar y aprender!
            </h2>
          </div>
        </v-col>
      </v-row>

      <!-- Card de inicio de sesión -->
      <v-card max-width="400" class="pa-4 ini">
        <v-card-title class="text-h5 text-center">Iniciar Sesión</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="email"
              label="Correo Electrónico"
              required
              :rules="[rules.required, rules.email, rules.domain]"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Contraseña"
              type="password"
              required
              :rules="[rules.required]"
            ></v-text-field>

            <v-btn block color="primary" @click="submit">Iniciar Sesión</v-btn>
          </v-form>

          <!-- Mensajes de alerta -->
          <v-alert 
            v-if="alertMessage" 
            :type="alertType" 
            dismissible 
            class="mt-4 text-center"
          >
            {{ alertMessage }}
          </v-alert>

          <!-- Link para registrarse -->
          <div class="text-center mt-4">
            <a class="text-decoration-none" @click.prevent="$emit('switch-to-register')">
              ¿No tienes cuenta? <span class="text-primary">Regístrate aquí</span>
            </a>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
import { useUserStore } from '@/stores/userStore';
import { onMounted } from 'vue';

export default {
  setup() {
    const userStore = useUserStore();

    onMounted(() => {
      userStore.clearAll(); // Borra los datos del localStorage al montar la vista
    });

    return {}; 
  },

  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      valid: false,
      alertMessage: "",
      alertType: "",
      rules: {
        required: (value) => !!value || "Campo requerido.",
        email: (value) =>
          /.+@.+\..+/.test(value) || "Introduzca un correo válido.",
        domain: (value) =>
          value.endsWith("@inspedralbes.cat") ||
          "El correo debe ser de @inspedralbes.cat",
      },
    };
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const response = await fetch(`http://localhost:3000/./login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });

          const data = await response.json();

          if (data.success) {
            const userStore = useUserStore();
        
            const userData = {
              email: this.email,
              userName: this.email.split('@')[0],
              role: data.profesor ? 'profesor' : 'alumno',
            };
            userStore.setUser(userData); // Guardar el usuario en Pinia

            // Redirige según el rol
            if (data.profesor) {
              this.$router.push('/profesor-dashboard');
            } else {
              this.$router.push('/alumno-dashboard');
            }
          } else {
            this.alertType = "error";
            this.alertMessage = data.message || 'Credenciales incorrectas';
          }
        } catch (error) {
          console.error('Error al autenticar:', error);
          this.alertType = "error";
          this.alertMessage = 'Hubo un problema con la autenticación. Inténtalo nuevamente.';
        }
      }
    },
  },
};
</script>

<style scoped>
.fondo {
  background-color: #99a6e9;
  height: 100vh; /* Asegura que ocupe toda la altura de la pantalla */
  width: 100vw; /* Asegura que ocupe todo el ancho de la pantalla */
}

.logo {
  max-width: 30%; /* Tamaño ajustado del logo */
  height: auto;
}

.welcome-text {
  text-align: center;
}

.welcome-title {
  font-size: 50px; /* Tamaño del título principal */
  color: #ffffff; /* Azul oscuro */
}

.welcome-subtitle {
  font-size: 1.5rem; /* Tamaño del subtítulo */
  color: #071f44; /* Azul más oscuro */
}

.text-primary {
  color: #fff0f0; /* Verde atractivo */
}

.text-secondary {
  color: #0a0101; /* Blanco para contraste */
}

.title-center {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.ini {
  width: 70%;
}
</style>
