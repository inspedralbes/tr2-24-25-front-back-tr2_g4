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

  console.log('Datos recibidos:', req.body); // Verifica qué datos llegan al backend

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

    // Crear un nuevo resultado
    const nuevoResultado = new Resultado({
      preguntaId,
      dificultad,
      esCorrecto,
      nombreAlumno,
    });
    await nuevoResultado.save(); // Guardar en MongoDB

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

    // Buscar los resultados en la base de datos
    const resultados = await Resultado.find({ nombreAlumno });

    // Validar si se encontraron resultados
    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron resultados para el alumno ${nombreAlumno}`,
      });
    }

    // Procesar los resultados para el script Python
    const resultadosString = JSON.stringify(resultados);

    // Ejecutar el script Python con `spawn`
    const pythonProcess = spawn('py', [
      '../python/estadisticaAlumno.py', // Nombre del script Python
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
        resultados,
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
