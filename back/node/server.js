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

// Actualizar la partida con un nuevo alumno
const updatePartida = async (codigo, usuario) => {
  // Obtener la partida existente
  const partida = await getPartida(codigo);
  if (!partida) {
    return { success: false, message: 'Partida no encontrada' };
  }

  // Si la partida existe, se actualiza la lista de alumnos
  const alumnos = partida.alumnos || [];

  // Verificar si el usuario ya está en la lista
  if (!alumnos.some(alumno => alumno.name === usuario)) {
    alumnos.push({ name: usuario }); // Agregar el nuevo alumno a la lista
    await dbPool.query('UPDATE Partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);
    return { success: true, message: 'Partida actualizada' };
  } else {
    return { success: false, message: 'El usuario ya está en la partida' };
  }
};

// Rutas API
app.get('/game-code', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  const gameCode = partida ? codigo : await createPartida();
  res.json({ message: partida ? 'Partida encontrada.' : 'Nueva partida creada.', gameCode });
});

// Ruta para actualizar la partida con un nuevo alumno
app.post('/update-partida', async (req, res) => {
  const { codigo, usuario } = req.body;
  const result = await updatePartida(codigo, usuario);
  if (result.success) {
    res.json({ success: true, message: 'Partida actualizada' });
    io.to(codigo).emit('new-participant', { usuario, codigo }); // Emitir evento a todos los usuarios en la partida
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// Función auxiliar para crear una partida (si no existe)
const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await dbPool.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};

// Iniciar servidor
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Unirse a la sala de juego
  socket.on('join-room', async ({ codigo }) => {
    const partida = await getPartida(codigo);
    if (!partida) {
      return socket.emit('error', 'Código de partida no válido');
    }

    socket.join(codigo); // El cliente se une a la sala de su código de partida
    console.log(`Usuario se unió al código: ${codigo}`);
    socket.emit('update-alumnos', partida.alumnos); // Enviar estado inicial de alumnos
  });

  // Manejar la desconexión de un cliente
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });

  // Escuchar eventos de nuevos participantes
  socket.on('new-participant', ({ usuario, codigo }) => {
    io.to(codigo).emit('new-participant', { usuario, codigo });
  });
});

// Verificar la lista de participantes en la base de datos periódicamente
setInterval(async () => {
  const [partidas] = await dbPool.query('SELECT codigo, alumnos FROM Partida');
  partidas.forEach((partida) => {
    const codigo = partida.codigo;
    const alumnos = JSON.parse(partida.alumnos);

    io.to(codigo).emit('update-alumnos', alumnos); // Emitir actualización de alumnos a todos los miembros de la sala
  });
}, 1000); // Verifica las actualizaciones cada 1 segundo

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
