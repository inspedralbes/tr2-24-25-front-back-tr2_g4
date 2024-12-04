<template>
    <v-container class="fill-height d-flex justify-center align-center">
      <v-card max-width="500" class="pa-4">
        <v-card-title class="text-h5 text-center">Registro</v-card-title>
        <v-card-text>
          <!-- Etapa 1: Ingresar Nombre y Correo -->
          <div v-if="step === 1">
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="name"
                label="Nombre Completo"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Correo Electrónico"
                required
                :rules="[rules.required, rules.email, rules.domain]"
              ></v-text-field>
              <v-btn block color="primary" @click="sendCode">Enviar Código</v-btn>
            </v-form>
          </div>
  
          <!-- Etapa 2: Validar Código -->
          <div v-if="step === 2">
            <p class="text-center">
              Hemos enviado un código al correo <strong>{{ email }}</strong>.
            </p>
            <v-form ref="codeForm" v-model="valid">
              <v-text-field
                v-model="verificationCode"
                label="Código de Verificación"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-btn block color="primary" @click="validateCode">Validar Código</v-btn>
            </v-form>
          </div>
  
          <!-- Etapa 3: Crear Contraseña -->
          <div v-if="step === 3">
            <p class="text-center">
              Código validado. Por favor, crea una nueva contraseña.
            </p>
            <v-form ref="passwordForm" v-model="valid">
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
                :rules="[rules.required, rules.passwordStrength]"
              ></v-text-field>
              <v-text-field
                v-model="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                required
                :rules="[rules.required, matchPasswords]"
              ></v-text-field>
              <v-btn block color="primary" @click="createAccount">Crear Cuenta</v-btn>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "RegisterForm",
    data() {
      return {
        step: 1, // Controla el paso del formulario
        name: "",
        email: "",
        verificationCode: "",
        password: "",
        confirmPassword: "",
        valid: false,
        rules: {
          required: (value) => !!value || "Campo requerido.",
          email: (value) =>
            /.+@.+\..+/.test(value) || "Introduzca un correo válido.",
          domain: (value) =>
            value.endsWith("@inspedralbes.cat") ||
            "El correo debe ser de @inspedralbes.cat",
          passwordStrength: (value) =>
            value.length >= 8 || "La contraseña debe tener al menos 8 caracteres.",
        },
        matchPasswords: (value) =>
          value === this.password || "Las contraseñas no coinciden.",
      };
    },
    methods: {
      sendCode() {
        if (this.$refs.form.validate()) {
          console.log("Enviando código al correo:", this.email);
          // Aquí va la lógica para enviar el código al correo.
          // Ejemplo: Llamada a una API para enviar el código.
          this.step = 2; // Avanza al paso 2
        }
      },
      validateCode() {
        if (this.$refs.codeForm.validate()) {
          console.log("Validando código:", this.verificationCode);
          // Aquí va la lógica para validar el código con el backend.
          // Ejemplo: Verificar que el código es correcto.
          this.step = 3; // Avanza al paso 3
        }
      },
      createAccount() {
        if (this.$refs.passwordForm.validate()) {
          console.log("Creando cuenta para:", this.email);
          // Aquí va la lógica para crear la cuenta en el backend.
          // Ejemplo: Guardar los datos en la base de datos.
          this.$router.push("/login"); // Redirige al componente de login
        }
      },
    },
  };
  </script>
  