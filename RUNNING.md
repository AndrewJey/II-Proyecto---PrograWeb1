

<!-- local-development:start -->
# Desarrollo local

Puedes abrir este repositorio en VS Code, Antigravity o Sublime Text. El compilador y los servicios necesarios dependen del componente indicado abajo.

## HTML

Para páginas estáticas, inicia un servidor HTTP desde la carpeta de la página. Si usan un backend o una base de datos, hay que preparar ese servicio aparte.

```powershell
py -3.12 -m http.server 8000 --bind 127.0.0.1
```

## Archivos ignorados

`.gitignore` excluye credenciales locales, estado del editor y salidas de las herramientas detectadas. No deja de versionar archivos que ya estaban en Git. Los manifiestos, archivos de bloqueo, recursos fuente y scripts de esquema forman parte del código.
<!-- local-development:end -->

<!-- improvements-20261119:start -->
## Mejoras y verificación funcional (2026-11-19)

- **Mejoras aplicadas:** Rediseño responsivo y accesible de UTN Perfiles (`index.html`, `DashDoard.html`, `css/modern-app.css`), motor de datos desacoplado (`js/store.js`), corrección del fallo de login con `localStorage` vacío, prevención de XSS/duplicados, preservación de nombre de usuario/foto al editar, habilidades funcionales y búsqueda global con historial.
- **Pruebas ejecutadas:** `node --test tests/store.test.mjs` (3/3 pruebas aprobadas: login, CRUD Usuarios/Carreras/Estudiantes, validación de imágenes y búsqueda).
<!-- improvements-20261119:end -->
