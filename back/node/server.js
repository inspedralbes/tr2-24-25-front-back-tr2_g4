const mysql = require('mysql2/promise');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');

// Configuración del servidor
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dataConnection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
};

const dbPool = mysql.createPool(dataConnection);

// Funciones auxiliares
const getPartida = async (codigo) => {
  const [rows] = await dbPool.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  return rows.length > 0 ? { ...rows[0], alumnos: JSON.parse(rows[0].alumnos) } : null;
};

const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await dbPool.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};

// Rutas API
app.get('/game-code', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  const gameCode = partida ? codigo : await createPartida();
  res.json({ gameCode });
});

app.get('/alumnos', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }
  res.json(partida.alumnos);
});

// Configuración de Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Mapa para guardar los últimos alumnos consultados por cada partida
const lastAlumnosByCodigo = new Map();

// Intervalo para verificar actualizaciones
setInterval(async () => {
  const [partidas] = await dbPool.query('SELECT codigo, alumnos FROM Partida');
  partidas.forEach((partida) => {
    const codigo = partida.codigo;
    const alumnos = JSON.parse(partida.alumnos);

    const lastAlumnos = lastAlumnosByCodigo.get(codigo) || [];
    if (JSON.stringify(lastAlumnos) !== JSON.stringify(alumnos)) {
      lastAlumnosByCodigo.set(codigo, alumnos); // Actualiza el cache
      io.to(codigo).emit('update_alumnos', alumnos); // Envía actualizaciones solo si hay cambios
    }
  });
}, 1000); // Verifica actualizaciones cada 1 segundo

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Unirse a una sala específica
  socket.on('join_room', async ({ codigo }) => {
    const partida = await getPartida(codigo);
    if (!partida) {
      return socket.emit('error', 'Código de partida no válido');
    }
    socket.join(codigo); // El cliente se une al room basado en el código
    console.log(`Cliente ${socket.id} se unió a la sala ${codigo}`);
    socket.emit('update_alumnos', partida.alumnos); // Enviar estado inicial de alumnos
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
