CREATE TABLE Pregunta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text_pregunta VARCHAR(255) NOT NULL,
    difficulty_level TINYINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    respuesta_correcta VARCHAR(255) NOT NULL,
    type ENUM('suma', 'resta', 'division', 'multiplicacion') NOT NULL
);

CREATE TABLE Alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cognom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    idioma VARCHAR(50) NOT NULL
);

CREATE TABLE Aulas (
    nombre VARCHAR(100) PRIMARY KEY,
    alumnos JSON NOT NULL
);

CREATE TABLE Partida (
    codigo VARCHAR(100) PRIMARY KEY,
    alumnos JSON NOT NULL
);

CREATE TABLE Profesor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cognom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fecha DATE NOT NULL
);

CREATE TABLE Estadisticas (
    alumno_id INT PRIMARY KEY,
    valores JSON,
    FOREIGN KEY (alumno_id) REFERENCES Alumnos(id)
);

/*Valores
-----------
alumno_id FK 
pregunta_id FK
respuesta boolean
dif_pregunta (1-5)
*/