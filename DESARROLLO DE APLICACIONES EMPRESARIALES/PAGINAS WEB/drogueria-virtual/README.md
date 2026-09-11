# Droguería Virtual Inteligente — Esqueleto del Proyecto

Este es el **esqueleto base** del proyecto. Todos los archivos existen pero están vacíos o con
contenido mínimo (comentarios `TODO`). La idea es irlos llenando **fase por fase**, según el
plan acordado.

## Cómo usar esta carpeta

1. Descomprime el ZIP dentro de la carpeta donde trabajas en VS Code
   (más adelante, cuando lleguemos a Fase 9, esta misma carpeta se copiará a `htdocs/` de XAMPP).
2. Ábrela como carpeta raíz en VS Code.
3. Vamos avanzando módulo por módulo; yo te iré dando el código exacto para cada archivo.

## Estructura de carpetas

```text
drogueria-virtual/
├── index.html              Página principal (Fase 2)
├── login.html               Inicio de sesión (Fase 5)
├── registro.html            Registro de cliente (Fase 5)
│
├── pages/                   Páginas públicas adicionales
│   ├── catalogo.html        (Fase 3)
│   ├── carrito.html         (Fase 4)
│   ├── perfil.html          (Fase 6)
│   ├── direcciones.html     (Fase 6)
│   ├── pedidos.html         (Fase 6 / 12)
│   ├── orden-medica.html    (Fase 13)
│   ├── chatbot.html         (Fase 14)
│   ├── calificacion.html    (Fase 15)
│   ├── contacto.html
│   └── nosotros.html
│
├── css/                     Estilos generales del sitio público
│   ├── variables.css        Paleta de colores y tipografías (Fase 2)
│   ├── main.css
│   ├── header.css
│   ├── footer.css
│   ├── productos.css
│   ├── carrito.css
│   ├── auth.css
│   └── responsive.css
│
├── js/                      Lógica del sitio público (frontend)
│   ├── main.js
│   ├── auth.js
│   ├── productos.js
│   ├── carrito.js
│   ├── chatbot.js
│   ├── perfil.js
│   ├── validaciones.js
│   └── api.js               Funciones para conectarse al backend (Fase 11)
│
├── images/
│   ├── productos/
│   ├── banners/
│   └── iconos/
│
├── components/              Fragmentos HTML reutilizables (header, footer, nav, etc.)
│
├── admin/                   Panel administrativo (Fase 7)
│   ├── index.html           Dashboard
│   ├── css/admin.css
│   ├── js/ (admin.js, dashboard.js, reportes.js)
│   └── pages/                productos, pedidos, clientes, ordenes-medicas,
│                              conversaciones, calificaciones, comentarios,
│                              recomendaciones, reportes, usuarios, permisos,
│                              configuracion
│
├── user/                    Área privada del cliente (Fase 6)
│   ├── index.html
│   ├── css/user.css
│   ├── js/user.js
│   └── pages/                perfil, direcciones, pedidos, historial,
│                              ordenes-medicas, calificar
│
├── uploads/                  Archivos subidos por el usuario (no se sube a git)
│   ├── ordenes_medicas/
│   └── perfiles/
│
├── backend/                  PHP (Fases 9-11 en adelante)
│   ├── config/                database.php, config.php
│   ├── models/                Usuario, Producto, Categoria, Pedido, DetallePedido,
│   │                           Direccion, OrdenMedica, Conversacion, Mensaje,
│   │                           Calificacion, Comentario, Recomendacion, Reporte
│   ├── controllers/            un controlador por módulo
│   ├── api/                    endpoints que consumirá el JS del frontend
│   └── helpers/                validaciones.php, seguridad.php, respuestas.php
│
└── docs/                      Documentación técnica del proyecto (diagramas, modelo ER, etc.)
```

## Estado actual

✅ Fase 0 — Análisis y planificación → pendiente de definir contigo (nombre, paleta, tipografías, etc.)
✅ Fase 1 — Estructura de carpetas → **completada** (este ZIP)
⬜ Fase 2 — Diseño visual de la página principal
⬜ Fase 3 — Catálogo y productos
⬜ Fase 4 — Carrito
⬜ Fase 5 — Login y registro
⬜ Fase 6 — Perfil y domicilios
⬜ Fase 7 — Panel administrativo
⬜ Fase 8 — Diseño de base de datos
⬜ Fase 9 — MySQL + XAMPP
⬜ Fase 10 — Backend PHP
⬜ Fase 11 — Conexión frontend + backend + BD
⬜ Fase 12 — Pedidos
⬜ Fase 13 — Órdenes médicas
⬜ Fase 14 — Chatbot avanzado
⬜ Fase 15 — Calificaciones, comentarios, recomendaciones
⬜ Fase 16 — Estadísticas
⬜ Fase 17 — Reportes mensuales
⬜ Fase 18 — Seguridad
⬜ Fase 19 — Pruebas
⬜ Fase 20 — Ajustes finales

## Nota importante

`backend/config/database.php` y `config.php` están vacíos y listados en `.gitignore` porque
ahí irán las credenciales de conexión a MySQL — nunca deben subirse a un repositorio público.
