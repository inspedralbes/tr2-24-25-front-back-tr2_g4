/* ---------------------------- CONSTANTES ---------------------------- */
const mysql = require('mysql2/promise');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');
const createDB = require(path.join(__dirname, 'configDB.js'));

// Configuración de la app
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Inicializar la base de datos
(async () => {
  await createDB();
})();

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
const dataConnection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true
};

// Crear una conexión a la base de datos
const connectDB = async () => {
  try {
    const pool = mysql.createPool(dataConnection);
    console.log('Conexión exitosa a la base de datos');
    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
};

const dbPool = connectDB();

/* ---------------------------- FUNCIONES AUXILIARES ---------------------------- */
const getPartida = async (codigo) => {
  const connection = await dbPool;
  const [rows] = await connection.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  return rows.length > 0 ? rows[0] : null;
};

const createPartida = async () => {
  const codigo = generateGameCode(); // Genera un código único para la partida
  const alumnos = [];

  const connection = await dbPool;
  await connection.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify(alumnos)]);
  return codigo;
};

const generateGameCode = () => {
  // Generar un código de 6 caracteres al azar
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

const updatePartidaAlumnos = async (codigo, alumnos) => {
  const connection = await dbPool;
  await connection.query('UPDATE Partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);
};

/* ---------------------------- RUTAS ---------------------------- */
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.get('/game-code', async (req, res) => {
  let gameCode = req.query.codigo;

  // Buscar la partida con el código proporcionado
  const partida = await getPartida(gameCode);
  if (!partida) {
    // Si no se encuentra la partida, se crea una nueva
    gameCode = await createPartida();
  }

  res.json({ gameCode });
});

/* ---------------------------- SOCKET.IO ---------------------------- */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Unirse a una partida
  socket.on('join_partida', async ({ codigo, alumno }) => {
    try {
      const partida = await getPartida(codigo);
      if (!partida) {
        socket.emit('error', 'Código de partida no válido');
        return;
      }

      const alumnos = JSON.parse(partida.alumnos);
      alumnos.push(alumno);
      await updatePartidaAlumnos(codigo, alumnos);

      io.emit('update_alumnos', alumnos); // Notificar a todos los clientes
    } catch (error) {
      console.error(error);
      socket.emit('error', 'Error al unirse a la partida');
    }
  });

  // Eliminar alumno
  socket.on('remove_alumno', async ({ codigo, alumnoId }) => {
    try {
      const partida = await getPartida(codigo);
      if (!partida) {
        socket.emit('error', 'Código de partida no válido');
        return;
      }

      const alumnos = JSON.parse(partida.alumnos);
      const updatedAlumnos = alumnos.filter(a => a.id !== alumnoId);
      await updatePartidaAlumnos(codigo, updatedAlumnos);

      io.emit('update_alumnos', updatedAlumnos); // Notificar a todos los clientes
    } catch (error) {
      console.error(error);
      socket.emit('error', 'Error al eliminar alumno');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

/* ---------------------------- INICIAR SERVIDOR ---------------------------- */
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
