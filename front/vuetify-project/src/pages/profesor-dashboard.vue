<template>
  <div class="layout">
    <!-- Sidebar Navigation -->
    
    <nav class="sidebar">
      <ul>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="/favicon.ico" width="40" height="40" alt="Logo">
          <h1 style="margin: 0;">-MATHS</h1>
        </div>
      </ul>
      <ul>
        <li @click="loadComponent('AdminPreguntas')">
          <i class="icon">📝</i> Preguntas
        </li>
        <li @click="loadComponent('AdminUsuarios')">
          <i class="icon">👥</i> Usuarios
        </li>
        <li @click="loadComponent('AdminAulas')">
          <i class="icon">🏫</i> Aulas
        </li>
        <li @click="loadComponent('Estadisticas')">
          <i class="icon">📊</i> Estadísticas
        </li>
      </ul>

      <!-- Botón para Crear Partida debajo del nav -->
      <li @click="irACrearPartida" class="crear-partida-btn">
        <v-icon class="red--text" large>mdi-plus</v-icon> Crear Partida
      </li>

    </nav>

    <!-- Main Content Area -->
    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminPreguntas from '@/components/AdminPreguntas.vue';
import AdminUsuarios from '@/components/AdminUsuarios.vue';
import AdminAulas from '@/components/AdminAulas.vue';
import Estadisticas from '@/components/Estadisticas.vue';

const router = useRouter();
const currentComponent = ref(AdminPreguntas);

const loadComponent = (componentName) => {
  switch (componentName) {
    case 'AdminPreguntas':
      currentComponent.value = AdminPreguntas;
      break;
    case 'AdminUsuarios':
      currentComponent.value = AdminUsuarios;
      break;
    case 'AdminAulas':
      currentComponent.value = AdminAulas;
      break;
    case 'Estadisticas':
      currentComponent.value = Estadisticas;
      break;
    default:
      currentComponent.value = AdminPreguntas;
  }
};

const irACrearPartida = () => {
  router.push('/crear-partida'); // Redirige a la ruta de Crear Partida
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(45deg, #6a85b6, #8e9eab); /* Fondo suave de gradiente */
}

.sidebar {
  width: 250px;
  background-color: #2f3b52;
  color: white;
  padding: 2rem;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative; /* Necesario para posicionar el botón de forma absoluta */
}

.sidebar ul {
  list-style: none;
  padding: 0;
  width: 100%;
}

.sidebar li {
  display: flex;
  align-items: center;
  padding: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-radius: 8px;
}

.sidebar li:hover {
  background-color: #3c4a63;
  transform: scale(1.05);
}

.sidebar li .icon {
  margin-right: 12px;
  font-size: 1.5rem;
}

.sidebar .crear-partida-btn {
  position: absolute;
  bottom: 20px; /* Lo coloca a la parte inferior del nav */
  left: 5%; /* Lo coloca centrado horizontalmente */
  
  display: flex;
  align-items: center;
  justify-content: center; /* Centrado del contenido del botón */
  padding: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-radius: 8px;
  background-color: #4CAF50; /* Fondo verde */
  width: calc(100% - 40px); /* Asegura que el botón no sobresalga y se quede dentro del nav */
}

.sidebar .crear-partida-btn:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.sidebar .crear-partida-btn .red {
  color: red; /* Color rojo para el emoji de más */
}

.content {
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 2rem;
}
</style>