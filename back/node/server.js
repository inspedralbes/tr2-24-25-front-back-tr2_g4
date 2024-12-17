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
const bodyParser = require('body-parser');

//(async () => {
//await createDB();
//})();

// Configuración del servidor
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json()); // Middleware para manejar JSON
app.use(bodyParser.json());

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
  connectTimeout: 10000 // Timeout de conexión
});

// Funciones auxiliares
async function getAlumnos(codigo) {
  try {
    // Realizar la consulta para obtener la partida por código
    const [partida] = await pool.query('SELECT alumnos FROM Partida WHERE codigo = ?', [codigo]);
    
    // Verificar si la partida existe
    if (!partida || partida.length === 0) {
      throw new Error('Partida no encontrada');
    }

    // Obtener el campo alumnos (en formato JSON si está guardado correctamente)
    const alumnos = partida[0].alumnos;

    // Verificar si el campo alumnos está presente
    if (!alumnos) {
      throw new Error('La partida no tiene alumnos');
    }

    // Verificar si los datos de alumnos son un arreglo
    if (!Array.isArray(alumnos)) {
      throw new Error('Los datos de los alumnos están malformados');
    }

    return alumnos;
  } catch (error) {
    throw new Error(error.message || 'Hubo un error al obtener los alumnos');
  }
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
  const partida = await getAlumnos(codigo);
  const gameCode = partida ? codigo : await createPartida();
  res.json({ message: partida ? 'Partida encontrada.' : 'Nueva partida creada.', gameCode });
});

// Ruta para obtener los alumnos de una partida
app.get('/alumnos', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getAlumnos(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }
  res.json(partida.alumnos);
});

// Ruta para actualizar la partida con un nuevo alumno

app.post('/update-partida', async (req, res) => {
  const { codigo, usuario } = req.body;

  try {
    // Obtener los alumnos de la partida con el código proporcionado
    const alumnos = await getAlumnos(codigo);

    // Verificar si el usuario ya está en la partida
    if (!alumnos.some(alumno => alumno.name === usuario)) {
      // Agregar el nuevo alumno al arreglo de alumnos
      alumnos.push({ name: usuario });

      // Actualizar la partida en la base de datos con el nuevo arreglo de alumnos
      console.log("Los alumnos nuevos son: " + JSON.stringify(alumnos));

      await pool.query('UPDATE Partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);

      // Emitir un evento para notificar a los demás participantes sobre el nuevo participante
      io.to(codigo).emit('new-participant', { usuario, codigo });

      return res.json({ success: true, message: 'Partida actualizada' });
    } else {
      return res.status(400).json({ success: false, message: 'El usuario ya está en la partida' });
    }
  } catch (error) {
    // Manejo de errores
    console.error(error);
    return res.status(500).json({ error: 'Hubo un error al actualizar la partida' });
  }
});






//User Pinia

const login = async () => {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirige a la pantalla principal
    this.$router.push('/main-screen');
  } else {
    this.error = data.message;
  }
};



// Rutas API de usuarios
app.post('/addUser', addUser);
app.post('/login', loginUser);

// Configuración de Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join-room', async ({ codigo }) => {
    const partida = await getAlumnos(codigo);
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
