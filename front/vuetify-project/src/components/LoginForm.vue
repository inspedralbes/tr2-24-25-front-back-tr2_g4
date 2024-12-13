<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <!-- Contenedor principal que llena toda la pantalla -->
    <v-container fluid class="fill-height d-flex justify-center align-center fondo">
      <v-card max-width="400" class="pa-4">
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
import { useUserStore } from '@/stores/userStore'; // Importa el store de Pinia

export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      valid: false,
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
          const response = await fetch('http://localhost:3000/login', {
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
            // Si la autenticación es exitosa, guarda el usuario en el store de Pinia
            const userStore = useUserStore();
            userStore.setUser({
              email: this.email,
              name: data.userName, // Asume que 'userName' viene de la respuesta
              role: data.profesor ? 'profesor' : 'alumno', // Ejemplo de rol
            });

            // Redirige según el rol del usuario
            if (data.profesor) {
              this.$router.push('/profesor-dashboard');
            } else {
              this.$router.push('/alumno-dashboard');
            }
          } else {
            alert(data.message || 'Credenciales incorrectas');
          }
        } catch (error) {
          console.error('Error al autenticar:', error);
          alert('Hubo un problema con la autenticación. Inténtalo nuevamente.');
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

.title-center {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
