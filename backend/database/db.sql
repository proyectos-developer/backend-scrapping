CREATE DATABASE web-scrapping.com;

USE web-scrapping.com;

/**datos empresa**/
CREATE TABLE data_empresa(
    id INT(11) NOT NULL,
    correo VARCHAR (200) NOT NULL,
    nro_telefono VARCHAR (200) NOT NULL,
    nombre VARCHAR (200) NOT NULL,
    ruc VARCHAR (200) NOT NULL,
    created_at timestamp NOT NULL DEFAULT current_timestamp 
);

ALTER TABLE data_empresa
    ADD PRIMARY KEY(id);

ALTER TABLE data_empresa
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

DESCRIBE data_empresa;