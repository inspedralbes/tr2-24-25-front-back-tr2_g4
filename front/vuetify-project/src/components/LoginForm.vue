<template>
  <v-container class="fill-height d-flex justify-center align-center">
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
    submit() {
      if (this.$refs.form.validate()) {
        console.log("Email:", this.email, "Password:", this.password);
      }
    },
  },
};
</script>
