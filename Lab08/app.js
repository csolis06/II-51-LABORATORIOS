import { supabase } from "./supabaseClient.js";    

// =================
// Referencias HTML
// =================
const from = document.getElementById("curso-form"); 

const inputId = document.getElementById("id"); 
const inputCodigo = document.getElementById("codigo");
const inputNombre = document.getElementById("nombre"); 
const inputCreditos = document.getElementById("creditos");
const btnSave = document.getElementById("btn-save"); 
const btnCancel = document.getElementById("btn-cancel"); 
const statusDiv = document.getElementById("status");
let editando = false;

// =================
// Eventos
// =================
from.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = inputCodigo.value.trim();
    // CORRECCIÓN ADICIONAL: La variable en el objeto debe coincidir con la columna en Supabase ('nombre_Curso')
    const nombreCurso = inputNombre.value.trim(); // Se renombra a nombreCurso para evitar confusión
    const creditos = parseInt(inputCreditos.value.trim());
    if (editando) {}
    else {await crearCurso(codigo, nombreCurso, creditos);}
  });

// ===================================
// CRUD (Create, Read, Update, Delete)
// ====================================
async function cargarCursos() {
    // Asegúrate de que estás seleccionando el ID del curso ('idCurso' en tu esquema)
    let { data: cursos, error } = await supabase.from("cursos").select("idCurso, codigo, nombre_Curso, creditos");
    
    console.log(cursos);
    if (error) {
        console.error("Error al cargar cursos:", error);
        return;
    }
    
    let listaCursos = document.getElementById("lista");
    listaCursos.innerHTML = "";
    
    cursos.forEach((curso) => {
        let li = document.createElement("li");
        // Clase de Bootstrap para el elemento de lista
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        
        // Contenido del curso
        let cursoTexto = document.createElement("span");
        cursoTexto.textContent = `${curso.codigo} - ${curso.nombre_Curso} [${curso.creditos} créditos]`;
        li.appendChild(cursoTexto);

        // CREACIÓN DEL BOTÓN ELIMINAR
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        // Clases de Bootstrap y estilo para el botón
        btnEliminar.className = "btn btn-outline-danger btn-sm ml-3"; 
        
        // Asignar el ID del curso al botón usando un data attribute
        btnEliminar.dataset.id = curso.idCurso; 
        
        // Evento click para eliminar
        btnEliminar.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            // Llamar a la función de eliminación
            eliminarCurso(id);
        });

        li.appendChild(btnEliminar); // Agregar el botón al elemento de la lista
        listaCursos.appendChild(li); // Agregar el elemento completo a la lista
    });
}

// Crear Curso
async function crearCurso(codigo, nombreCurso, creditos) {
    // La clave debe ser 'nombre_Curso' para coincidir con la columna de Supabase
    const curso = {codigo: codigo, nombre_Curso: nombreCurso, creditos: creditos}; 
    let {error} = await supabase.from("cursos").insert([curso]);
    if (error) { 
        console.error(error);
        return;
    }
    cargarCursos(); 
}

// NUEVA FUNCIÓN: Eliminar Curso
async function eliminarCurso(id) {
    // Confirmación opcional para evitar eliminaciones accidentales
    if (!confirm("¿Estás seguro de que quieres eliminar este curso?")) {
        return;
    }

    let { error } = await supabase
        .from('cursos')
        .delete()
        // El idCurso es el nombre de la columna clave en tu tabla
        .eq('idCurso', id); 

    if (error) {
        console.error("Error al eliminar el curso:", error);
    } else {
        // Recargar la lista después de una eliminación exitosa
        cargarCursos(); 
    }
}


cargarCursos(); // Llama a la función al inicio