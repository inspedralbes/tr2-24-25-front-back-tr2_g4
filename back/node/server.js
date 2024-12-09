/* ---------------------------- CONSTANTES ---------------------------- */
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const createDB = require(path.join(__dirname, 'configDB.js'));
const enviarCodigoAlCorreo = require('./emailService');
const app = express();
const port = process.env.PORT;

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
// CREAR UNA BASE DE DATOS
(async () => {
  await createDB();
})();

// CONEXIÓN A LA BASE DE DATOS
const dataConnection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true
};

// Establecer conexión a MySQL
const connectDB = async () => {
  try {
    const connection = await mysql.createConnection(dataConnection);
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

//connectDB();

// Middleware para CORS
app.use(cors()); 


// Ruta básica


/* ---------------------------- SERVIDOR CON SOCKET.IO ---------------------------- */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cambiar según necesidades de seguridad
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

/* ---------------------------- RUTAS ---------------------------- */
app.post('/enviar-codigo', async (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
      return res.status(400).json({ success: false, message: 'Correo y código son requeridos.' });
  }

  const resultado = await enviarCodigoAlCorreo(correo, codigo);

  if (resultado.success) {
      res.status(200).json({ success: true, message: resultado.message });
  } else {
      res.status(500).json({ success: false, message: resultado.message });
  }
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
