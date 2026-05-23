
DROP DATABASE IF EXISTS helpi;
CREATE DATABASE helpi;
USE helpi;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    usuario_login VARCHAR(50) NOT NULL UNIQUE,
    clave_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    id_rol INT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    numero_cliente VARCHAR(20) UNIQUE NOT NULL,
    dni CHAR(8) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    tipo_plan VARCHAR(50),
    costo_plan DECIMAL(10,2),
    estado_servicio VARCHAR(50),
    correo VARCHAR(100),
    telefono VARCHAR(20)
);

CREATE TABLE categorias_atencion (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE atenciones (
    id_atencion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    id_usuario INT,
    id_categoria INT,
    descripcion TEXT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias_atencion(id_categoria)
);

CREATE TABLE tickets (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    id_atencion INT,
    id_tecnico INT,
    descripcion_problema TEXT NOT NULL,
    prioridad ENUM('Alta', 'Media', 'Baja'),
    id_categoria INT,
    estado_ticket VARCHAR(20) DEFAULT 'Pendiente',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME,
    FOREIGN KEY (id_atencion) REFERENCES atenciones(id_atencion),
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias_atencion(id_categoria)
);

INSERT INTO roles (nombre_rol) VALUES 
('Asesor'),      -- ID 1
('Tecnico'),     -- ID 2
('Supervisor');  -- ID 3 (Admins)

INSERT INTO usuarios (nombre_completo, usuario_login, clave_hash, email, telefono, id_rol) VALUES
('Nahuel Edson Herrera Estela', 'nahuel', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8qtkEP', 'nahuel@helpi.com', '999001001', 3),
('Raul Felipe Riveros Perez', 'raul', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8qtkEP', 'raul@helpi.com', '999002002', 3),
('Jhon Alex Luna Canchihuaman', 'jhon', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8qtkEP', 'jhon@helpi.com', '999003003', 3),
('Alexandra Ataucusi Jorge', 'alexandra', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8qtkEP', 'alexandra@helpi.com', '999004004', 3),
('Huaman Valderrama Sthani', 'sthani', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8qtkEP', 'sthani@helpi.com', '999005005', 3),
('Operador Asesor', 'asesor', '$2a$12$Go97nYaApvGpE/5uHG7LJ.wwMtuZ7.6NevkNnvbEeH29MecRvsHti', 'asesor@helpi.com', '988000000', 1), -- ID 6
('Tecnico Campo', 'tecnico', '$2a$12$Go97nYaApvGpE/5uHG7LJ.wwMtuZ7.6NevkNnvbEeH29MecRvsHti', 'tecnico@helpi.com', '977000000', 2); -- ID 7

INSERT INTO categorias_atencion (nombre_categoria) VALUES 
('Consulta Comercial'),
('Falla Técnica'),
('Facturación');

INSERT INTO clientes (numero_cliente, dni, nombre_completo, tipo_plan, costo_plan, estado_servicio, correo, telefono) VALUES 
('H0001', '40506070', 'Diana Paredes', 'Fibra Pro', 120.00, 'Activo', 'diana.p@gmail.com', '912345678'),
('H0002', '50607080', 'Bruno Vega', 'Hogar Básico', 59.90, 'Suspendido', 'bruno.vega@hotmail.com', '923456789'),
('H0003', '60708090', 'Carmen Soto', 'Dúo Ilimitado', 85.50, 'Activo', 'carmen.soto@yahoo.com', '934567890');

INSERT INTO atenciones (id_cliente, id_usuario, id_categoria, descripcion, estado) VALUES
(1, 6, 1, 'Cliente pregunta por upgrade de velocidad a 1GB.', 'Resuelta'),
(2, 6, 3, 'Reclamo por cobro de instalación que debía ser gratis.', 'Pendiente'),
(3, 6, 2, 'El router parpadea en rojo, no tiene acceso a internet.', 'Resuelta');

INSERT INTO tickets (id_atencion, id_tecnico, descripcion_problema, prioridad, id_categoria, estado_ticket) VALUES
(3, 7, 'Ruido en la línea de fibra, posible atenuación alta.', 'Alta', 2, 'En proceso');


USE helpi;

UPDATE usuarios 
SET clave_hash = '$2a$10$HholCWBgzV56V68T3inB7OLIvOyKM5qJQho.Gi5xTPLATM9Z.rh2i' 
WHERE id_rol = 3; 

SELECT usuario_login, clave_hash FROM usuarios WHERE id_rol = 3;

