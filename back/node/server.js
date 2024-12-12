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

//(async () => {
//await createDB();
//})();

// Configuración del servidor
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json()); // Middleware para manejar JSON

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
// CREAR UNA BASE DE DATOS
//(async () => {
  //await createDB();
//})();


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
});


// Funciones auxiliares
const getPartida = async (codigo) => {
  const [rows] = await pool.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  if (rows.length === 0) {
    return null;
  }

  let alumnos = [];
  try {
    // Verifica si 'alumnos' tiene un valor y si es un JSON válido
    alumnos = rows[0].alumnos ? JSON.parse(rows[0].alumnos) : [];
  } catch (error) {
    console.error("Error al parsear los alumnos", error);
    alumnos = []; // Si no se puede parsear, asigna un array vacío
  }

  return { ...rows[0], alumnos };
};

const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await pool.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};

// Función para agregar un usuario
const addUser = async (req, res) => {
  try {
    const { nom, cognom, email, password } = req.body;

    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

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

    // Aquí ya no se encripta la contraseña, simplemente se guarda tal cual
    const query = `
      INSERT INTO Usuarios (nom, cognom, email, password, fecha, profesor) 
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?)
    `;
    const values = [nom, cognom, email, password, profesor];

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

    // Log de los datos que se van a enviar para el login
    console.log("Intentando iniciar sesión con los siguientes datos:", { email, password });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos.' });
    }

    const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Correo no registrado.' });
    }

    const user = rows[0];
    // Aquí ya no se compara la contraseña encriptada, se verifica si coinciden directamente
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    res.json({
      success: true,
      message: 'Usuario autenticado correctamente.',
      userId: user.id,
      nom: user.nom,
      cognom: user.cognom,
      email: user.email,
      profesor: user.profesor,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión.', error: error.message });
  }
};

// Ruta para obtener el código de la partida o crear uno nuevo
app.get('/game-code', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  const gameCode = partida ? codigo : await createPartida();
  res.json({ message: partida ? 'Partida encontrada.' : 'Nueva partida creada.', gameCode });
});

// Ruta para obtener los alumnos de una partida
app.get('/alumnos', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }
  res.json(partida.alumnos);
});

// Ruta para actualizar la partida con un nuevo alumno
app.post('/update-partida', async (req, res) => {
  const { codigo, usuario } = req.body;
  const partida = await getPartida(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const alumnos = partida.alumnos || [];

  if (!alumnos.some(alumno => alumno.name === usuario)) {
    alumnos.push({ name: usuario }); // Agregar el nuevo alumno a la lista
    await pool.query('UPDATE Partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);
    io.to(codigo).emit('new-participant', { usuario, codigo });
    return res.json({ success: true, message: 'Partida actualizada' });
  } else {
    return res.status(400).json({ success: false, message: 'El usuario ya está en la partida' });
  }
});

// Rutas API de usuarios
app.post('/addUser', addUser);
app.post('/login', loginUser);



// Rutas para manejar las preguntas en la API


// Obtener todas las preguntas
app.get('/api/preguntas', async (req, res) => {
  try {
    const [preguntas] = await pool.query('SELECT * FROM Pregunta');
    res.json(preguntas);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las preguntas.' });
  }
});

// Crear una nueva pregunta
app.post('/api/preguntas', async (req, res) => {
  try {
    const { text_pregunta, difficulty_level, respuesta_correcta, type } = req.body;

    if (!text_pregunta || !difficulty_level || !respuesta_correcta || !type) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }

    const query = `
      INSERT INTO Pregunta (text_pregunta, difficulty_level, respuesta_correcta, type)
      VALUES (?, ?, ?, ?)
    `;
    const values = [text_pregunta, difficulty_level, respuesta_correcta, type];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      success: true,
      message: 'Pregunta creada correctamente.',
      preguntaId: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    res.status(500).json({ success: false, message: 'Error al crear la pregunta.' });
  }
});

// Actualizar una pregunta existente
app.put('/api/preguntas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text_pregunta, difficulty_level, respuesta_correcta, type } = req.body;

    if (!text_pregunta || !difficulty_level || !respuesta_correcta || !type) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }

    const query = `
      UPDATE Pregunta
      SET text_pregunta = ?, difficulty_level = ?, respuesta_correcta = ?, type = ?
      WHERE id = ?
    `;
    const values = [text_pregunta, difficulty_level, respuesta_correcta, type, id];

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pregunta no encontrada.' });
    }

    res.json({
      success: true,
      message: 'Pregunta actualizada correctamente.',
    });
  } catch (error) {
    console.error('Error al actualizar la pregunta:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la pregunta.' });
  }
});

// Eliminar una pregunta
app.delete('/api/preguntas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM Pregunta WHERE id = ?';
    const [result] = await pool.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pregunta no encontrada.' });
    }

    res.json({
      success: true,
      message: 'Pregunta eliminada correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar la pregunta:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la pregunta.' });
  }
});



























// Configuración de Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join-room', async ({ codigo }) => {
    const partida = await getPartida(codigo);
    if (!partida) {
      return socket.emit('error', 'Código de partida no válido');
    }

    socket.join(codigo);
    console.log(`Cliente ${socket.id} se unió a la sala ${codigo}`);
    socket.emit('update-alumnos', partida.alumnos); // Enviar estado inicial de alumnos
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  socket.on('new-participant', ({ usuario, codigo }) => {
    io.to(codigo).emit('new-participant', { usuario, codigo });
  });
});

// Verificar la lista de participantes en la base de datos periódicamente
setInterval(async () => {
  try {
    const [partidas] = await pool.query('SELECT codigo, alumnos FROM Partida');
    partidas.forEach((partida) => {
      const codigo = partida.codigo;
      let alumnos = [];

      try {
        // Asegurarse de que 'alumnos' sea una cadena antes de intentar parsearlo
        if (typeof partida.alumnos === 'string' && partida.alumnos.trim() !== '') {
          alumnos = JSON.parse(partida.alumnos); // Parsear solo si es una cadena
        } else if (Array.isArray(partida.alumnos)) {
          alumnos = partida.alumnos; // Si 'alumnos' ya es un array, no lo parseamos
        }
      } catch (error) {
        console.error("Error al parsear alumnos en setInterval", error);
        alumnos = []; // En caso de error, asignar un array vacío
      }

      io.to(codigo).emit('update-alumnos', alumnos); // Emitir actualización de los alumnos a todos los miembros de la sala
    });
  } catch (error) {
    console.error("Error al actualizar lista de participantes:", error);
  }
}, 1000);


// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
