/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import { routes as autoRoutes } from 'vue-router/auto-routes'; // Renombramos 'routes' a 'autoRoutes' para evitar conflicto
import UserPlayCode from '@/components/UserPlayCode.vue';
import UserPlayWaiting from '@/components/UserPlayWaiting.vue';
import CrearPartida from '@/components/LoadingPartida.vue';
import LoginPage from '@/components/LoginForm.vue';
import CarrilJugador from '@/components/CarrilJugador.vue';  // Importa el componente de login
import CarrilesCarrera from '@/components/CarrilesCarrera.vue';

// Combina las rutas automáticas con las manuales
const routes = [
  ...autoRoutes, // Incluye las rutas automáticas
  {
    path: '/',
    name: 'Home',
    component: UserPlayCode, // La pantalla inicial para ingresar el código
  },
  {
    path: '/UserPlayWaiting/:codigo',
    name: 'UserPlayWaiting',
    component: UserPlayWaiting, // La pantalla de espera
    props: true, // Habilita el paso de props desde la URL
  },
  {
    path: '/login',   // Ruta para login
    name: 'Login',
    component: LoginPage,  // Componente de login
  },
  {
    path: '/crear-partida',
    name: 'CrearPartida',
    component: CrearPartida, // Componente para la pantalla de "Crear Partida"
  },
  {
    path: '/carrilescarrera/:codigo',
    name: 'CarrilesCarrera',
    component: CarrilesCarrera, // Componente para la pantalla del carril del jugador
  },
  {
    path: '/carriljugador/:codigo',
    name: 'CarrilJugador',
    component: CarrilJugador, // Componente para la pantalla del carril del jugador
  }

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
