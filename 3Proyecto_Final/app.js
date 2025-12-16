import { supabase } from "./supabaseClient.js";

// =================================
// 1. DECLARACIÓN DE VARIABLES
// =================================

const loginForm = document.getElementById('login-form');
const welcomeMessage = document.getElementById('welcome-message');
const loginView = document.getElementById('login-view');
const modulesBar = document.getElementById('modules-bar');
const moduleButtons = document.querySelectorAll('.modules-link');
const tabContents = document.querySelectorAll('.tab-content');
const formRegistro = document.getElementById('form-registro');

let registroMensaje = document.getElementById('registro-mensaje');
let estudianteEditando = null;
let cursoEditando = null;
let profesorEditando = null;

if (!registroMensaje) {
    registroMensaje = document.createElement('div');
    registroMensaje.id = 'registro-mensaje';
    document.body.appendChild(registroMensaje);
}

const logoutButton = document.getElementById('logout-button');

// =================================
// UTILIDADES
// =================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showTab(id) {
    tabContents.forEach(t => t.hidden = true);
    moduleButtons.forEach(b => b.classList.remove('active'));

    if (id === 'inicio') {
        welcomeMessage.hidden = false;
    } else {
        welcomeMessage.hidden = true;
        const el = document.getElementById(id);
        if (el) el.hidden = false;
    }

    const btn = document.querySelector(
        `.modules-link[data-target="${id}"]`
    );
    if (btn) btn.classList.add('active');
}

// =================================
// ESTUDIANTES
// =================================

async function cargarestudiante() {
    const tablaBody = document.querySelector('#tabla-estudiante tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '';

    const { data, error } = await supabase
        .from('estudiante')
        .select('id, nombre, email, edad, carrera, curso');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(est => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${escapeHtml(est.id)}</td>
            <td>${escapeHtml(est.nombre)}</td>
            <td>${escapeHtml(est.email)}</td>
            <td>${escapeHtml(est.edad.toString())}</td>
            <td>${escapeHtml(est.carrera)}</td>
            <td>${escapeHtml(est.curso)}</td>
            <td>
                <button class="btn btn-edit-est" data-id="${est.id}">✏️</button>
            </td>
            <td>
                <button class="btn danger btn-delete" data-id="${est.id}">
                    Eliminar
                </button>
            </td>
        `;

        tablaBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.dataset.id;
            if (confirm(`¿Eliminar estudiante ${id}?`)) {
                eliminarEstudiante(id);
            }
        });
    });

    document.querySelectorAll('.btn-edit-est').forEach(btn => {
        btn.addEventListener('click', e => {
            editarEstudiante(e.target.dataset.id);
        });
    });
}

document.getElementById('buscar-estudiante')?.addEventListener('submit', e => {
    e.preventDefault();
    filtrarEstudiantes();
});
async function eliminarEstudiante(id) {
    registroMensaje.textContent = `Eliminando estudiante ${id}...`;
    registroMensaje.style.color = 'black';
    registroMensaje.classList.remove('sr-only');

    const { error } = await supabase
        .from('estudiante')
        .delete()
        .eq('id', id);

    if (error) {
        registroMensaje.textContent = `Error: ${error.message}`;
        registroMensaje.style.color = 'red';
        return;
    }

    registroMensaje.textContent =
        `Estudiante ${id} eliminado correctamente.`;
    registroMensaje.style.color = 'orange';

    await cargarestudiante();
}
async function editarEstudiante(id) {
    const { data, error } = await supabase
        .from('estudiante')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById('reg-id').value = data.id;
    document.getElementById('reg-id').disabled = true;
    document.getElementById('reg-nombre').value = data.nombre;
    document.getElementById('reg-email').value = data.email;
    document.getElementById('reg-edad').value = data.edad;
    document.getElementById('reg-carrera').value = data.carrera;
    document.getElementById('reg-curso').value = data.curso;

    estudianteEditando = id;
    showTab('registro');}
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formRegistro.reportValidity()) return;

    const estudiante = {
        id: document.getElementById('reg-id').value.trim(),
        nombre: document.getElementById('reg-nombre').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        edad: Number(document.getElementById('reg-edad').value),
        carrera: document.getElementById('reg-carrera').value,
        curso: document.getElementById('reg-curso').value
    };

    let error;

    if (estudianteEditando) {
        // 🔁 UPDATE
        ({ error } = await supabase
            .from('estudiante')
            .update(estudiante)
            .eq('id', estudianteEditando));
    } else {
        // ➕ INSERT
        ({ error } = await supabase
            .from('estudiante')
            .insert(estudiante));
    }

    if (error) {
        registroMensaje.textContent = error.message;
        registroMensaje.style.color = 'red';
        return;
    }

    registroMensaje.textContent = estudianteEditando
        ? ''
        : 'Estudiante registrado correctamente';
    registroMensaje.style.color = 'green';

    estudianteEditando = null;
    document.getElementById('reg-id').disabled = false;
    formRegistro.reset();

    await cargarestudiante();
    showTab('estudiante');
});


// =================================
// CURSOS
// =================================

async function cargarcursos() {
    const tablaBody = document.querySelector('#tabla-cursos tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '';

    const { data, error } = await supabase
        .from('cursos')
        .select('id1, nombre, creditos, carrera');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(curso => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${escapeHtml(curso.id1)}</td>
            <td>${escapeHtml(curso.nombre)}</td>
            <td>${escapeHtml(curso.creditos.toString())}</td>
            <td>${escapeHtml(curso.carrera)}</td>
            <td>
                <button class="btn btn-edit-curso" data-id="${curso.id1}">
                    ✏️
                </button>
            </td>
            <td>
                <button class="btn danger btn-delete-curso" data-id="${curso.id1}">
                    Eliminar
                </button>
            </td>
        `;

        tablaBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete-curso').forEach(btn => {
        btn.addEventListener('click', e => {
            if (confirm(`¿Eliminar curso ${e.target.dataset.id}?`)) {
                eliminarCurso(e.target.dataset.id);
            }
        });
    });


    document.querySelectorAll('.btn-edit-curso').forEach(btn => {
        btn.addEventListener('click', e => {
            editarCurso(e.target.dataset.id);
        });
    });
}

document.getElementById('buscar-cursos')?.addEventListener('submit', e => {
    e.preventDefault();
    filtrarCursos();
});

document.getElementById('limpiar-cursos')?.addEventListener('click', () => {
    document.getElementById('filtro-cursos').value = '';
    filtrarCursos();
});

async function editarCurso(id) {
    const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id1', id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById('cursos-id1').value = data.id1;
    document.getElementById('cursos-id1').disabled = false;
    cursoEditando = null;
    document.getElementById('cursos-nombre').value = data.nombre;
    document.getElementById('cursos-creditos').value = data.creditos;
    document.getElementById('cursos-carrera').value = data.carrera;

    cursoEditando = id;
    showTab('cursos');
}

async function eliminarCurso(id) {
    registroMensaje.textContent = `Eliminando curso ${id}...`;
    registroMensaje.style.color = 'black';

    const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id1', id);

    if (error) {
        registroMensaje.textContent = `Error: ${error.message}`;
        registroMensaje.style.color = 'red';
        return;
    }

    registroMensaje.textContent =
        `Curso ${id} eliminado correctamente.`;
    registroMensaje.style.color = 'orange';

    await cargarcursos();
}

document.getElementById('form-cursos').addEventListener('submit', async (e) => {
    e.preventDefault();

    const curso = {
        id1: document.getElementById('cursos-id1').value.trim(),
        nombre: document.getElementById('cursos-nombre').value.trim(),
        creditos: Number(document.getElementById('cursos-creditos').value),
        carrera: document.getElementById('cursos-carrera').value
    };

    let error;

    if (cursoEditando) {
        ({ error } = await supabase
            .from('cursos')
            .update(curso)
            .eq('id1', cursoEditando));
    } else {
        ({ error } = await supabase
            .from('cursos')
            .insert(curso));
    }

    if (error) {
        alert(error.message);
        return;
    }

    cursoEditando = null;
    document.getElementById('cursos-id1').disabled = false;
    e.target.reset();

    await cargarcursos();
});
// =================================
// PROFESORES
// =================================

async function cargarProfesores() {
    const tablaBody = document.querySelector('#tabla-profesores tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '';

    const { data, error } = await supabase
        .from('profesores')
        .select('id, nombre, email, sede, asignacion');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(prof => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${escapeHtml(prof.id)}</td>
            <td>${escapeHtml(prof.nombre)}</td>
            <td>${escapeHtml(prof.email)}</td>
            <td>${escapeHtml(prof.sede)}</td>
            <td>${escapeHtml(prof.asignacion)}</td>
            <td>
                <button class="btn btn-edit-prof" data-id="${prof.id}">
                    ✏️
                </button>
            </td>
            <td>
                <button class="btn danger btn-delete-prof" data-id="${prof.id}">
                    Eliminar
                </button>
            </td>
        `;

        tablaBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete-prof').forEach(btn => {
        btn.addEventListener('click', e => {
            if (confirm(`¿Eliminar profesor ${e.target.dataset.id}?`)) {
                eliminarProfesor(e.target.dataset.id);
            }
        });
    });

    document.querySelectorAll('.btn-edit-prof').forEach(btn => {
        btn.addEventListener('click', e => {
            editarProfesor(e.target.dataset.id);
        });
    });
}
document.getElementById('limpiar-profesores')?.addEventListener('click', () => {
    document.getElementById('filtro-profesores').value = '';
    filtrarProfesores();
});

async function eliminarProfesor(id) {
    registroMensaje.textContent = `Eliminando profesor ${id}...`;
    registroMensaje.style.color = 'black';

    const { error } = await supabase
        .from('profesores')
        .delete()
        .eq('id', id);

    if (error) {
        registroMensaje.textContent = `Error: ${error.message}`;
        registroMensaje.style.color = 'red';
        return;
    }

    registroMensaje.textContent =
        `Profesor ${id} eliminado correctamente.`;
    registroMensaje.style.color = 'orange';

    await cargarProfesores();
}
document.getElementById('buscar-profesores')?.addEventListener('submit', e => {
    e.preventDefault();
    filtrarProfesores();
});

document.getElementById('limpiar-filtro')?.addEventListener('click', () => {
    document.getElementById('filtro').value = '';
    filtrarEstudiantes();
});

async function editarProfesor(id) {
    const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById('prof-id').value = data.id;
    document.getElementById('prof-id').disabled = true;
    document.getElementById('prof-nombre').value = data.nombre;
    document.getElementById('prof-email').value = data.email;
    document.getElementById('prof-sede').value = data.sede;
    document.getElementById('prof-asignacion').value = data.asignacion;

    profesorEditando = id;
    showTab('profesores');
}
document.querySelectorAll('.btn-edit-est').forEach(btn => {
    btn.addEventListener('click', e => {
        console.log("Editando estudiante:", e.target.dataset.id);
        editarEstudiante(e.target.dataset.id);
    });
});

document.getElementById('form-profesor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const profesor = {
        id: document.getElementById('prof-id').value.trim(),
        nombre: document.getElementById('prof-nombre').value.trim(),
        email: document.getElementById('prof-email').value.trim(),
        sede: document.getElementById('prof-sede').value.trim(),
        asignacion: document.getElementById('prof-asignacion').value
    };

    let error;

    if (profesorEditando) {
        ({ error } = await supabase
            .from('profesores')
            .update(profesor)
            .eq('id', profesorEditando));
    } else {
        ({ error } = await supabase
            .from('profesores')
            .insert(profesor));
    }

    if (error) {
        alert(error.message);
        return;
    }

    profesorEditando = null;
    document.getElementById('prof-id').disabled = false;
    e.target.reset();

    await cargarProfesores();
});

// =================================
// EVENTOS LOGIN / LOGOUT
// =================================

window.addEventListener('load', () => {
    loginView.hidden = false;
    modulesBar.hidden = true;

    tabContents.forEach(t => t.hidden = true);
    welcomeMessage.hidden = true;

    moduleButtons.forEach(b => b.classList.remove('active'));
});

moduleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        showTab(target);

        if (target === 'estudiante') cargarestudiante();
        if (target === 'cursos') cargarcursos();
        if (target === 'profesores') cargarProfesores();
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!loginForm.reportValidity()) return;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    registroMensaje.textContent = 'Iniciando sesión...';
    registroMensaje.style.color = 'black';
    registroMensaje.classList.remove('sr-only');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        registroMensaje.textContent = 'Credenciales incorrectas';
        registroMensaje.style.color = 'red';
        return;
    }

    // LOGIN EXITOSO
    registroMensaje.textContent = `Bienvenido ${data.user.email}`;
    registroMensaje.style.color = 'green';

    loginView.hidden = true;
    modulesBar.hidden = false;

    showTab('inicio');
});

logoutButton?.addEventListener('click', async () => {
    await supabase.auth.signOut();

    loginView.hidden = false;
    modulesBar.hidden = true;

    tabContents.forEach(t => t.hidden = true);
    loginForm.reset();

    registroMensaje.textContent = 'Sesión cerrada';
    registroMensaje.style.color = 'black';
});
window.addEventListener('load', async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Usuario ya logueado
        loginView.hidden = true;
        modulesBar.hidden = false;
        showTab('inicio');
    } else {
        loginView.hidden = false;
        modulesBar.hidden = true;
        tabContents.forEach(t => t.hidden = true);
    }
});

// =================================
// FILTROS Y EDICIÓN
// =================================

function filtrarEstudiantes() {
    const q = document.getElementById('filtro').value.toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-estudiante tbody tr');

    filas.forEach(row => {
        const id = row.cells[0].textContent.toLowerCase();
        const nombre = row.cells[1].textContent.toLowerCase();

        row.style.display =
            id.includes(q) || nombre.includes(q) || q === ''
                ? ''
                : 'none';
    });
}

window.filtrarEstudiantes = filtrarEstudiantes;

function filtrarCursos() {
    const q = document.getElementById('filtro-cursos').value.toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-cursos tbody tr');

    filas.forEach(row => {
        const id = row.cells[0].textContent.toLowerCase();
        const nombre = row.cells[1].textContent.toLowerCase();

        row.style.display =
            id.includes(q) || nombre.includes(q) || q === ''
                ? ''
                : 'none';
    });
}

filtrarCursos();

function filtrarProfesores() {
    const q = document
        .getElementById('filtro-profesores')
        .value.toLowerCase()
        .trim();

    const filas = document.querySelectorAll('#tabla-profesores tbody tr');

    filas.forEach(row => {
        const id = row.cells[0].textContent.toLowerCase();
        const nombre = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();

        row.style.display =
            id.includes(q) ||
            nombre.includes(q) ||
            email.includes(q) ||
            q === ''
                ? ''
                : 'none';
    });
}

window.filtrarProfesores = filtrarProfesores;


