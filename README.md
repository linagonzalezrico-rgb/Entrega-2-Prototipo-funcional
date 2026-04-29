# ExploreCol 🌿✈️
## Plataforma de Servicios Turísticos — Módulo Front-end | Entrega 2 (Semana 5)

> Aplicación web tipo catálogo que permite explorar paquetes turísticos colombianos, guardar favoritos, contactar y administrar el catálogo.

---

## 📸 Vistas del Proyecto

| Vista | Descripción |
|-------|-------------|
| **Home** | Hero animado, paquetes destacados, testimonios y CTA |
| **Paquetes** | Catálogo completo con búsqueda en tiempo real |
| **Detalle** | Información completa del paquete con reserva y favoritos |
| **Contacto** | Formulario con validaciones completas |
| **Favoritos** | Lista personalizada persistida en localStorage |
| **Administrar** | Mini CRUD: crear y eliminar paquetes |

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** — Estructura semántica y accesible
- **CSS3** — Variables CSS, Flexbox, Grid, animaciones
- **JavaScript ES6+** — Módulos, async/await, destructuring
- **localStorage** — Persistencia de favoritos en el cliente
- **JSON** — Fuente de datos del catálogo de paquetes
- **Fuente:** Inter (Google Fonts)

---

## 🚀 Cómo Ejecutar Localmente

```bash
# Opción 1: Live Server (VS Code)
# Instala la extensión "Live Server" y abre index.html

# Opción 2: Python
python3 -m http.server 8080
# Luego abre: http://localhost:8080

# Opción 3: Node.js (npx)
npx serve .
```

> ⚠️ **Importante:** Debe ejecutarse desde un servidor local (no con `file://`)  
> porque carga `data/paquetes.json` mediante `fetch()`.

---

## 📁 Estructura del Proyecto

```
explorecol/
├── index.html              # SPA principal (todas las páginas)
├── css/
│   └── styles.css          # Estilos globales con variables CSS
├── js/
│   └── app.js              # Lógica completa de la aplicación
├── data/
│   └── paquetes.json       # Datos de los paquetes turísticos
└── README.md
```

---

## ✅ Funcionalidades Implementadas

### Renderizado dinámico desde JSON
- Los paquetes se cargan desde `data/paquetes.json` con `fetch()`
- Si el JSON falla, se usa un array de fallback embebido

### Favoritos con localStorage
- Toggle de favorito en cada card y en la vista de detalle
- Persistencia automática entre sesiones del navegador
- Vista dedicada para ver y gestionar favoritos

### Búsqueda en tiempo real
- Filtra paquetes por nombre, ubicación, categoría o descripción
- Debounce de 250ms para optimizar el rendimiento
- Muestra contador de resultados encontrados

### Validaciones del formulario de contacto
| Campo | Validación |
|-------|-----------|
| Nombre | Mínimo 3 caracteres |
| Correo | Regex de email válido |
| Teléfono | Formato numérico +57... |
| Asunto | Mínimo 5 caracteres |
| Mensaje | Mínimo 20 caracteres |

### Mini CRUD (Administración)
- **Create:** Formulario modal para agregar nuevos paquetes
- **Read:** Tabla con todos los paquetes y estadísticas
- **Delete:** Eliminación con confirmación

### Navegación SPA
- Una sola página HTML con múltiples vistas
- Transiciones con animación `fadeIn`
- Toast notifications para feedback al usuario

---

## 📦 Despliegue

El proyecto está desplegado en: explorecol.netlify.app




## 👤 Autor

| Campo | Valor |
|-------|-------|
| Nombre | Lina Paola Gonzalez Rico. |
| Programa | Ingenieria de Software |
| Institución | Politecnico Gran Colombiano |
| Tutor | Edgar Mauricio López Rojas |
| Módulo | Desarrollo de Front-end |
| Entrega | Prototipo funcional — Semana 5 |
| Fecha | Marzo 2026 |

---

*© 2026 ExploreCol — Módulo Desarrollo Front-end*
