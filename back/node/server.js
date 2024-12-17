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
const mongoose = require('mongoose');
const Resultado = require('./models/valors');
const { spawn } = require('child_process');

// Configuración del servidor
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json()); // Middleware para manejar JSON
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
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

mongoose.connect('mongodb+srv://a23ikedelgra:a23ikedelgra@estadistiques.nj1ar.mongodb.net/valores')
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB Atlas:', error);
  });

/* ---------------------------- FUNCIONES AUXILIARES ---------------------------- */
const getPartida = async (codigo) => {
  const [rows] = await pool.query('SELECT * FROM Partida WHERE codigo = ?', [codigo]);
  if (rows.length === 0) {
    return null;
  }

  let alumnos = [];
  try {
    alumnos = rows[0].alumnos ? JSON.parse(rows[0].alumnos) : [];
  } catch (error) {
    console.error("Error al parsear los alumnos", error);
    alumnos = [];
  }

  return { ...rows[0], alumnos };
};

const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await pool.query('INSERT INTO Partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};
/* ---------------------------- RUTAS DE ALUMNOS ---------------------------- */
app.get('/alumno/:id', async (req, res) => {
    try {
      // Obtener el ID del alumno desde la URL
      const idAlumno = req.params.id;
  
      // Crear conexión a la base de datos de manera asíncrona
      
  
      // Realizar la consulta a la base de datos para obtener el alumno por ID
      const [results] = await pool.execute('SELECT id, nom FROM Usuarios WHERE id = ?', [idAlumno]);
  
     
  
      // Verificar si se encontró el alumno
      if (results.length > 0) {
        // Si se encuentra al alumno, devolver el id y el nombre
        res.json({
          id: results[0].id,
          nom: results[0].nom
        });
      } else {
        // Si no se encuentra el alumno, devolver un error 404
        res.status(404).json({ error: 'Alumno no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener el alumno:', error);
      res.status(500).send('Error al obtener el alumno');
    }
  });
  app.get('/api/alumnos', async (req, res) => {
    try {
 
      // Realizar la consulta para obtener los correos electrónicos y nombres
      const [results] = await pool.execute('SELECT  nom FROM Usuarios');
  
      // Enviar la lista de alumnos como respuesta en formato JSON
      res.json(results);
    } catch (error) {
      console.error('Error al obtener la lista de alumnos:', error);
  
      // Responder con un mensaje de error si algo falla
      res.status(500).json({
        mensaje: 'Error al obtener la lista de alumnos',
        error: error.message,
      });
    }
  });
/* ---------------------------- RUTAS DE USUARIOS ---------------------------- */

// Crear un usuario
app.post('/addUser', async (req, res) => {
  try {
    const { nom, cognom, email, password } = req.body;

    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const alumnoRegex = /^a\d{2}/i;
    const profesorRegex = /^[a-zA-Z]+$/;

    let profesor = false;
    if (alumnoRegex.test(email.split('@')[0])) {
      profesor = false;
    } else if (profesorRegex.test(email.split('@')[0])) {
      profesor = true;
    } else {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo no corresponde ni a un alumno ni a un profesor.',
      });
    }

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
});

// Login de usuario
app.post('/login', async (req, res) => {
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
});

/* ---------------------------- RUTAS DE PARTIDAS ---------------------------- */

// Obtener o crear código de partida
app.get('/game-code', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  const gameCode = partida ? codigo : await createPartida();
  res.json({ message: partida ? 'Partida encontrada.' : 'Nueva partida creada.', gameCode });
});

// Obtener alumnos de una partida
app.get('/alumnos', async (req, res) => {
  const { codigo } = req.query;
  const partida = await getPartida(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }
  res.json(partida.alumnos);
});

// Actualizar partida con un nuevo alumno
app.post('/update-partida', async (req, res) => {
  const { codigo, usuario } = req.body;
  const partida = await getPartida(codigo);
  if (!partida) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const alumnos = partida.alumnos || [];

  if (!alumnos.some(alumno => alumno.name === usuario)) {
    alumnos.push({ name: usuario });
    await pool.query('UPDATE Partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);
    io.to(codigo).emit('new-participant', { usuario, codigo });
    return res.json({ success: true, message: 'Partida actualizada' });
  } else {
    return res.status(400).json({ success: false, message: 'El usuario ya está en la partida' });
  }
});
/* ---------------------------- RUTAS DE ESTADISTICAS ---------------------------- */
app.post('/guardar-resultado', async (req, res) => {
  const { preguntaId, dificultad, esCorrecto, nombreAlumno, tipoPregunta } = req.body;

  // Verificar si el cuerpo de la solicitud está vacío
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ mensaje: 'Cuerpo de la solicitud vacío' });
  }

  console.log('Datos recibidos:', req.body);

  try {
    // Validar los datos recibidos
    if (!preguntaId || !dificultad || esCorrecto === undefined || !nombreAlumno || !tipoPregunta) {
      return res.status(400).json({
        mensaje: 'Datos incompletos',
        detalles: 'Faltan los siguientes campos: ' +
                  (preguntaId ? '' : 'preguntaId, ') +
                  (dificultad ? '' : 'dificultad, ') +
                  (esCorrecto === undefined ? 'esCorrecto, ' : '') +
                  (nombreAlumno ? '' : 'nombreAlumno') +
                  (tipoPregunta ? '' : 'tipoPregunta')
      });
    }

    // Guardar el resultado en MongoDB (como lo estás haciendo)
    const nuevoResultado = new Resultado({
      preguntaId,
      dificultad,
      esCorrecto,
      nombreAlumno,
      tipoPregunta,
    });
    await nuevoResultado.save();

    // Crear conexión a MySQL

    // Obtener el id del alumno (suponiendo que tienes una tabla de alumnos)
    const [alumno] = await pool.execute('SELECT id FROM Usuarios WHERE nom = ?', [nombreAlumno]);

    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    const alumno_id = alumno[0].id;

    // Buscar si el alumno ya tiene estadísticas en la tabla `Estadisticas`
    const [estadisticas] = await pool.execute('SELECT * FROM Estadisticas WHERE usuario_id = ?', [alumno_id]);

    let resultadosActualizados = [];

    if (estadisticas.length > 0) {
      // Verificamos si el campo `valores` ya está en formato JSON (cadena JSON)
      const valores = estadisticas[0].valores;

      // Si el campo `valores` es un objeto (lo que indica que ya fue deserializado anteriormente)
      if (typeof valores === 'object') {
        // Usamos directamente el objeto si ya está deserializado
        resultadosActualizados = valores;
      } else {
        // Si no es un objeto, intentamos parsearlo como JSON
        try {
          resultadosActualizados = JSON.parse(valores);
        } catch (error) {
          console.error('Error al parsear el JSON de estadísticas:', error);
          resultadosActualizados = [];  // Si no se puede parsear, inicializamos un arreglo vacío
        }
      }

      // Agregar el nuevo resultado a los resultados existentes
      resultadosActualizados.push({ preguntaId, dificultad, esCorrecto, nombreAlumno, tipoPregunta });

      // Actualizamos la base de datos con los nuevos resultados (NO sobrescribimos, solo agregamos al final)
      await pool.execute('UPDATE Estadisticas SET valores = ? WHERE usuario_id = ?', [JSON.stringify(resultadosActualizados), alumno_id]);
    } else {
      // Si no tiene estadísticas, creamos un nuevo registro
      const valoresIniciales = [{ preguntaId, dificultad, esCorrecto, nombreAlumno, tipoPregunta }];
      await pool.execute('INSERT INTO Estadisticas (usuario_id, valores) VALUES (?, ?)', [alumno_id, JSON.stringify(valoresIniciales)]);
    }

    // Enviar respuesta de éxito
    res.status(201).json({ mensaje: 'Resultado guardado exitosamente' });
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


app.get('/resultados/:nombreAlumno', async (req, res) => {
  const { nombreAlumno } = req.params;

  try {
    // Validar que el nombre del alumno esté presente
    if (!nombreAlumno) {
      return res.status(400).json({
        mensaje: 'El nombre del alumno es requerido',
      });
    }

    // Crear conexión a MySQL

    // Obtener el id del alumno (suponiendo que tienes una tabla de alumnos)
    const [alumno] = await pool.execute('SELECT id FROM Usuarios WHERE nom = ?', [nombreAlumno]);

    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    const alumno_id = alumno[0].id;

    // Buscar las estadísticas del alumno en la tabla `Estadisticas`
    const [estadisticas] = await pool.execute('SELECT * FROM Estadisticas WHERE usuario_id = ?', [alumno_id]);

    if (estadisticas.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron estadísticas para el alumno ${nombreAlumno}`,
      });
    }

    // Verificamos si 'valores' es una cadena JSON o ya es un objeto
    let resultados = estadisticas[0].valores;

    // Si 'valores' es una cadena, la parseamos
    if (typeof resultados === 'string') {
      try {
        resultados = JSON.parse(resultados);
      } catch (error) {
        console.error('Error al parsear el JSON:', error);
        return res.status(500).json({
          mensaje: 'Error al procesar los resultados del alumno',
        });
      }
    } 

    // Si 'valores' ya es un objeto, lo usamos directamente
    if (typeof resultados !== 'object') {
      return res.status(500).json({
        mensaje: 'El campo valores no contiene datos válidos',
      });
    }

    // Procesar los resultados para el script Python
    const resultadosString = JSON.stringify(resultados);

    // Ejecutar el script Python con `spawn`
    const pythonProcess = spawn('py', [
      '../python/estadisticaAlumno.py', // Ruta al script Python
      nombreAlumno,
      resultadosString,
    ]);

    let pythonOutput = '';

    // Recoger la salida del script Python
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    // Manejar errores del script Python
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error en el script Python: ${data}`);
    });

    // Finalizar el proceso y responder al cliente
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          mensaje: 'El script Python terminó con errores',
        });
      }

      console.log(`Salida del script Python: ${pythonOutput}`);
      res.status(200).json({
        mensaje: 'Resultados obtenidos y gráfico generado con éxito',
        resultados, // Devolvemos los resultados
        imagen: `http://localhost:3000/${nombreAlumno}-graph.png`, // Ruta del gráfico generado
      });
    });
  } catch (error) {
    console.error('Error al obtener los resultados:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

  
  app.get('/resultados/:nombreAlumno/:tipoPregunta', async (req, res) => { 
    const { nombreAlumno, tipoPregunta } = req.params;
  
    try {
      if (!nombreAlumno || !tipoPregunta) {
        return res.status(400).json({ mensaje: 'El nombre del alumno y el tipo de problema son requeridos' });
      }
  
      
      const [alumno] = await pool.execute('SELECT id FROM Usuarios WHERE nom = ?', [nombreAlumno]);
  
      if (alumno.length === 0) {
        return res.status(404).json({ mensaje: 'Alumno no encontrado' });
      }
  
      const alumno_id = alumno[0].id;
      const [estadisticas] = await pool.execute(
        'SELECT * FROM Estadisticas WHERE usuario_id = ?',
        [alumno_id]
      );
  
      if (estadisticas.length === 0) {
        return res.status(404).json({ mensaje: `No se encontraron estadísticas para el alumno ${nombreAlumno}` });
      }
  
      // Aquí parseamos los valores del JSON
      const resultados = JSON.parse(estadisticas[0].valores);
  
      // Filtramos los resultados por el tipo de pregunta (suma, resta, multiplicación, división)
      const resultadosFiltrados = resultados.filter((resultado) => resultado.tipoPregunta === tipoPregunta);
  
      if (resultadosFiltrados.length === 0) {
        return res.status(404).json({ mensaje: `No se encontraron resultados para el tipo de pregunta: ${tipoPregunta}` });
      }
  
      // Ahora ejecutamos el script Python
      const resultadosString = JSON.stringify(resultadosFiltrados);
  
      const pythonProcess = spawn('py', [
        '../python/estadisticaAlumnoTipo.py',  // Ruta del script Python
        nombreAlumno,
        tipoPregunta,
        resultadosString,
      ]);
  
      let pythonOutput = '';
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Error en el script Python: ${data}`);
      });
  
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return res.status(500).json({ mensaje: 'Error al generar el gráfico' });
        }
  
        res.status(200).json({
          imagen: `http://localhost:3000/${nombreAlumno}-${tipoPregunta}-graph.png`,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  });
  
/* ---------------------------- RUTAS DE PREGUNTAS ---------------------------- */

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
 
//JUEGO DADO PREGUNTA
app.get('/preguntas', async (req, res) => {
    try {

      // Realizar consulta a la base de datos
      const [results] = await pool.execute('SELECT * FROM Pregunta ORDER BY RAND() LIMIT 1');

  
      // Enviar las preguntas como respuesta
      res.json(results);
    } catch (error) {
      console.error('Error al obtener las preguntas:', error);
      res.status(500).send('Error al obtener las preguntas');
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

/* ---------------------------- SOCKET.IO ---------------------------- */
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
    socket.emit('update-alumnos', partida.alumnos);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  socket.on('new-participant', ({ usuario, codigo }) => {
    io.to(codigo).emit('new-participant', { usuario, codigo });
  });
});

/* ---------------------------- TAREAS PERIÓDICAS ---------------------------- */
setInterval(async () => {
  try {
    const [partidas] = await pool.query('SELECT codigo, alumnos FROM Partida');
    partidas.forEach((partida) => {
      const codigo = partida.codigo;
      let alumnos = [];

      try {
        if (typeof partida.alumnos === 'string' && partida.alumnos.trim() !== '') {
          alumnos = JSON.parse(partida.alumnos);
        } else if (Array.isArray(partida.alumnos)) {
          alumnos = partida.alumnos;
        }
      } catch (error) {
        console.error("Error al parsear alumnos en setInterval", error);
        alumnos = [];
      }

      io.to(codigo).emit('update-alumnos', alumnos);
    });
  } catch (error) {
    console.error("Error al actualizar lista de participantes:", error);
  }
}, 1000);

/* ---------------------------- INICIAR SERVIDOR ---------------------------- */
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
