/**
 * ExploreCol — Lógica principal
 * Módulo Front-end | Entrega 2 — Semana 5
 *
 * Funcionalidades:
 *  - Carga de paquetes desde JSON
 *  - Renderizado dinámico de cards
 *  - Búsqueda en tiempo real
 *  - Gestión de favoritos con localStorage
 *  - Validación de formularios
 *  - Mini CRUD (crear / eliminar paquetes)
 *  - Navegación SPA (Single Page)
 *  - Toast notifications
 */

'use strict';

/* ══════════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════════ */
const Estado = {
  paquetes: [],         // array de paquetes cargados del JSON
  favoritos: [],        // IDs en localStorage
  paqueteActual: null,  // paquete en vista detalle
  paginaActual: 'home'
};

/* ══════════════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  Estado.favoritos = cargarFavoritos();
  await cargarPaquetes();
  renderHome();
  configurarNav();
  configurarBuscador();
  configurarFormContacto();
  configurarModalNuevo();
});

/* ══════════════════════════════════════════════
   CARGA DE DATOS (JSON)
══════════════════════════════════════════════ */
async function cargarPaquetes() {
  try {
    const res = await fetch('data/paquetes.json');
    if (!res.ok) throw new Error('No se pudo cargar el JSON');
    Estado.paquetes = await res.json();
  } catch (e) {
    console.warn('JSON no disponible, usando datos embebidos:', e);
    Estado.paquetes = PAQUETES_FALLBACK;
  }
}

/* ══════════════════════════════════════════════
   NAVEGACIÓN SPA
══════════════════════════════════════════════ */
function configurarNav() {
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pagina = link.dataset.page;
      navegarA(pagina);
    });
  });
}

function navegarA(pagina, params = {}) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Quitar active de nav
  document.querySelectorAll('.navbar-nav a').forEach(a => a.classList.remove('active'));

  Estado.paginaActual = pagina;

  // Mostrar página activa
  const el = document.getElementById('page-' + pagina);
  if (el) {
    el.classList.add('active');
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 400);
  }

  // Marcar nav activo
  const navLink = document.querySelector(`[data-page="${pagina}"]`);
  if (navLink) navLink.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Renderizar según página
  switch (pagina) {
    case 'home':       renderHome(); break;
    case 'paquetes':   renderPaquetes(); break;
    case 'favoritos':  renderFavoritos(); break;
    case 'administrar': renderAdmin(); break;
    case 'contacto':   break;
    case 'detalle':
      if (params.id) {
        Estado.paqueteActual = Estado.paquetes.find(p => p.id === params.id);
        renderDetalle();
      }
      break;
  }
}

/* ══════════════════════════════════════════════
   UTILIDADES DE FORMATO
══════════════════════════════════════════════ */
const formatearPrecio = (n) =>
  '$ ' + n.toLocaleString('es-CO');

const iconCategoria = (cat) => {
  const mapa = { 'Cultural': '🏛', 'Naturaleza': '🌿', 'Playa': '🏖', 'Aventura': '🧗' };
  return mapa[cat] || '📍';
};

/* ══════════════════════════════════════════════
   RENDER — HOME
══════════════════════════════════════════════ */
function renderHome() {
  const destacados = Estado.paquetes.filter(p => p.destacado).slice(0, 3);
  const contenedor = document.getElementById('home-cards');
  if (!contenedor) return;
  contenedor.innerHTML = destacados.map(p => crearCardHTML(p)).join('');
  configurarEventosCards(contenedor);
}

/* ══════════════════════════════════════════════
   RENDER — PAQUETES
══════════════════════════════════════════════ */
function renderPaquetes(query = '') {
  const contenedor = document.getElementById('paquetes-cards');
  const countEl    = document.getElementById('paquetes-count');
  if (!contenedor) return;

  const filtrados = Estado.paquetes.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.nombre.toLowerCase().includes(q) ||
           p.ubicacion.toLowerCase().includes(q) ||
           p.descripcion.toLowerCase().includes(q) ||
           p.categoria.toLowerCase().includes(q);
  });

  if (countEl) countEl.textContent = `Mostrando ${filtrados.length} paquete${filtrados.length !== 1 ? 's' : ''}`;

  if (filtrados.length === 0) {
    contenedor.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No se encontraron paquetes para "<strong>${query}</strong>"</p></div>`;
    return;
  }

  contenedor.innerHTML = filtrados.map(p => crearCardHTML(p)).join('');
  configurarEventosCards(contenedor);
}

/* ══════════════════════════════════════════════
   RENDER — CARD HTML
══════════════════════════════════════════════ */
function crearCardHTML(p) {
  const esFav = Estado.favoritos.includes(p.id);
  return `
    <div class="package-card fade-in" data-id="${p.id}">
      <div class="card-image">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=870&auto=format&fit=crop'">
        ${p.destacado ? '<span class="badge-destacado">Destacado</span>' : `<span class="badge-cat">${iconCategoria(p.categoria)} ${p.categoria}</span>`}
        <button class="btn-fav ${esFav ? 'active' : ''}" data-fav="${p.id}" title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
          ${esFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.nombre}</h3>
        <div class="card-meta">
          <span>📍 ${p.ubicacion}</span>
          <span>🕐 ${p.duracion}</span>
        </div>
        <p class="card-desc">${p.descripcion}</p>
        <div class="card-footer">
          <div>
            <div class="card-price-label">Desde</div>
            <div class="card-price">${formatearPrecio(p.precio)}</div>
          </div>
          <button class="btn btn-primary btn-sm ver-mas" data-id="${p.id}">Ver Más</button>
        </div>
      </div>
    </div>`;
}

function configurarEventosCards(contenedor) {
  contenedor.querySelectorAll('.ver-mas').forEach(btn => {
    btn.addEventListener('click', () => navegarA('detalle', { id: parseInt(btn.dataset.id) }));
  });
  contenedor.querySelectorAll('.btn-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorito(parseInt(btn.dataset.fav));
    });
  });
}

/* ══════════════════════════════════════════════
   RENDER — DETALLE
══════════════════════════════════════════════ */
function renderDetalle() {
  const p = Estado.paqueteActual;
  if (!p) return;
  const esFav = Estado.favoritos.includes(p.id);

  document.getElementById('detalle-img').src = p.imagen;
  document.getElementById('detalle-img').alt = p.nombre;
  document.getElementById('detalle-badge').textContent = p.destacado ? 'Paquete Destacado' : p.categoria;
  document.getElementById('detalle-nombre').textContent = p.nombre;
  document.getElementById('detalle-ubicacion').textContent = '📍 ' + p.ubicacion;
  document.getElementById('detalle-duracion').textContent = '🕐 ' + p.duracion;
  document.getElementById('detalle-desc').textContent = p.descripcionDetalle;
  document.getElementById('detalle-precio').textContent = formatearPrecio(p.precio);

  // Incluye
  document.getElementById('detalle-incluye').innerHTML =
    p.incluye.map(item => `
      <div class="incluye-item">
        <div class="check-icon">✓</div>
        <span>${item}</span>
      </div>`).join('');

  // Destacados
  document.getElementById('detalle-destacados').innerHTML =
    p.destacados.map(item => `
      <div class="incluye-item">
        <div class="check-icon" style="background:#EBF8FF;color:#3182CE">✓</div>
        <span>${item}</span>
      </div>`).join('');

  // Botón favorito
  const btnFav = document.getElementById('btn-fav-detalle');
  btnFav.className = 'btn-fav-detalle' + (esFav ? ' active' : '');
  btnFav.textContent = esFav ? '♥' : '♡';
  btnFav.title = esFav ? 'Quitar de favoritos' : 'Guardar en favoritos';
  btnFav.onclick = () => {
    toggleFavorito(p.id);
    renderDetalle(); // re-renderizar para actualizar icono
  };

  // Reservar
  document.getElementById('btn-reservar').onclick = () => {
    mostrarToast('✓ ¡Reserva iniciada! Te contactaremos pronto.', 'verde');
  };

  // Compartir
  document.getElementById('btn-compartir').onclick = () => {
    if (navigator.share) {
      navigator.share({ title: p.nombre, text: p.descripcion });
    } else {
      navigator.clipboard.writeText(window.location.href);
      mostrarToast('🔗 Enlace copiado al portapapeles', '');
    }
  };
}

/* ══════════════════════════════════════════════
   RENDER — FAVORITOS
══════════════════════════════════════════════ */
function renderFavoritos() {
  const contenedor = document.getElementById('favoritos-lista');
  if (!contenedor) return;

  const favs = Estado.paquetes.filter(p => Estado.favoritos.includes(p.id));

  if (favs.length === 0) {
    contenedor.innerHTML = `
      <div class="favoritos-vacio">
        <div class="vacio-icon">💔</div>
        <h3>No tienes favoritos guardados</h3>
        <p>Explora nuestros paquetes y guarda los que más te gusten.</p>
        <button class="btn btn-primary" onclick="navegarA('paquetes')">Explorar Paquetes</button>
      </div>`;
    return;
  }

  contenedor.innerHTML = favs.map(p => `
    <div class="favorito-row fade-in" id="fav-row-${p.id}">
      <img class="favorito-img" src="${p.imagen}" alt="${p.nombre}"
           onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'">
      <div class="favorito-info">
        <div class="favorito-titulo">${p.nombre}</div>
        <div class="favorito-meta">📍 ${p.ubicacion} &nbsp;·&nbsp; 🕐 ${p.duracion}</div>
        <div class="favorito-precio">${formatearPrecio(p.precio)}</div>
      </div>
      <div class="favorito-actions">
        <button class="btn btn-outline-dark btn-sm" onclick="navegarA('detalle',{id:${p.id}})">Ver más</button>
        <button class="btn btn-danger btn-sm" onclick="quitarFavorito(${p.id})">✕ Quitar</button>
      </div>
    </div>`).join('') +
    `<p class="fav-note">💾 Los favoritos se guardan en tu navegador (localStorage) y persisten entre sesiones.</p>`;
}

function quitarFavorito(id) {
  toggleFavorito(id);
  renderFavoritos();
}

/* ══════════════════════════════════════════════
   RENDER — ADMIN (CRUD)
══════════════════════════════════════════════ */
function renderAdmin() {
  const tbody = document.getElementById('admin-tbody');
  const totalEl = document.getElementById('stat-total');
  const destEl  = document.getElementById('stat-dest');
  const regEl   = document.getElementById('stat-reg');
  if (!tbody) return;

  const total    = Estado.paquetes.length;
  const dest     = Estado.paquetes.filter(p => p.destacado).length;
  const regular  = total - dest;

  if (totalEl) totalEl.textContent = total;
  if (destEl)  destEl.textContent  = dest;
  if (regEl)   regEl.textContent   = regular;

  tbody.innerHTML = Estado.paquetes.map(p => `
    <tr id="tr-${p.id}">
      <td>
        <div class="tabla-paquete">
          <img class="tabla-img" src="${p.imagen}" alt="${p.nombre}"
               onerror="this.src='https://unsplash.com/es/fotos/coches-aparcados-frente-a-un-edificio-de-hormigon-verde-y-blanco-durante-el-dia-J0suKy48jfk'">
          <div>
            <div class="tabla-nombre">${p.nombre}</div>
            <div class="tabla-desc">${p.descripcion.substring(0,55)}…</div>
          </div>
        </div>
      </td>
      <td>${p.ubicacion}</td>
      <td>${p.duracion}</td>
      <td class="tabla-precio">${formatearPrecio(p.precio)}</td>
      <td><span class="badge-estado ${p.destacado ? 'badge-destacado-tag' : 'badge-regular'}">${p.destacado ? 'Destacado' : 'Regular'}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarPaquete(${p.id})">🗑</button>
      </td>
    </tr>`).join('');
}

function eliminarPaquete(id) {
  if (!confirm('¿Eliminar este paquete del catálogo?')) return;
  Estado.paquetes = Estado.paquetes.filter(p => p.id !== id);
  Estado.favoritos = Estado.favoritos.filter(fId => fId !== id);
  guardarFavoritos();
  renderAdmin();
  mostrarToast('🗑 Paquete eliminado correctamente', 'rojo');
}

/* ══════════════════════════════════════════════
   MODAL — NUEVO PAQUETE
══════════════════════════════════════════════ */
function configurarModalNuevo() {
  const btnNuevo = document.getElementById('btn-nuevo-paquete');
  const overlay  = document.getElementById('modal-nuevo');
  const btnClose = document.getElementById('modal-close');
  const form     = document.getElementById('form-nuevo');

  if (!btnNuevo) return;

  btnNuevo.addEventListener('click', () => overlay.classList.add('open'));
  btnClose.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre   = document.getElementById('n-nombre').value.trim();
    const ubicacion= document.getElementById('n-ubicacion').value.trim();
    const duracion = document.getElementById('n-duracion').value.trim();
    const precio   = parseInt(document.getElementById('n-precio').value);
    const desc     = document.getElementById('n-desc').value.trim();
    const imagen   = document.getElementById('n-imagen').value.trim() || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80';
    const destacado= document.getElementById('n-destacado').checked;
    const categoria= document.getElementById('n-categoria').value;

    const nuevo = {
      id: Date.now(),
      nombre, ubicacion, duracion, precio,
      descripcion: desc,
      descripcionDetalle: desc,
      imagen, destacado, categoria,
      incluye: ['Guía especializado', 'Transporte incluido'],
      destacados: ['Experiencia única', 'Guías locales']
    };

    Estado.paquetes.push(nuevo);
    overlay.classList.remove('open');
    form.reset();
    renderAdmin();
    mostrarToast('✓ Paquete agregado correctamente', 'verde');
  });
}

/* ══════════════════════════════════════════════
   BUSCADOR
══════════════════════════════════════════════ */
function configurarBuscador() {
  const input = document.getElementById('buscador');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => renderPaquetes(input.value), 250);
  });
}

/* ══════════════════════════════════════════════
   FAVORITOS (localStorage)
══════════════════════════════════════════════ */
function cargarFavoritos() {
  try { return JSON.parse(localStorage.getItem('explorecol_favoritos')) || []; }
  catch { return []; }
}

function guardarFavoritos() {
  localStorage.setItem('explorecol_favoritos', JSON.stringify(Estado.favoritos));
}

function toggleFavorito(id) {
  const idx = Estado.favoritos.indexOf(id);
  if (idx === -1) {
    Estado.favoritos.push(id);
    mostrarToast('♥ Agregado a favoritos', 'verde');
  } else {
    Estado.favoritos.splice(idx, 1);
    mostrarToast('♡ Quitado de favoritos', '');
  }
  guardarFavoritos();

  // Actualizar ícono en la página actual sin re-renderizar todo
  const btnCard = document.querySelector(`.btn-fav[data-fav="${id}"]`);
  if (btnCard) {
    const esFav = Estado.favoritos.includes(id);
    btnCard.classList.toggle('active', esFav);
    btnCard.textContent = esFav ? '♥' : '♡';
  }

  // Actualizar contador nav favoritos si existe
  actualizarContadorFavs();
}

function actualizarContadorFavs() {
  const badge = document.getElementById('nav-fav-count');
  if (badge) {
    badge.textContent = Estado.favoritos.length || '';
    badge.style.display = Estado.favoritos.length ? 'inline' : 'none';
  }
}

/* ══════════════════════════════════════════════
   FORMULARIO CONTACTO
══════════════════════════════════════════════ */
function configurarFormContacto() {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valido = true;

    // Validar campos
    const campos = [
      { id: 'c-nombre',   errId: 'err-nombre',   min: 3,   msg: 'El nombre debe tener al menos 3 caracteres.' },
      { id: 'c-email',    errId: 'err-email',     tipo: 'email', msg: 'Ingresa un correo electrónico válido.' },
      { id: 'c-telefono', errId: 'err-telefono',  patron: /^\+?[\d\s\-]{7,15}$/, msg: 'Ingresa un teléfono válido.' },
      { id: 'c-asunto',   errId: 'err-asunto',    min: 5,   msg: 'El asunto debe tener al menos 5 caracteres.' },
      { id: 'c-mensaje',  errId: 'err-mensaje',   min: 20,  msg: 'El mensaje debe tener al menos 20 caracteres.' },
    ];

    campos.forEach(({ id, errId, min, tipo, patron, msg }) => {
      const input = document.getElementById(id);
      const err   = document.getElementById(errId);
      if (!input || !err) return;
      let ok = true;

      if (tipo === 'email') {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else if (patron) {
        ok = patron.test(input.value.trim());
      } else if (min) {
        ok = input.value.trim().length >= min;
      }

      input.classList.toggle('error', !ok);
      err.classList.toggle('visible', !ok);
      if (!ok) valido = false;
    });

    if (valido) {
      const alerta = document.getElementById('contacto-success');
      if (alerta) alerta.classList.add('visible');
      form.reset();
      // Ocultar alerta después de 5 segundos
      setTimeout(() => alerta && alerta.classList.remove('visible'), 5000);
      mostrarToast('✓ Mensaje enviado correctamente', 'verde');
    }
  });

  // Limpiar error al escribir
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById('err-' + el.id.replace('c-', ''));
      if (errEl) errEl.classList.remove('visible');
    });
  });
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
let toastTimer;
function mostrarToast(msg, tipo = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + tipo;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════
   DATOS FALLBACK (en caso de que el JSON no cargue)
══════════════════════════════════════════════ */
const PAQUETES_FALLBACK = [
  { id:1, nombre:'Cartagena Mágica', ubicacion:'Cartagena, Bolívar', duracion:'4 días / 3 noches', precio:1850000, descripcion:'Explora la ciudad amurallada y sus playas paradisíacas.', descripcionDetalle:'Descubre la magia de Cartagena de Indias, ciudad que combina historia colonial y playas de ensueño.', imagen:'https://images.unsplash.com/photo-1518509562904-e7ef99cdfa22?w=600&q=80', destacado:true, categoria:'Cultural', incluye:['Hotel 4 estrellas','Desayunos incluidos','City tour guiado','Transporte aeropuerto'], destacados:['Ciudad amurallada patrimonio','Castillo San Felipe','Islas del Rosario','Gastronomía caribeña'] },
  { id:2, nombre:'Eje Cafetero Tradicional', ubicacion:'Quindío, Risaralda', duracion:'5 días / 4 noches', precio:1650000, descripcion:'Vive la experiencia cafetera en los paisajes más verdes de Colombia.', descripcionDetalle:'Visita haciendas cafeteras, el Valle del Cocora y disfruta de la gastronomía paisa.', imagen:'https://images.unsplash.com/photo-1570197820006-3e46f5ee01bb?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:true, categoria:'Naturaleza', incluye:['Hacienda cafetera','Desayunos típicos','Visita cultivos','Guía experto'], destacados:['Palma de cera','Proceso del café','Pueblo de Salento','Arquitectura republicana'] },
  { id:3, nombre:'Tayrona Natural', ubicacion:'Santa Marta, Magdalena', duracion:'3 días / 2 noches', precio:1450000, descripcion:'Paraíso natural entre selva y mar en la costa caribeña.', descripcionDetalle:'Caminatas por senderos ecológicos y snorkel en aguas cristalinas del Parque Tayrona.', imagen:'https://images.unsplash.com/photo-1681854534969-80bfa03152dd?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:true, categoria:'Naturaleza', incluye:['Ecoposada','Desayuno y cena','Entrada al parque','Guía naturalista','Kit de snorkel'], destacados:['Parque Nacional Tayrona','Playa Cabo San Juan','Snorkel en arrecifes','Observación de aves'] },
  { id:4, nombre:'Bogotá Cultural', ubicacion:'Bogotá D.C.', duracion:'3 días / 2 noches', precio:1200000, descripcion:'Descubre la capital entre historia, arte y gastronomía.', descripcionDetalle:'Recorre La Candelaria, visita museos y sube a Monserrate.', imagen:'https://images.unsplash.com/photo-1700526032300-e4005d8874d8?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:false, categoria:'Cultural', incluye:['Hotel céntrico','Desayuno buffet','City tour','Entrada a museos'], destacados:['Museo del Oro','La Candelaria','Monserrate','Mercado Perseverancia'] },
  { id:5, nombre:'San Andrés Caribeño', ubicacion:'San Andrés, Archipiélago', duracion:'4 días / 3 noches', precio:2100000, descripcion:'Aguas cristalinas en el mar de los siete colores.', descripcionDetalle:'Snorkel en el acuario natural y cultura raizal en el Caribe colombiano.', imagen:'https://images.unsplash.com/photo-1592782985575-a96c6e647155?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:false, categoria:'Playa', incluye:['Hotel frente al mar','Desayuno y cena','Catamarán','Snorkel','Traslados'], destacados:['Mar Siete Colores','El Acuario','Johnny Cay','Cultura raizal'] },
  { id:6, nombre:'Medellín Innovadora', ubicacion:'Medellín, Antioquia', duracion:'3 días / 2 noches', precio:1350000, descripcion:'La ciudad de la eterna primavera entre montañas.', descripcionDetalle:'Metrocable, Jardín Botánico, Plaza Botero y los murales de las comunas.', imagen:'https://images.unsplash.com/photo-1633627425472-d07ac65e2a36?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:false, categoria:'Cultural', incluye:['Hotel El Poblado','Desayuno','Metrocable','Visita comunas','Guía local'], destacados:['Parque Arví','Plaza Botero','Jardín Botánico','Graffitour'] },
  { id:7, nombre:'Villa de Leyva Colonial', ubicacion:'Villa de Leyva, Boyacá', duracion:'2 días / 1 noche', precio:980000, descripcion:'Viaja en el tiempo en el pueblo colonial mejor conservado.', descripcionDetalle:'Plaza mayor, fósil de Kronosaurio y el Desierto de la Candelaria.', imagen:'https://images.unsplash.com/photo-1680552507798-d046e6180ead?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:false, categoria:'Cultural', incluye:['Posada colonial','Desayuno criollo','Recorrido histórico','Fósil Kronosaurio'], destacados:['Plaza mayor colonial','Fósil Kronosaurio','Desierto Candelaria','Arquitectura intacta'] },
  { id:8, nombre:'Caño Cristales Único', ubicacion:'La Macarena, Meta', duracion:'3 días / 2 noches', precio:2450000, descripcion:'El río más hermoso del mundo con sus 5 colores únicos.', descripcionDetalle:'El río de los cinco colores en el corazón de la biodiversidad colombiana.', imagen:'https://images.unsplash.com/photo-1541719065081-51ed2404bd8d?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80', destacado:true, categoria:'Naturaleza', incluye:['Vuelo desde Bogotá','Hospedaje','Todas las comidas','Guía certificado','Permiso ingreso'], destacados:['Río cinco colores','Biodiversidad única','Flora endémica','Cascadas naturales'] },
];
