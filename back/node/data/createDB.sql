CREATE TABLE pregunta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text_pregunta VARCHAR(255) NOT NULL,
    difficulty_level TINYINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    respuesta_correcta VARCHAR(255) NOT NULL,
    type ENUM('suma', 'resta', 'division', 'multiplicacion') NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cognom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR (100) NOT NULL,
    fecha DATE NOT NULL,
    profesor boolean
);

CREATE TABLE aulas (
    nombre VARCHAR(100) PRIMARY KEY,
    alumnos JSON NOT NULL
);

CREATE TABLE partida (
    codigo VARCHAR(100) PRIMARY KEY,
    alumnos JSON NOT NULL,
    en_juego boolean   
);


CREATE TABLE estadisticas (
    usuario_id INT PRIMARY KEY,
    valores JSON,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

/*Valores
-----------
alumno_id FK 
pregunta_id FK
respuesta boolean
dif_pregunta (1-5)
*/