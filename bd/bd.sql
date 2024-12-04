-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-12-2024 a las 08:39:09
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `juegomatesdb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `aula_name` varchar(100) DEFAULT NULL,
  `idioma` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula`
--

CREATE TABLE `aula` (
  `nombre` varchar(100) NOT NULL,
  `idioma` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula_alumnos`
--

CREATE TABLE `aula_alumnos` (
  `nombre_aula` varchar(100) NOT NULL,
  `id_alumno` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partida`
--

CREATE TABLE `partida` (
  `codigo` varchar(100) NOT NULL,
  `id_alumno` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pregunta`
--

CREATE TABLE `pregunta` (
  `id` int(11) NOT NULL,
  `text_pregunta` varchar(255) DEFAULT NULL,
  `difficulty_level` int(11) DEFAULT NULL CHECK (`difficulty_level` between 1 and 5),
  `respuesta_correcta` varchar(255) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pregunta`
--

INSERT INTO `pregunta` (`id`, `text_pregunta`, `difficulty_level`, `respuesta_correcta`, `tipo`) VALUES
(1, '¿Cuánto es 2 + 2?', 1, '4', 'suma'),
(2, '¿Cuánto es 1 + 1?', 1, '2', 'suma'),
(3, '¿Cuánto es 5 - 3?', 1, '2', 'resta'),
(4, '¿Cuánto es 3 - 1?', 1, '2', 'resta'),
(5, '¿Cuánto es 1 x 1?', 1, '1', 'multiplicacion'),
(6, '¿Cuánto es 2 x 2?', 1, '4', 'multiplicacion'),
(7, '¿Cuánto es 6 ÷ 2?', 1, '3', 'division'),
(8, '¿Cuánto es 4 ÷ 2?', 1, '2', 'division'),
(9, '¿Cuánto es 3 + 2?', 1, '5', 'suma'),
(10, '¿Cuánto es 7 - 5?', 1, '2', 'resta'),
(11, '¿Cuánto es 5 + 3?', 1, '8', 'suma'),
(12, '¿Cuánto es 6 - 4?', 1, '2', 'resta'),
(13, '¿Cuánto es 2 x 3?', 1, '6', 'multiplicacion'),
(14, '¿Cuánto es 9 ÷ 3?', 1, '3', 'division'),
(15, '¿Cuánto es 8 + 1?', 1, '9', 'suma'),
(16, '¿Cuánto es 3 + 3?', 1, '6', 'suma'),
(17, '¿Cuánto es 7 ÷ 7?', 1, '1', 'division'),
(18, '¿Cuánto es 1 + 3?', 1, '4', 'suma'),
(19, '¿Cuánto es 4 - 2?', 1, '2', 'resta'),
(20, '¿Cuánto es 2 x 1?', 1, '2', 'multiplicacion'),
(21, '¿Cuánto es 7 + 5?', 2, '12', 'suma'),
(22, '¿Cuánto es 8 + 4?', 2, '12', 'suma'),
(23, '¿Cuánto es 9 - 4?', 2, '5', 'resta'),
(24, '¿Cuánto es 10 - 6?', 2, '4', 'resta'),
(25, '¿Cuánto es 2 x 3?', 2, '6', 'multiplicacion'),
(26, '¿Cuánto es 3 x 4?', 2, '12', 'multiplicacion'),
(27, '¿Cuánto es 10 ÷ 5?', 2, '2', 'division'),
(28, '¿Cuánto es 8 ÷ 4?', 2, '2', 'division'),
(29, '¿Cuánto es 6 + 6?', 2, '12', 'suma'),
(30, '¿Cuánto es 11 - 5?', 2, '6', 'resta'),
(31, '¿Cuánto es 5 x 2?', 2, '10', 'multiplicacion'),
(32, '¿Cuánto es 9 ÷ 3?', 2, '3', 'division'),
(33, '¿Cuánto es 12 - 3?', 2, '9', 'resta'),
(34, '¿Cuánto es 7 x 1?', 2, '7', 'multiplicacion'),
(35, '¿Cuánto es 10 ÷ 2?', 2, '5', 'division'),
(36, '¿Cuánto es 4 + 8?', 2, '12', 'suma'),
(37, '¿Cuánto es 6 + 5?', 2, '11', 'suma'),
(38, '¿Cuánto es 14 - 7?', 2, '7', 'resta'),
(39, '¿Cuánto es 3 x 3?', 2, '9', 'multiplicacion'),
(40, '¿Cuánto es 15 ÷ 5?', 2, '3', 'division'),
(41, '¿Cuánto es 15 + 8?', 3, '23', 'suma'),
(42, '¿Cuánto es 14 + 9?', 3, '23', 'suma'),
(43, '¿Cuánto es 20 - 7?', 3, '13', 'resta'),
(44, '¿Cuánto es 18 - 5?', 3, '13', 'resta'),
(45, '¿Cuánto es 4 x 5?', 3, '20', 'multiplicacion'),
(46, '¿Cuánto es 6 x 3?', 3, '18', 'multiplicacion'),
(47, '¿Cuánto es 18 ÷ 3?', 3, '6', 'division'),
(48, '¿Cuánto es 21 ÷ 7?', 3, '3', 'division'),
(49, '¿Cuánto es 25 + 6?', 3, '31', 'suma'),
(50, '¿Cuánto es 30 - 12?', 3, '18', 'resta'),
(51, '¿Cuánto es 5 x 6?', 3, '30', 'multiplicacion'),
(52, '¿Cuánto es 24 ÷ 6?', 3, '4', 'division'),
(53, '¿Cuánto es 7 x 4?', 3, '28', 'multiplicacion'),
(54, '¿Cuánto es 40 ÷ 5?', 3, '8', 'division'),
(55, '¿Cuánto es 8 + 15?', 3, '23', 'suma'),
(56, '¿Cuánto es 27 - 8?', 3, '19', 'resta'),
(57, '¿Cuánto es 10 x 3?', 3, '30', 'multiplicacion'),
(58, '¿Cuánto es 35 ÷ 7?', 3, '5', 'division'),
(59, '¿Cuánto es 12 + 18?', 3, '30', 'suma'),
(60, '¿Cuánto es 22 - 9?', 3, '13', 'resta'),
(61, '¿Cuánto es 45 + 28?', 4, '73', 'suma'),
(62, '¿Cuánto es 38 + 24?', 4, '62', 'suma'),
(63, '¿Cuánto es 50 - 18?', 4, '32', 'resta'),
(64, '¿Cuánto es 47 - 19?', 4, '28', 'resta'),
(65, '¿Cuánto es 6 x 7?', 4, '42', 'multiplicacion'),
(66, '¿Cuánto es 9 x 6?', 4, '54', 'multiplicacion'),
(67, '¿Cuánto es 56 ÷ 8?', 4, '7', 'division'),
(68, '¿Cuánto es 72 ÷ 9?', 4, '8', 'division'),
(69, '¿Cuánto es 64 + 17?', 4, '81', 'suma'),
(70, '¿Cuánto es 83 - 31?', 4, '52', 'resta'),
(71, '¿Cuánto es 8 x 8?', 4, '64', 'multiplicacion'),
(72, '¿Cuánto es 81 ÷ 9?', 4, '9', 'division'),
(73, '¿Cuánto es 7 x 9?', 4, '63', 'multiplicacion'),
(74, '¿Cuánto es 99 ÷ 11?', 4, '9', 'division'),
(75, '¿Cuánto es 54 + 36?', 4, '90', 'suma'),
(76, '¿Cuánto es 70 - 29?', 4, '41', 'resta'),
(77, '¿Cuánto es 9 x 8?', 4, '72', 'multiplicacion'),
(78, '¿Cuánto es 108 ÷ 12?', 4, '9', 'division'),
(79, '¿Cuánto es 63 + 18?', 4, '81', 'suma'),
(80, '¿Cuánto es 50 - 23?', 4, '27', 'resta'),
(81, '¿Cuánto es 123 + 45?', 5, '168', 'suma'),
(82, '¿Cuánto es 135 + 67?', 5, '202', 'suma'),
(83, '¿Cuánto es 95 - 38?', 5, '57', 'resta'),
(84, '¿Cuánto es 87 - 43?', 5, '44', 'resta'),
(85, '¿Cuánto es 12 x 8?', 5, '96', 'multiplicacion'),
(86, '¿Cuánto es 11 x 9?', 5, '99', 'multiplicacion'),
(87, '¿Cuánto es 144 ÷ 12?', 5, '12', 'division'),
(88, '¿Cuánto es 132 ÷ 11?', 5, '12', 'division'),
(89, '¿Cuánto es 76 + 58?', 5, '134', 'suma'),
(90, '¿Cuánto es 150 - 67?', 5, '83', 'resta'),
(91, '¿Cuánto es 14 x 6?', 5, '84', 'multiplicacion'),
(92, '¿Cuánto es 120 ÷ 10?', 5, '12', 'division'),
(93, '¿Cuánto es 16 x 7?', 5, '112', 'multiplicacion'),
(94, '¿Cuánto es 192 ÷ 16?', 5, '12', 'division'),
(95, '¿Cuánto es 89 + 76?', 5, '165', 'suma'),
(96, '¿Cuánto es 200 - 123?', 5, '77', 'resta'),
(97, '¿Cuánto es 13 x 9?', 5, '117', 'multiplicacion'),
(98, '¿Cuánto es 144 ÷ 9?', 5, '16', 'division'),
(99, '¿Cuánto es 88 + 44?', 5, '132', 'suma'),
(100, '¿Cuánto es 111 - 55?', 5, '56', 'resta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesor`
--

CREATE TABLE `profesor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valores`
--

CREATE TABLE `valores` (
  `id` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `respuesta` tinyint(1) NOT NULL,
  `difficulty_level` int(11) DEFAULT NULL CHECK (`difficulty_level` between 1 and 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aula_name` (`aula_name`);

--
-- Indices de la tabla `aula`
--
ALTER TABLE `aula`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `aula_alumnos`
--
ALTER TABLE `aula_alumnos`
  ADD PRIMARY KEY (`nombre_aula`,`id_alumno`),
  ADD KEY `id_alumno` (`id_alumno`);

--
-- Indices de la tabla `partida`
--
ALTER TABLE `partida`
  ADD PRIMARY KEY (`codigo`),
  ADD KEY `id_alumno` (`id_alumno`);

--
-- Indices de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `profesor`
--
ALTER TABLE `profesor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `valores`
--
ALTER TABLE `valores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_pregunta` (`id_pregunta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT de la tabla `profesor`
--
ALTER TABLE `profesor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `valores`
--
ALTER TABLE `valores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`aula_name`) REFERENCES `aula` (`nombre`);

--
-- Filtros para la tabla `aula_alumnos`
--
ALTER TABLE `aula_alumnos`
  ADD CONSTRAINT `aula_alumnos_ibfk_1` FOREIGN KEY (`nombre_aula`) REFERENCES `aula` (`nombre`),
  ADD CONSTRAINT `aula_alumnos_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id`);

--
-- Filtros para la tabla `partida`
--
ALTER TABLE `partida`
  ADD CONSTRAINT `partida_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id`);

--
-- Filtros para la tabla `valores`
--
ALTER TABLE `valores`
  ADD CONSTRAINT `valores_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `valores_ibfk_2` FOREIGN KEY (`id_pregunta`) REFERENCES `pregunta` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
