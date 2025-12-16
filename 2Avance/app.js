// Importa el cliente Supabase
import { supabase } from "./supabaseClient.js";

// =================================
// 1. DECLARACIÓN DE VARIABLES Y FUNCIONES DE UTILIDAD
// =================================

// Elementos principales del DOM
const loginForm = document.getElementById('login-form');
const loginView = document.getElementById('login-view');
const modulesBar = document.getElementById('modules-bar');
const moduleButtons = document.querySelectorAll('.modules-link');
const tabContents = document.querySelectorAll('.tab-content');
const formRegistro = document.getElementById('form-registro');
const tablaEstudiantes = document.querySelector('#tabla-estudiantes tbody');
const registroMensaje = document.getElementById('registro-mensaje');


// Función para sanitizar HTML
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Función para mostrar pestañas
function showTab(id) {
    tabContents.forEach(t => t.hidden = true);
    moduleButtons.forEach(b => b.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.hidden = false;
    const btn = document.querySelector('.modules-link[data-target="' + id + '"]');
    if (btn) btn.classList.add('active');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =================================
// 2. LÓGICA DE CARGA DE DATOS (SELECT)
// =================================

async function cargarEstudiantes() {
    const tablaBody = document.querySelector('#tabla-estudiantes tbody');
    if (!tablaBody) return;
    
    // Limpia la tabla antes de cargar datos nuevos
    tablaBody.innerHTML = ''; 

    // SELECT de datos de Supabase
    const { data, error } = await supabase
        .from('estudiante') // Nombre de tu tabla: 'estudiante'
        .select('id, nombre, email, edad, carrera'); 

    if (error) {
        console.error('Error al cargar estudiantes:', error);
        registroMensaje.textContent = `Error al cargar datos: ${error.message}`;
        registroMensaje.style.color = 'red';
        return;
    }

    if (data) {
        // Renderiza cada fila en la tabla HTML
        data.forEach(estudiante => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHtml(estudiante.id)}</td><td>${escapeHtml(estudiante.nombre)}</td><td>${escapeHtml(estudiante.email)}</td><td>${escapeHtml(estudiante.edad.toString())}</td><td>${escapeHtml(estudiante.carrera)}</td>`;
            tablaBody.appendChild(tr);
        });
    }
}


// =================================
// 3. EVENT LISTENERS
// =================================

// Inicialización (Ocultar módulos al cargar)
window.addEventListener('load', () => {
    modulesBar.hidden = true;
    tabContents.forEach(t => t.hidden = true);
});

// Mostrar pestaña al hacer click en la barra
moduleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        showTab(target);
    });
});

// LOGIN (Simulado)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!loginForm.reportValidity()) return;
    
    loginView.hidden = true;
    modulesBar.hidden = false;
    tabContents.forEach(t => t.hidden = true);
    
    // Muestra la vista de estudiantes
    const defaultTab = document.getElementById('estudiantes');
    if (defaultTab) defaultTab.hidden = false;
    const btn = document.querySelector('.modules-link[data-target="estudiantes"]');
    if (btn) btn.classList.add('active');
    
    // CARGA LOS DATOS DE SUPABASE DESPUÉS DEL LOGIN
    cargarEstudiantes(); 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// =================================
// 4. LÓGICA DE REGISTRO (INSERT)
// =================================

// Manejar el envío del formulario de registro
formRegistro && formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formRegistro.reportValidity()) return;

    // 1. Recoger datos
    const id = document.getElementById('reg-id').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const edad = parseInt(document.getElementById('reg-edad').value.trim(), 10);
    const carrera = document.getElementById('reg-carrera').value;

    const nuevoEstudiante = {
        id: id,
        nombre: nombre,
        email: email,
        edad: edad,
        carrera: carrera
    };

    // 2. Mensaje de carga
    registroMensaje.textContent = 'Registrando estudiante...';
    registroMensaje.style.color = 'black'; 
    registroMensaje.classList.remove('sr-only');

    // INSERCIÓN de datos en Supabase
    const { error } = await supabase
        .from('estudiante') // Nombre de tu tabla en Supabase
        .insert([nuevoEstudiante]);

    // 3. Manejar la respuesta
    if (error) {
        console.error('Error al registrar en Supabase:', error);
        registroMensaje.textContent = `Error al registrar: ${error.message}`;
        registroMensaje.style.color = 'red';
        return;
    }

    // 4. Éxito
    registroMensaje.textContent = `Estudiante ${nombre} (${id}) registrado correctamente.`;
    registroMensaje.style.color = 'green';
    formRegistro.reset();
    
    // Recargar la tabla para mostrar el nuevo registro
    await cargarEstudiantes(); 
    showTab('estudiantes');
});


// =================================
// 5. LÓGICA DE FILTROS (Existente)
// =================================

// Buscador/filtro simple para estudiantes
function filtrarEstudiantes() {
    const query = document.getElementById('filtro').value.toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
    filas.forEach(row => {
        const cells = Array.from(row.cells).map(c => c.textContent.toLowerCase());
        const match = cells.some(text => text.includes(query));
        row.style.display = match || query === '' ? '' : 'none';
    });
}
document.getElementById('limpiar-filtro')?.addEventListener('click', () => {
    document.getElementById('filtro').value = '';
    filtrarEstudiantes();
});

// Filtro simple para cursos
function filtrarCursos() {
    const creditos = document.getElementById('creditos').value.trim();
    const filas = document.querySelectorAll('#cursos .data-table tbody tr');
    filas.forEach(row => {
        const c = row.cells[2].textContent.trim();
        if (creditos === '') row.style.display = '';
        else row.style.display = (c === creditos) ? '' : 'none';
    });
}
document.getElementById('limpiar-cursos')?.addEventListener('click', () => {
    document.getElementById('creditos').value = '';
    filtrarCursos();
});