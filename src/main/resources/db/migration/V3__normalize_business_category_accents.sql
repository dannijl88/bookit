-- Alinea las categorias de negocio guardadas sin tilde con el valor canonico
-- que usa el frontend (src/lib/domain.js, CATEGORIES) y por el que se filtra en
-- GET /api/businesses. El backend compara categoria ignorando mayusculas pero
-- NO tildes, asi que un negocio guardado como 'peluqueria' no aparecia al pedir
-- 'Peluquería'. El seeder de demo creaba la categoria sin tilde.
--
-- Solo corrige datos (DML); no modifica el esquema, por lo que ddl-auto=validate
-- sigue aceptandolo. Es idempotente: solo toca filas que aun estan sin tilde.

update business set category = 'Peluquería' where lower(category) = 'peluqueria';
update business set category = 'Barbería'   where lower(category) = 'barberia';
update business set category = 'Estética'   where lower(category) = 'estetica';
update business set category = 'Depilación' where lower(category) = 'depilacion';
