/* ---------------------------- CONSTANTES ---------------------------- */
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const createDB = require(path.join(__dirname, 'configDB.js'));
const app = express();
const port = process.env.PORT;

// Middleware para JSON y CORS
app.use(cors());
app.use(express.json());

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
const dataConnection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
};

// Crear un pool de conexiones
const dbPool = mysql.createPool(dataConnection);

// Probar conexión inicial
const connectDB = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log('Conexión exitosa a la base de datos');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

connectDB();

/* ---------------------------- FUNCIONES AUXILIARES ---------------------------- */
const getPartida = async (codigo) => {
  const connection = await dbPool;
  const [rows] = await connection.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  return rows.length > 0 ? rows[0] : null;
};

const createPartida = async () => {
  const codigo = generateGameCode(); // Genera un código único para la partida
  const alumnos = []; // Lista inicial de alumnos vacía

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

// Ruta para verificar o crear una partida
app.get('/game-code', async (req, res) => {
  try {
    const gameCode = req.query.codigo; // Código recibido desde el cliente
    const partida = await getPartida(gameCode);

    if (!partida) {
      // Si no existe la partida, retorna un error 404 con JSON
      return res.status(404).json({ message: 'Partida no encontrada.' });
    }

    // Si existe la partida, retorna un mensaje de éxito
    res.json({ message: 'Partida encontrada.', gameCode });
  } catch (error) {
    console.error('Error en /game-code:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/* ---------------------------- SERVIDOR CON SOCKET.IO ---------------------------- */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Cambiar según necesidades de seguridad
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
