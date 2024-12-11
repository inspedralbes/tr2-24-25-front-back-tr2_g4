/* ---------------------------- CONSTANTES ---------------------------- */
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuración del servidor y base de datos
const app = express();
const port = process.env.PORT ;

app.use(cors());
app.use(express.json()); // Middleware para manejar JSON

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // Timeout de conexión
  debug: true // Activa el modo debug
});

// Funciones auxiliares de partida
const getPartida = async (codigo) => {
  const [rows] = await pool.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  return rows.length > 0 ? { ...rows[0], alumnos: JSON.parse(rows[0].alumnos) } : null;
};

const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await pool.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};

// Función de registro de usuario
const addUser = async (req, res) => {
  try {
    const { nom, cognom, email, password } = req.body;

    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Expresiones regulares para determinar si el usuario es alumno o profesor
    const alumnoRegex = /^a\d{2}/i; // Correo que empieza con 'a' seguido de dos números
    const profesorRegex = /^[a-zA-Z]+$/; // Correo que contiene solo letras antes del '@'

    let profesor = false;

    if (alumnoRegex.test(email.split('@')[0])) {
      profesor = false; // Es un alumno
    } else if (profesorRegex.test(email.split('@')[0])) {
      profesor = true; // Es un profesor
    } else {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo no corresponde ni a un alumno ni a un profesor.',
      });
    }

    // Cifrar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Consulta SQL para insertar en la tabla Usuarios
    const query = `
      INSERT INTO Usuarios (nom, cognom, email, password, fecha, profesor) 
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?)
    `;
    const values = [nom, cognom, email, hashedPassword, profesor];

    // Ejecutar la consulta
    const [result] = await pool.execute(query, values);

    res.json({
      success: true,
      message: `Usuario ${email} añadido correctamente como ${profesor ? 'profesor' : 'alumno'}.`,
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Error al añadir usuario:', error);
    res.status(500).json({ success: false, message: 'Error al añadir usuario.', error: error.message });
  }
};

// Función de login de usuario
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos.' });
    }

    const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Correo no registrado.' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    res.json({
      success: true,
      message: 'Usuario autenticado correctamente.',
      userId: user.id,
      nom: user.nom,
      cognom: user.cognom,
      email: user.email,
      profesor: user.profesor
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión.', error: error.message });
  }
};

// Rutas API de juego
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

// Rutas API de usuarios
app.post('/addUser', addUser);
app.post('/login', loginUser);

// Configuración de Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Mapa para guardar los últimos alumnos consultados por cada partida
const lastAlumnosByCodigo = new Map();

// Intervalo para verificar actualizaciones
setInterval(async () => {
  const [partidas] = await pool.query('SELECT codigo, alumnos FROM Partida');
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
