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
const createDB = require(path.join(__dirname, 'configDB.js'));
const mongoose = require('mongoose');
const Resultado = require('./models/valors');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');


// Configuración del servidor
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json()); // Middleware para manejar JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


/* ---------------------------- CONEXIÓN A LA BASE DE DATOS ---------------------------- */
(async () => {
  await createDB();
})();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 28800, // Timeout de conexión
  wait_timeout: 28800,
  ConnectionLifeTime: 28800
                              
});


mongoose.connect('mongodb+srv://a23ikedelgra:a23ikedelgra@estadistiques.nj1ar.mongodb.net/valores')
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB Atlas:', error);
  });


/* ---------------------------- FUNCIONES AUXILIARES ---------------------------- */
async function getAlumnos(codigo) {
  try {
    // Realizar la consulta para obtener la partida por código
    const [rows] = await pool.query('SELECT alumnos FROM partida WHERE codigo = ?', [codigo]);
   
    // Verificar si la partida existe
    if (rows.length === 0) {
      return null; // Retorna null si no se encuentra la partida
    }


    // Obtener el campo alumnos
    let alumnos = rows[0].alumnos;


    // Verificar si el campo alumnos está presente
    if (!alumnos) {
      return []; // Retorna un array vacío si no hay alumnos
    }


    // Si alumnos es una cadena JSON, parsearlo
    if (typeof alumnos === 'string') {
      try {
        alumnos = JSON.parse(alumnos);
      } catch (error) {
        console.error('Error al parsear alumnos:', error);
        return []; // Retorna un array vacío si hay un error de parseo
      }
    }


    // Verificar si los datos de alumnos son un arreglo
    if (!Array.isArray(alumnos)) {
      console.error('Los datos de alumnos no son un array');
      return []; // Retorna un array vacío si los datos no son un array
    }


    return alumnos;


  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    throw new Error('Hubo un error al obtener los alumnos');
  }
}

const createPartida = async () => {
  const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
  await pool.query('INSERT INTO partida (codigo, alumnos) VALUES (?, ?)', [codigo, JSON.stringify([])]);
  return codigo;
};

app.post('/start-game', async (req, res) => {
  const { codigo } = req.body; // Código de la partida

  if (!codigo) {
    return res.status(400).json({ error: 'El código de partida es obligatorio.' });
  }

  try {
    // Ejecutar la actualización en la base de datos
    const [result] = await pool.query(
      'UPDATE partida SET en_juego = ? WHERE codigo = ?',
      [true, codigo]
    );

    // Verificar si se encontró y actualizó alguna fila
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Código de partida no encontrado o ya en juego.' });
    }

    return res.status(200).json({ message: 'El juego ha comenzado.', codigo });
  } catch (err) {
    console.error('Error al actualizar la base de datos:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

//eliminar nombre de partida
app.delete('/eliminar-name', (req, res) => {
  const { codigo_partida, nameToDelete } = req.body; // Se espera un JSON con codigo_partida y nameToDelete

  // Verificamos si los datos fueron enviados
  if (!codigo_partida || !nameToDelete) {
    return res.status(400).json({ error: 'Faltan parámetros codigo_partida o nameToDelete' });
  }

  // Consultar el JSON para asegurarse de que existe la partida con ese código
  const queryGetJson = 'SELECT alumnos FROM partida WHERE codigo = ?';
  
  pool.query(queryGetJson, [codigo_partida], (err, results) => {
    if (err) {
      console.error('Error al obtener los datos:', err);
      return res.status(500).json({ error: 'Error al obtener los datos' });
    }

    // Verificamos si se obtuvo un resultado
    if (results.length === 0) {
      return res.status(404).json({ message: 'Partida no encontrada con ese código' });
    }

    // Obtenemos el JSON de la columna
    const columnaJson = results[0].columna_json;

    // Si el JSON no contiene el nombre a eliminar, devolver un error
    const nameIndex = columnaJson.findIndex(item => item.name === nameToDelete);
    
    if (nameIndex === -1) {
      return res.status(404).json({ message: 'Nombre no encontrado en el JSON' });
    }

    // Si se encuentra el nombre, eliminamos el objeto con ese nombre
    columnaJson.splice(nameIndex, 1); // Elimina el objeto con el 'name' específico

    // Actualizamos la columna_json en la base de datos
    const queryUpdateJson = 'UPDATE partida SET alumnos = ? WHERE codigo = ?';
    
    pool.query(queryUpdateJson, [JSON.stringify(columnaJson), codigo_partida], (err, result) => {
      if (err) {
        console.error('Error al actualizar el JSON:', err);
        return res.status(500).json({ error: 'Error al actualizar el JSON' });
      }

      // Emitir evento para actualizar lista de usuarios en el cliente
      socket.emit('user-removed', { codigo: codigo_partida, userId: nameToDelete });

      // Verificamos si se afectaron filas
      if (result.affectedRows > 0) {
        return res.json({ message: 'Nombre eliminado exitosamente' });
      } else {
        return res.status(404).json({ message: 'No se pudo eliminar el nombre' });
      }
    });
  });
});

// Ruta para eliminar un alumno de la partida
app.post('/remove-alumno', async (req, res) => {
  const { codigo, alumnoName } = req.body;

  try {
    let alumnos = await getAlumnos(codigo);
    if (alumnos === null) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Filtrar el alumno que se desea eliminar por su nombre
    alumnos = alumnos.filter(alumno => alumno.name !== alumnoName);

    // Actualizar la partida en la base de datos
    await pool.query('UPDATE partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);

    // Emitir evento a todos los participantes de la partida
    io.to(codigo).emit('update-alumnos', alumnos);

    res.json({ success: true, message: 'Alumno eliminado de la partida' });
  } catch (error) {
    console.error('Error al eliminar alumno de la partida:', error);
    res.status(500).json({ error: 'Hubo un error al eliminar al alumno' });
  }
});

/* ---------------------------- RUTAS DE ALUMNOS ---------------------------- */
app.get('/alumno/:email', async (req, res) => {
  try {
    // Obtener el email del alumno desde la URL
    const email = req.params.email;  // Usamos `email` en lugar de `idAlumno`
  
    // Realizar la consulta a la base de datos para obtener el alumno por email
    const [results] = await pool.execute('SELECT email, nom FROM usuarios WHERE email = ?', [email]);
  
    // Verificar si se encontró el alumno
    if (results.length > 0) {
      // Si se encuentra al alumno, devolver el email y el nombre
      res.json({
        email: results[0].email,
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
app.get('/alumno/:id', async (req, res) => {
  try {
    // Obtener el ID del alumno desde la URL
    const idAlumno = req.params.id;

    // Crear conexión a la base de datos de manera asíncrona
   

    // Realizar la consulta a la base de datos para obtener el alumno por ID
    const [results] = await pool.execute('SELECT id, nom FROM usuarios WHERE id = ?', [idAlumno]);

   

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
      const [results] = await pool.execute('SELECT  nom FROM usuarios');
 
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
      INSERT INTO usuarios (nom, cognom, email, password, fecha, profesor)
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


      const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);


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
});


/* ---------------------------- RUTAS DE PARTIDAS ---------------------------- */


// Obtener o crear código de partida
app.get('/game-code', async (req, res) => {
  const { codigo } = req.query;
  try {
    const alumnos = await getAlumnos(codigo);
    if (alumnos === null) {
      // La partida no existe, crear una nueva
      const newCodigo = await createPartida();
      res.json({ message: 'Nueva partida creada.', gameCode: newCodigo });
    } else {
      // La partida existe
      res.json({ message: 'Partida encontrada.', gameCode: codigo });
    }
  } catch (error) {
    console.error('Error en /game-code:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Obtener alumnos de una partida
app.get('/alumnos', async (req, res) => {
  const { codigo } = req.query;
  try {
    const alumnos = await getAlumnos(codigo);
    if (alumnos === null) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    res.json(alumnos);
  } catch (error) {
    console.error('Error en /alumnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Actualizar partida con un nuevo alumno
app.post('/update-partida', async (req, res) => {
  const { codigo, usuario } = req.body;


  try {
    let alumnos = await getAlumnos(codigo);
    if (alumnos === null) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }


    if (!alumnos.some(alumno => alumno.name === usuario)) {
      alumnos.push({ name: usuario });


      // Actualizar la partida en la base de datos
      await pool.query('UPDATE partida SET alumnos = ? WHERE codigo = ?', [JSON.stringify(alumnos), codigo]);


      // Emitir evento para notificar a los demás participantes
      io.to(codigo).emit('new-participant', { usuario, codigo });


      res.json({ success: true, message: 'Partida actualizada' });
    } else {
      res.status(400).json({ success: false, message: 'El usuario ya está en la partida' });
    }
  } catch (error) {
    console.error('Error al actualizar la partida:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar la partida' });
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
    const [alumno] = await pool.execute('SELECT id FROM usuarios WHERE nom = ?', [nombreAlumno]);


    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }


    const alumno_id = alumno[0].id;


    // Buscar si el alumno ya tiene estadísticas en la tabla `Estadisticas`
    const [estadisticas] = await pool.execute('SELECT * FROM estadisticas WHERE usuario_id = ?', [alumno_id]);


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
      await pool.execute('UPDATE estadisticas SET valores = ? WHERE usuario_id = ?', [JSON.stringify(resultadosActualizados), alumno_id]);
    } else {
      // Si no tiene estadísticas, creamos un nuevo registro
      const valoresIniciales = [{ preguntaId, dificultad, esCorrecto, nombreAlumno, tipoPregunta }];
      await pool.execute('INSERT INTO estadisticas (usuario_id, valores) VALUES (?, ?)', [alumno_id, JSON.stringify(valoresIniciales)]);
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
    const [alumno] = await pool.execute('SELECT id FROM usuarios WHERE nom = ?', [nombreAlumno]);


    if (alumno.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }


    const alumno_id = alumno[0].id;


    // Buscar las estadísticas del alumno en la tabla `Estadisticas`
    const [estadisticas] = await pool.execute('SELECT * FROM estadisticas WHERE usuario_id = ?', [alumno_id]);


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
 
     
      const [alumno] = await pool.execute('SELECT id FROM usuarios WHERE nom = ?', [nombreAlumno]);
 
      if (alumno.length === 0) {
        return res.status(404).json({ mensaje: 'Alumno no encontrado' });
      }
 
      const alumno_id = alumno[0].id;
      const [estadisticas] = await pool.execute(
        'SELECT * FROM estadisticas WHERE usuario_id = ?',
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
    const [preguntas] = await pool.query('SELECT * FROM pregunta');
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
      const [results] = await pool.execute('SELECT * FROM pregunta ORDER BY RAND() LIMIT 1');


 
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
        INSERT INTO pregunta (text_pregunta, difficulty_level, respuesta_correcta, type)
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
        UPDATE pregunta
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


      const query = 'DELETE FROM pregunta WHERE id = ?';
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




  /* ---------------------------- API AULAS ---------------------------- */
  // Obtener todas las aulas
app.get('/api/aulas', async (req, res) => {
    try {
        const [aulas] = await pool.query('SELECT * FROM aulas');
        res.json({
            success: true,
            aulas: aulas.map(aula => ({
                nombre: aula.nombre,
                alumnos: aula.alumnos // Devolvemos los alumnos directamente sin procesar
            }))
        });
    } catch (error) {
        console.error('Error al obtener las aulas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las aulas.' });
    }
});




  // Crear una nueva aula
  app.post('/api/aulas', async (req, res) => {
    try {
        const { nombre, alumnos } = req.body;


        if (!nombre || !alumnos || !Array.isArray(alumnos)) {
            return res.status(400).json({ success: false, message: 'El nombre del aula y una lista de alumnos son obligatorios.' });
        }


        const query = 'INSERT INTO aulas (nombre, alumnos) VALUES (?, ?)';
        const values = [nombre, JSON.stringify(alumnos)];


        await pool.execute(query, values);


        res.status(201).json({ success: true, message: 'Aula creada correctamente.' });
    } catch (error) {
        console.error('Error al crear el aula:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'El aula ya existe.' });
        } else {
            res.status(500).json({ success: false, message: 'Error al crear el aula.' });
        }
    }
  });


  // Actualizar un aula existente
  app.put('/api/aulas/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;
        const { alumnos } = req.body;


        if (!alumnos || !Array.isArray(alumnos)) {
            return res.status(400).json({ success: false, message: 'La lista de alumnos es obligatoria.' });
        }


        const query = 'UPDATE aulas SET alumnos = ? WHERE nombre = ?';
        const values = [JSON.stringify(alumnos), nombre];


        const [result] = await pool.execute(query, values);


        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Aula no encontrada.' });
        }


        res.json({ success: true, message: 'Aula actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el aula:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el aula.' });
    }
  });


  // Eliminar un aula
  app.delete('/api/aulas/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;


        const query = 'DELETE FROM aulas WHERE nombre = ?';
        const [result] = await pool.execute(query, [nombre]);


        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Aula no encontrada.' });
        }


        res.json({ success: true, message: 'Aula eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el aula:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el aula.' });
    }
  });


  // Obtener los alumnos de un aula específica
  app.get('/api/aulas/:nombre/alumnos', async (req, res) => {
    try {
        const { nombre } = req.params;


        const [rows] = await pool.query('SELECT alumnos FROM aulas WHERE nombre = ?', [nombre]);


        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Aula no encontrada.' });
        }


        const alumnos = JSON.parse(rows[0].alumnos);
        res.json({ success: true, alumnos });
    } catch (error) {
        console.error('Error al obtener los alumnos del aula:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los alumnos del aula.' });
    }
  });








/* ---------------------------- API USUARIOS ---------------------------- */


// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los usuarios.' });
  }
});


// Obtener un usuario por su ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);


    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }


    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el usuario.', error: error.message });
  }
});


// Crear un nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const { nom, cognom, email, password, profesor } = req.body;


    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }


    const query = `INSERT INTO usuarios (nom, cognom, email, password, profesor) VALUES (?, ?, ?, ?, ?)`;
    const values = [nom, cognom, email, password, profesor];


    const [result] = await pool.execute(query, values);
    res.status(201).json({ success: true, message: 'Usuario creado correctamente.', userId: result.insertId });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear el usuario.', error: error.message });
  }
});


// Actualizar un usuario
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, cognom, email, password } = req.body;


    if (!nom || !cognom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }


    const query = `UPDATE usuarios SET nom = ?, cognom = ?, email = ?, password = ? WHERE id = ?`;
    const values = [nom, cognom, email, password, id];


    const [result] = await pool.execute(query, values);


    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }


    res.json({ success: true, message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario.', error: error.message });
  }
});


app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;


    // Primero elimina las relaciones en las tablas Aulas y Partida
    // Eliminar al usuario de los campos 'alumnos' en Aulas
    await pool.execute('UPDATE aulas SET alumnos = JSON_REMOVE(alumnos, JSON_UNQUOTE(JSON_SEARCH(alumnos, "one", ?))) WHERE JSON_CONTAINS(alumnos, ?)', [id, JSON.stringify([id])]);


    // Eliminar al usuario de los campos 'alumnos' en Partida
    await pool.execute('UPDATE partida SET alumnos = JSON_REMOVE(alumnos, JSON_UNQUOTE(JSON_SEARCH(alumnos, "one", ?))) WHERE JSON_CONTAINS(alumnos, ?)', [id, JSON.stringify([id])]);


    // Luego elimina los registros en la tabla Estadisticas si existen
    await pool.execute('DELETE FROM estadisticas WHERE usuario_id = ?', [id]);


    // Finalmente, elimina el usuario de la tabla Usuarios
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);


    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }


    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario.', error: error.message });
  }
});
// Configuración de Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});


  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

      // Escucha el evento `updateCarril` desde los jugadores
      socket.on('updateCarril', (carril, nombre, avatar, bombas, multiplicadores) => {
        console.log('Datos recibidos del cliente:', { carril, nombre, avatar, bombas, multiplicadores });
        io.emit('updateCarril', carril, nombre, avatar, bombas, multiplicadores);  // Emitir el evento a todos los sockets
      });
    

    socket.on('join-room', async ({ codigo }) => {
      const partida = await getAlumnos(codigo);
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
    socket.on('game-started', (data) => {
      io.emit('game-started', data);  // Emitir el evento a todos los sockets
    });
  });


/* ---------------------------- TAREAS PERIÓDICAS ---------------------------- */
setInterval(async () => {
  try {
    const [partidas] = await pool.query('SELECT codigo, alumnos FROM partida');
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


/* ---------------------------- INICIAR SERVIDOR ---------------------------- */
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
