<template>
  <div class="layout">
    <nav>
      <ul>
        <li @click="loadComponent('AdminPreguntas')">Preguntas</li>
        <li @click="loadComponent('AdminUsuarios')">Usuarios</li>
        <li @click="loadComponent('AdminAulas')">Aulas</li>
        <li @click="loadComponent('Estadisticas')">Estadísticas</li>
      </ul>
    </nav>

    <main class="content">
      <component :is="currentComponent" />
    </main>

    <button class="crear-partida-btn" @click="irACrearPartida">Crear Partida</button>
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

<style>
.layout {
  display: flex;
  height: 100vh;
}

nav {
  width: 200px;
  background-color: #333;
  color: white;
  padding: 1rem;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav li {
  margin-bottom: 1rem;
  cursor: pointer;
}

nav li:hover {
  text-decoration: underline;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.crear-partida-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.crear-partida-btn:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
