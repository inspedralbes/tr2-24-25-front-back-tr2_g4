<template>
  
  <v-container class="fill-height d-flex justify-center align-center fondo">
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
</template>


<script>
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
          // Hacer la solicitud POST al backend para verificar el login
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
            // Si el login es exitoso, verificar el rol (profesor o alumno)
            if (data.profesor) {
              // Si es profesor, redirigir a la página de profesores
              this.$router.push('/profesor-dashboard');  // Página para profesores
            } else {
              // Si es alumno, redirigir a la página de alumnos
              this.$router.push('/alumno-dashboard');   // Página para alumnos
            }
          } else {
            // Si el login falla, mostrar un mensaje de error
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
}
</style>

