-- database/documind_ia.sql
-- Base de datos del proyecto DocuMind IA

CREATE DATABASE IF NOT EXISTS documind_ia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE documind_ia;

-- Usuarios del sistema
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin','usuario') DEFAULT 'usuario',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repositorios/carpetas de documentos, cada uno pertenece a un usuario
CREATE TABLE repositorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_usuario INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Categorías para la clasificación automática (mínimo 3 según el enunciado)
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Documentos cargados dentro de cada repositorio
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_repositorio INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    formato ENUM('pdf','docx','txt') NOT NULL,
    tamano_kb INT,
    id_categoria INT NULL,
    resumen TEXT,
    contenido_extraido LONGTEXT,
    estado_procesamiento ENUM('pendiente','procesando','completado','error') DEFAULT 'pendiente',
    fecha_carga DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_repositorio) REFERENCES repositorios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Información relevante extraída por la IA de cada documento
CREATE TABLE entidades_extraidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    tipo_entidad VARCHAR(100),
    valor VARCHAR(500),
    FOREIGN KEY (id_documento) REFERENCES documentos(id) ON DELETE CASCADE
);

-- Registro de errores y estados de procesamiento (requisito explícito del enunciado)
CREATE TABLE logs_procesamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    etapa VARCHAR(100),
    estado ENUM('info','advertencia','error'),
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id) ON DELETE CASCADE
);

-- Historial de preguntas en lenguaje natural sobre los documentos
CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Categorías iniciales de ejemplo (mínimo 3 que pide el enunciado)
INSERT INTO categorias (nombre) VALUES
('Contratos'),
('Facturas'),
('Informes'),
('Correspondencia');