import { supabase } from "./supebaseclient.js";

const form = document.getElementById("curso-form");
const inputId = document.getElementById("id");
const inputCodigo = document.getElementById("codigo");
const inputNombre = document.getElementById("nombre");
const inputCreditos = document.getElementById("creditos");
const btnSave = document.getElementById("btn-save");
const btnCancel = document.getElementById("btn-cancel");
const statusDiv = document.getElementById("status");
let editando = false;
let listaCursos = document.getElementById("lista");
//========================
//Eventos
//========================
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = inputCodigo.value.trim();
    const nombre = inputNombre.value.trim();
    const creditos = parseInt(inputCreditos.value.trim());
    if (editando) {}
    else {await crearCurso(codigo, nombre, creditos);}

    form.reset();
});

listaCursos.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.getAttribute("data-id");
        await eliminarCursos(id);
        cargarCursos();
    }
});

//===================================
//CRUD (CREATE-READ-UPDATE-DELETE)
//===================================
async function cargarCursos() {
    let { data: cursos, error } = await supabase.from("Cursos").select("*");
    console.log(cursos);
    
    if (error) {
        console.error("Error al cargar cursos:", error);
        return;
    }
    listaCursos.innerHTML = "";
    cursos.forEach(curso => {
        let li = document.createElement("li");
        //li.textContent = curso.codigo + " - " + curso.nombre;
        li.innerHTML = `${curso.codigo} - ${curso.nombre} [${curso.creditos} Creditos] <button class="btn-delete" data-id="${curso.id}">Eliminar</button>`;
        listaCursos.appendChild(li);
    });
}
async function crearCurso(codigo, nombre, creditos) {
    const curso = { codigo, nombre, creditos };
    let { error } = await supabase.from("Cursos").insert([curso]);
    if (error) {
        console.error(error);
    }
    cargarCursos();
}

async function eliminarCursos(id) {
    let { error } = await supabase.from("Cursos").delete().eq("id", id);
    if (error) {
        console.error(error);
    } 
}
  
cargarCursos(); 
 