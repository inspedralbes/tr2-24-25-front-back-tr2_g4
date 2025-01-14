<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="black" dark flat>
      <v-toolbar-title class="title-center">GMaths</v-toolbar-title>
    </v-app-bar>

    <v-container style="background-color: #99a6e9;" class="fill-height d-flex justify-center align-center fondo">
      <v-card min-width="400" class="pa-4">
        <v-card-title class="text-h5 text-center">Registro</v-card-title>
        <v-card-text>
          <!-- Mostrar mensajes -->
          <div class="message-container" v-if="message">
            <v-alert :type="messageType" class="mx-auto" outlined>
              {{ message }}
            </v-alert>
          </div>

          <!-- Etapa 1: Ingresar Nombre, Apellidos y Correo -->
          <div v-if="step === 1">
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="firstName"
                label="Nombre"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="lastName"
                label="Apellidos"
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
            <v-spacer style="padding: 2px;"></v-spacer>
            <p class="text-center">
              Hemos enviado un código al correo <strong>{{ email }}</strong>.
            </p>
            <v-spacer style="padding: 5px;"></v-spacer>

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
            <v-spacer style="padding: 5px;"></v-spacer>

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
  </v-app>
</template>

<script>
import emailjs from "emailjs-com";
const API_URL = import.meta.env.VITE_API_BACK;
export default {
  name: "RegisterForm",
  data() {
    return {
      step: 1, // Controla el paso del formulario
      firstName: "", // Campo para el nombre
      lastName: "", // Campo para los apellidos
      email: "",
      verificationCode: "",
      verificationCodeNew: "",
      password: "",
      confirmPassword: "",
      valid: false,
      message: "", // Mensaje para mostrar al usuario
      messageType: "", // Tipo de mensaje ('success' o 'error')
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

        // Generar un código de verificación aleatorio
        this.verificationCodeNew = Math.floor(100000 + Math.random() * 900000);

        // Parámetros que se van a enviar en el template de EmailJS
        const templateParams = {
          to_name: `${this.firstName} ${this.lastName}`,
          to_email: this.email,
          code: this.verificationCodeNew,
        };

        // Llamada a EmailJS para enviar el correo
        emailjs
          .send(
            "service_kuduxwp",
            "template_3i3jrdg",
            templateParams,
            "J-gLAvGvroJYft-OY"
          )
          .then((response) => {
            console.log("Correo enviado con éxito:", response);
            this.message = "¡Código enviado exitosamente! Revisa tu correo.";
            this.messageType = "success";
            this.step = 2; // Avanzar al paso 2
          })
          .catch((error) => {
            console.error("Error al enviar el correo:", error);
            this.message = "Hubo un error al enviar el correo. Inténtalo de nuevo.";
            this.messageType = "error";
          });
      }
    },

    validateCode() {
      if (this.$refs.codeForm.validate()) {
        if (this.verificationCode == this.verificationCodeNew) {
          this.message = "¡Código validado exitosamente!";
          this.messageType = "success";
          this.step = 3; // Avanza al paso 3
        } else {
          this.message = "El código ingresado es incorrecto.";
          this.messageType = "error";
        }
      }
    },

    async createAccount() {
      if (this.$refs.passwordForm.validate()) {
        console.log("Creando cuenta para:", this.email);

        // Crear el objeto de datos para enviar al backend
        const userName = this.email.split('@')[0]; // Extraer el nombre de usuario del email
        const userData = {
          userName: userName, // Añadir el userName extraído
          nom: this.firstName,
          cognom: this.lastName,
          email: this.email,
          password: this.password,
        };

        try {
          // Hacer el POST al backend
          const response = await fetch(`${API_URL}./addUser`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          const result = await response.json();

          if (response.ok) {
            // Usuario creado exitosamente
            this.message = result.message;
            this.messageType = "success";
            this.$emit('switch-to-login'); // Redirigir al login
          } else {
            // Mostrar errores del servidor
            this.message = result.error || "Error al crear la cuenta.";
            this.messageType = "error";
          }
        } catch (error) {
          console.error("Error al conectar con el servidor:", error);
          this.message = "Hubo un problema al crear la cuenta.";
          this.messageType = "error";
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

.message-container {
  margin-bottom: 20px;
  text-align: center;
}
</style>