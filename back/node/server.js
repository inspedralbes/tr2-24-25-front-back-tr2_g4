/* ---------------------------- CONSTANTES ---------------------------- */
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');
const createDB = require(path.join(__dirname, 'configDB.js'));
const enviarCodigoAlCorreo = require('./emailService');
const app = express();
const port = process.env.PORT;

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
// CREAR UNA BASE DE DATOS
//(async () => {
  //await createDB();
//})();

// Crear pool de conexiones para manejar la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware para CORS
app.use(cors());

// Middleware para manejar JSON y datos enviados en formularios
app.use(express.json()); // Analiza cuerpos JSON
app.use(express.urlencoded({ extended: true })); // Analiza cuerpos URL-encoded

/* ---------------------------- SERVIDOR CON SOCKET.IO ---------------------------- */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cambiar según necesidades de seguridad
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

/* ---------------------------- RUTAS ---------------------------- */

// Añadir usuario
app.post('/addUser', async (req, res) => {
  try {
    const { nom, cognom, email, password } = req.body;

    // Validar que los campos requeridos están presentes
    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Expresiones regulares para determinar si el usuario es alumno o profesor
    const alumnoRegex = /^a\d{2}/i; // Correo que empieza con 'a' seguido de dos números
    const profesorRegex = /^[a-zA-Z]+$/; // Correo que contiene solo letras antes del '@'

    let profesor = false;

    // Determinar el tipo de usuario
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

    // Consulta SQL para insertar en la tabla Usuarios
    const query = `
      INSERT INTO Usuarios (nom, cognom, email, password, fecha, profesor) 
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?)
    `;
    const values = [nom, cognom, email, password, profesor];

    // Ejecutar la consulta
    const [result] = await pool.execute(query, values);

    // Responder con éxito
    res.json({
      success: true,
      message: `Usuario ${email} añadido correctamente como ${profesor ? 'profesor' : 'alumno'}.`,
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Error al añadir usuario:', error);
    res.status(500).json({ success: false, message: 'Error al añadir usuario.', error: error.message });
  }
});

// Ruta de ejemplo para obtener correos (ya existente en tu código)
app.get('/getEmails', async (req, res) => {
  try {
    const [alumnos] = await pool.execute('SELECT email FROM Usuarios WHERE profesor = 0');
    const [profesores] = await pool.execute('SELECT email FROM Usuarios WHERE profesor = 1');

    const emails = [
      ...alumnos.map((alumno) => alumno.email),
      ...profesores.map((profesor) => profesor.email),
    ];

    res.json(emails);
  } catch (error) {
    console.error('Error al obtener los correos:', error);
    res.status(500).json({ message: 'Error al obtener los correos', error: error.message });
  }
});
// Ruta para login (verificar usuario y contraseña)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se han enviado los campos de email y contraseña
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos.' });
    }

    // Consulta SQL para verificar si existe el usuario con el correo proporcionado
    const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);

    // Si no se encuentra el usuario con ese correo
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Correo no registrado.' });
    }

    // El usuario existe, pero ahora debemos verificar la contraseña
    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    // Si la contraseña es correcta, podemos retornar una respuesta de éxito
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
});


// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
