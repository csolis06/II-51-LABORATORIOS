/**
 * app.js (type=module)
 * CRUD básico estudiantes con Supabase (opción A).
 *
 * Asegúrate de que este archivo se cargue con:
 * <script type="module" src="app.js"></script>
 */

// Importa Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================
// CONFIGURA TU SUPABASE
// ==========================
const SUPABASE_URL = "https://uslhohtotkurtlabuoyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbGhvaHRvdGt1cnRsYWJ0bGFidW95YiIsInJvbGUiOiJhbG9uIiwiaWF0IjoxNzYwNTYxMTEwLCJleHAiOjIwNzYxMzcxMTB9.jXwM0zRTakBiCVSKGWsGtgZRGkHVNBSVOyZr3bw5RYI";

// Crear cliente Supabase y exponerlo (por si se quiere usar desde consola)
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----- Elementos del DOM -----
const loginForm = document.getElementById('login-form');
const loginView = document.getElementById('login-view');
const modulesBar = document.getElementById('modules-bar');
const moduleButtons = document.querySelectorAll('.modules-link');
const tabContents = document.querySelectorAll('.tab-content');

const formRegistro = document.getElementById('form-registro');
const tablaEstudiantesBody = document.querySelector('#tabla-estudiantes tbody');
const registroMensaje = document.getElementById('registro-mensaje');
const registroTitle = document.getElementById('registro-title');
const registroSubmit = document.getElementById('registro-submit');
const registroReset = document.getElementById('registro-reset');
const logoutBtn = document.getElementById('logout-btn');

const filtroInput = document.getElementById('filtro');
const limpiarFiltroBtn = document.getElementById('limpiar-filtro');

// Estado local para saber si estamos en modo edición
let editingId = null;

// Utilidades
function escapeHtml(text = '') {
    return String(text).replace(/[&<>"']/g, function(m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m];
    });
}
function showStatus(element, msg, srOnly=false) {
    if (!element) return;
    element.textContent = msg;
    element.classList.toggle('sr-only', !srOnly);
}

// -------------- Login simulado --------------
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!loginForm.reportValidity()) return;

    // Simulamos login: habilitamos barra y cargamos estudiantes de Supabase
    loginView.hidden = true;
    modulesBar.hidden = false;
    tabContents.forEach(t => t.hidden = true);

    const defaultTab = document.getElementById('estudiantes');
    if (defaultTab) defaultTab.hidden = false;

    // marcar botón activo
    const btn = document.querySelector('.modules-link[data-target="estudiantes"]');
    moduleButtons.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // cargar datos desde supabase
    cargarEstudiantes();
});

// Logout simulado: volver a la vista login
logoutBtn?.addEventListener('click', () => {
    modulesBar.hidden = true;
    tabContents.forEach(t => t.hidden = true);
    loginView.hidden = false;
    moduleButtons.forEach(b => b.classList.remove('active'));
    tablaEstudiantesBody.innerHTML = '';
});

// Navegación entre pestañas
function showTab(id) {
    tabContents.forEach(t => t.hidden = true);
    moduleButtons.forEach(b => b.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.hidden = false;
    const btn = document.querySelector('.modules-link[data-target="' + id + '"]');
    if (btn) btn.classList.add('active');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
moduleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        showTab(target);
        // Si se mostraron estudiantes, recarga opcionalmente
        if (target === 'estudiantes') cargarEstudiantes();
    });
});

// Inicial: ocultar barra y pestañas (si se carga directo)
window.addEventListener('load', () => {
    modulesBar.hidden = true;
    tabContents.forEach(t => t.hidden = true);
});

// ------------------ CRUD Supabase ------------------

// Cargar todos los estudiantes desde Supabase y renderizar la tabla
export async function cargarEstudiantes() {
    try {
        tablaEstudiantesBody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
        const { data, error } = await window.supabase
            .from('estudiantes')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        renderEstudiantes(data || []);
        showStatus(document.getElementById('estudiantes-status'), `Cargados ${data?.length ?? 0} estudiantes.`, true);
    } catch (err) {
        console.error('Error cargando estudiantes:', err);
        tablaEstudiantesBody.innerHTML = `<tr><td colspan="6">Error al cargar datos.</td></tr>`;
        showStatus(document.getElementById('estudiantes-status'), 'Error al cargar estudiantes.', true);
    }
}

// Renderiza filas en la tabla y añade botones de editar/eliminar
function renderEstudiantes(lista) {
    tablaEstudiantesBody.innerHTML = '';
    if (!lista || lista.length === 0) {
        tablaEstudiantesBody.innerHTML = '<tr><td colspan="6">No hay estudiantes registrados.</td></tr>';
        return;
    }

    lista.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;

        tr.innerHTML = `
            <td>${escapeHtml(item.id)}</td>
            <td>${escapeHtml(item.nombre)}</td>
            <td>${escapeHtml(item.email)}</td>
            <td>${escapeHtml(item.edad ?? '')}</td>
            <td>${escapeHtml(item.carrera)}</td>
            <td>
                <button class="btn small edit-btn" data-id="${escapeHtml(item.id)}">Editar</button>
                <button class="btn small danger delete-btn" data-id="${escapeHtml(item.id)}">Eliminar</button>
            </td>
        `;
        tablaEstudiantesBody.appendChild(tr);
    });

    // Delegación de eventos para botones
    tablaEstudiantesBody.querySelectorAll('.edit-btn').forEach(b => {
        b.addEventListener('click', (ev) => {
            const id = ev.currentTarget.dataset.id;
            iniciarEdicion(id);
        });
    });
    tablaEstudiantesBody.querySelectorAll('.delete-btn').forEach(b => {
        b.addEventListener('click', (ev) => {
            const id = ev.currentTarget.dataset.id;
            confirmarYEliminar(id);
        });
    });
}

// Insertar nuevo estudiante en Supabase
async function crearEstudiante(obj) {
    try {
        const { data, error } = await window.supabase
            .from('estudiantes')
            .insert([obj]);

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

// Actualizar estudiante por id
async function actualizarEstudiante(id, obj) {
    try {
        const { data, error } = await window.supabase
            .from('estudiantes')
            .update(obj)
            .eq('id', id);

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

// Eliminar estudiante por id
async function eliminarEstudiante(id) {
    try {
        const { data, error } = await window.supabase
            .from('estudiantes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

// Confirmar y ejecutar eliminación
async function confirmarYEliminar(id) {
    const ok = confirm(`¿Eliminar el estudiante con ID ${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    const { error } = await eliminarEstudiante(id);
    if (error) {
        alert('Error al eliminar: ' + (error.message || error));
        console.error(error);
    } else {
        alert('Estudiante eliminado.');
        await cargarEstudiantes();
    }
}

// Iniciar edición: cargar datos en el formulario
async function iniciarEdicion(id) {
    try {
        const { data, error } = await window.supabase
            .from('estudiantes')
            .select('*')
            .eq('id', id)
            .limit(1)
            .single();

        if (error) throw error;

        document.getElementById('reg-id').value = data.id;
        document.getElementById('reg-nombre').value = data.nombre;
        document.getElementById('reg-email').value = data.email;
        document.getElementById('reg-edad').value = data.edad ?? '';
        document.getElementById('reg-carrera').value = data.carrera ?? '';

        // Marcar en modo edición
        editingId = id;
        registroTitle.textContent = `Editar Estudiante — ${id}`;
        registroSubmit.textContent = 'Actualizar';
        // Deshabilitar cambiar ID (clave primaria)
        document.getElementById('reg-id').disabled = true;

        // Ir a pestaña registro
        showTab('registro');
    } catch (err) {
        alert('Error al cargar datos del estudiante para edición.');
        console.error(err);
    }
}

// Reset del formulario (salir de edición)
function salirEdicion() {
    editingId = null;
    registroTitle.textContent = 'Registro de Estudiantes';
    registroSubmit.textContent = 'Registrar';
    document.getElementById('reg-id').disabled = false;
    formRegistro.reset();
}

// --------------- Form registro (create / update) ---------------
formRegistro && formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formRegistro.reportValidity()) return;

    const id = document.getElementById('reg-id').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const edadStr = document.getElementById('reg-edad').value.trim();
    const edad = edadStr === '' ? null : Number(edadStr);
    const carrera = document.getElementById('reg-carrera').value;

    // objeto a enviar
    const estudianteObj = { id, nombre, email, edad, carrera };

    if (editingId) {
        // actualizar
        const { error } = await actualizarEstudiante(editingId, estudianteObj);
        if (error) {
            alert('Error al actualizar: ' + (error.message || error));
            console.error(error);
            return;
        }
        alert('Estudiante actualizado.');
        salirEdicion();
        await cargarEstudiantes();
        showTab('estudiantes');
    } else {
        // crear (verificamos que no exista ya)
        // Opcional: check local o via supabase
        const { data: existing, error: fetchErr } = await window.supabase
            .from('estudiantes')
            .select('id')
            .eq('id', id)
            .limit(1);

        if (fetchErr) {
            console.error(fetchErr);
            alert('Error al validar existencia: ' + (fetchErr.message || fetchErr));
            return;
        }
        if (existing && existing.length > 0) {
            alert('Ya existe un estudiante con ese ID. Si quieres modificarlo usa Editar.');
            return;
        }

        const { data, error } = await crearEstudiante(estudianteObj);
        if (error) {
            alert('Error al crear estudiante: ' + (error.message || error));
            console.error(error);
            return;
        }
        alert('Estudiante registrado correctamente.');
        formRegistro.reset();
        await cargarEstudiantes();
        showTab('estudiantes');
    }
});

// Reset handler: salir modo edición si presionan limpiar
registroReset && registroReset.addEventListener('click', (e) => {
    salirEdicion();
});

// ------- Buscador/filtro simple para estudiantes -------
window.filtrarEstudiantes = function() {
    const query = (filtroInput?.value || '').toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
    filas.forEach(row => {
        const cells = Array.from(row.cells).map(c => c.textContent.toLowerCase());
        const match = cells.some(text => text.includes(query));
        row.style.display = match || query === '' ? '' : 'none';
    });
};
limpiarFiltroBtn?.addEventListener('click', () => {
    if (filtroInput) filtroInput.value = '';
    filtrarEstudiantes();
});

// Al cargar la página, dejamos la tabla vacía (mostramos mensaje)
tablaEstudiantesBody.innerHTML = '<tr><td colspan="6">Inicia sesión para cargar estudiantes desde Supabase.</td></tr>';
