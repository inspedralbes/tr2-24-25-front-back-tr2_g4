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
const app = express();
const mongoose = require('mongoose');
const port = process.env.PORT;
const Resultado = require('./models/valors');
const { spawn } = require('child_process');

/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
// CREAR UNA BASE DE DATOS
//(async () => {
//  await createDB();
//})();

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

connectDB();

mongoose.connect('mongodb+srv://a23ikedelgra:a23ikedelgra@estadistiques.nj1ar.mongodb.net/valores')
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB Atlas:', error);
  });


// Middleware para CORS
app.use(cors()); 
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});
app.get('/alumno/:id', async (req, res) => {
  try {
    // Obtener el ID del alumno desde la URL
    const idAlumno = req.params.id;

    // Crear conexión a la base de datos de manera asíncrona
    const connection = await mysql.createConnection(dataConnection);

    // Realizar la consulta a la base de datos para obtener el alumno por ID
    const [results] = await connection.execute('SELECT id, nom FROM alumnos WHERE id = ?', [idAlumno]);

    // Cerrar la conexión después de la consulta
    await connection.end();

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
app.get('/preguntas', async (req, res) => {
  try {
    // Crear conexión a la base de datos
    const connection = await mysql.createConnection(dataConnection);

    // Realizar consulta a la base de datos
    const [results] = await connection.execute('SELECT * FROM pregunta ORDER BY RAND() LIMIT 1');

    // Cerrar la conexión después de la consulta
    await connection.end();

    // Enviar las preguntas como respuesta
    res.json(results);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).send('Error al obtener las preguntas');
  }
});


// Ruta para guardar resultados
app.post('/guardar-resultado', async (req, res) => {
  const { preguntaId, dificultad, esCorrecto, nombreAlumno } = req.body;

  console.log('Datos recibidos:', req.body);

  try {
    // Validar los datos recibidos
    if (!preguntaId || !dificultad || esCorrecto === undefined || !nombreAlumno) {
      return res.status(400).json({
        mensaje: 'Datos incompletos',
        detalles: 'Faltan los siguientes campos: ' +
                  (preguntaId ? '' : 'preguntaId, ') +
                  (dificultad ? '' : 'dificultad, ') +
                  (esCorrecto === undefined ? 'esCorrecto, ' : '') +
                  (nombreAlumno ? '' : 'nombreAlumno')
      });
    }

    // Guardar el resultado en MongoDB (como lo estás haciendo)
    const nuevoResultado = new Resultado({
      preguntaId,
      dificultad,
      esCorrecto,
      nombreAlumno,
    });
    await nuevoResultado.save();

    // Crear conexión a MySQL
    const connection = await mysql.createConnection(dataConnection);

    // Obtener el id del alumno (suponiendo que tienes una tabla de alumnos)
    const [alumno] = await connection.execute('SELECT id FROM alumnos WHERE nom = ?', [nombreAlumno]);

    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    const alumno_id = alumno[0].id;

    // Buscar si el alumno ya tiene estadísticas en la tabla `Estadisticas`
    const [estadisticas] = await connection.execute('SELECT * FROM estadisticas WHERE alumno_id = ?', [alumno_id]);

    if (estadisticas.length > 0) {
      // Si el alumno ya tiene estadísticas, actualizamos el campo `valores`
      const resultadosActualizados = JSON.parse(estadisticas[0].valores);  // Parseamos el JSON almacenado
      resultadosActualizados.push({ preguntaId, dificultad, esCorrecto, nombreAlumno});

      // Actualizamos la base de datos con los nuevos resultados
      await connection.execute('UPDATE estadisticas SET valores = ? WHERE alumno_id = ?', [JSON.stringify(resultadosActualizados), alumno_id]);
    } else {
      // Si no tiene estadísticas, creamos un nuevo registro
      const valoresIniciales = [{ preguntaId, dificultad, esCorrecto }];
      await connection.execute('INSERT INTO estadisticas (alumno_id, valores) VALUES (?, ?)', [alumno_id, JSON.stringify(valoresIniciales)]);
    }

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
    const connection = await mysql.createConnection(dataConnection);

    // Obtener el id del alumno (suponiendo que tienes una tabla de alumnos)
    const [alumno] = await connection.execute('SELECT id FROM alumnos WHERE nom = ?', [nombreAlumno]);

    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    const alumno_id = alumno[0].id;

    // Buscar las estadísticas del alumno en la tabla `Estadisticas`
    const [estadisticas] = await connection.execute('SELECT * FROM estadisticas WHERE alumno_id = ?', [alumno_id]);

    if (estadisticas.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron estadísticas para el alumno ${nombreAlumno}`,
      });
    }

    // Obtener los resultados almacenados en JSON
    const resultados = JSON.parse(estadisticas[0].valores);

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
        imagen: `/static/${nombreAlumno}-graph.png`, // Ruta del gráfico generado
      });
    });
  } catch (error) {
    console.error('Error al obtener los resultados:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


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

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
