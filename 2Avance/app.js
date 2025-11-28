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
const registroMensaje = document.getElementById('registro-mensaje');
const logoutButton = document.getElementById('logout-button'); 


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
// 2. LÓGICA DE CARGA DE DATOS (SELECT) Y ELIMINACIÓN (DELETE)
// =================================

async function cargarEstudiantes() {
    const tablaBody = document.querySelector('#tabla-estudiantes tbody');
    if (!tablaBody) return;
    
    tablaBody.innerHTML = ''; 

    // SELECT de datos de Supabase
    const { data, error } = await supabase
        .from('estudiante') 
        .select('id, nombre, email, edad, carrera'); 

    if (error) {
        console.error('Error al cargar estudiantes:', error);
        return;
    }

    if (data) {
        // Renderiza cada fila en la tabla HTML
        data.forEach(estudiante => {
            const tr = document.createElement('tr');
            
            // Columna para el botón "Eliminar"
            tr.innerHTML = `
                <td>${escapeHtml(estudiante.id)}</td>
                <td>${escapeHtml(estudiante.nombre)}</td>
                <td>${escapeHtml(estudiante.email)}</td>
                <td>${escapeHtml(estudiante.edad.toString())}</td>
                <td>${escapeHtml(estudiante.carrera)}</td>
                <td>
                    <button class="btn danger btn-delete" data-id="${escapeHtml(estudiante.id)}">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
        
        // Asignamos el evento de clic a CADA botón de eliminar recién creado
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const estudianteId = e.target.getAttribute('data-id');
                if (confirm(`¿Está seguro de que desea eliminar al estudiante con ID ${estudianteId}?`)) {
                    eliminarEstudiante(estudianteId); // Llama a la función DELETE
                }
            });
        });
    }
}

// Función para eliminar estudiante (DELETE)
async function eliminarEstudiante(id) {
    // 1. Mostrar mensaje de carga
    registroMensaje.textContent = `Eliminando estudiante ${id}...`;
    registroMensaje.style.color = 'black'; 
    registroMensaje.classList.remove('sr-only');

    // Ejecuta la operación DELETE en la tabla 'estudiante' filtrando por 'id'
    const { error } = await supabase
        .from('estudiante')
        .delete()
        .eq('id', id); 

    if (error) {
        console.error('Error al eliminar estudiante:', error);
        // Muestra el mensaje de error de Supabase para depuración
        registroMensaje.textContent = `Error al eliminar al estudiante ${id}: ${error.message}. CAUSA: ${error.code}.`;
        registroMensaje.style.color = 'red';
        return;
    }

    // 2. Éxito: Mostrar mensaje y Recargar la tabla
    registroMensaje.textContent = `Estudiante ${id} eliminado correctamente.`;
    registroMensaje.style.color = 'orange';
    
    await cargarEstudiantes(); 
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
        // Si la pestaña es "estudiantes", recargar los datos
        if (target === 'estudiantes') {
             cargarEstudiantes(); 
        }
    });
});

// LOGIN (Simulado)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!loginForm.reportValidity()) return;
    
    loginView.hidden = true;
    modulesBar.hidden = false;
    
    // Muestra la vista de estudiantes por defecto
    showTab('estudiantes'); 
    
    // CARGA LOS DATOS DE SUPABASE DESPUÉS DEL LOGIN
    cargarEstudiantes(); 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// LOGOUT (Cerrar Sesión Simulado)
logoutButton && logoutButton.addEventListener('click', () => {
    handleLogout();
});

function handleLogout() {
    loginView.hidden = false;
    modulesBar.hidden = true;
    tabContents.forEach(t => t.hidden = true);
    document.querySelector('.modules-link.active')?.classList.remove('active');
    loginForm.reset();
    registroMensaje.classList.add('sr-only');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


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
        .from('estudiante') 
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
    
    // Recargar la tabla y cambiar a la vista de estudiantes
    await cargarEstudiantes(); 
    showTab('estudiantes');
});


// =================================
// 5. LÓGICA DE FILTROS
// =================================

// Buscador/filtro simple para estudiantes
function filtrarEstudiantes() {
    const query = document.getElementById('filtro').value.toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
    filas.forEach(row => {
        // Obtenemos las celdas de ID y Nombre (índice 0 y 1)
        const idText = row.cells[0]?.textContent.toLowerCase() || '';
        const nameText = row.cells[1]?.textContent.toLowerCase() || '';

        const match = idText.includes(query) || nameText.includes(query);
        row.style.display = match || query === '' ? '' : 'none';
    });
}
window.filtrarEstudiantes = filtrarEstudiantes; 

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
window.filtrarCursos = filtrarCursos;
document.getElementById('limpiar-cursos')?.addEventListener('click', () => {
    document.getElementById('creditos').value = '';
    filtrarCursos();
});