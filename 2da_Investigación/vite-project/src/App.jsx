import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  useReducer,
  createContext
} from "react";

// CONTEXT (para useContext)

const ThemeContext = createContext();

// REDUCER (para useReducer)

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { value: state.value + 1 };
    case "decrement":
      return { value: state.value - 1 };
    default:
      return state;
  }
}

// --------------------------------------------------
// COMPONENTE PRINCIPAL — Usa los 6 hooks
// --------------------------------------------------
function App() {
  // 1. useState 
  const [name, setName] = useState("");

  // 2. useEffect → Efecto secundario
  useEffect(() => {
    console.log("El nombre ha cambiado:", name);
  }, [name]);

  // 3. useMemo → Memoriza cálculos
  const nameLength = useMemo(() => {
    console.log("Calculando longitud del nombre...");
    return name.length;
  }, [name]);

  // 4. useCallback → Memoriza funciones
  const showAlert = useCallback(() => {
    alert(`Hola, ${name || "usuario"}!`);
  }, [name]);

  // 5. useContext → Acceso a contexto global
  const theme = useContext(ThemeContext);

  // 6. useReducer → Lógica de estado más compleja
  const [countState, dispatch] = useReducer(counterReducer, { value: 0 });

  return (
    <div style={{ padding: 20, background: theme === "dark" ? "#222" : "#f3f3f3", color: theme === "dark" ? "white" : "black" }}>
      <h1>Ejemplo de Hooks</h1>

      {/* useState */}
      <input
        type="text"
        placeholder="Escriba su nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* useMemo */}
      <p>Numero de caracteres: {nameLength}</p>

      {/* useCallback */}
      <button onClick={showAlert}>Saludar</button>

      {/* useReducer */}
      <div style={{ marginTop: 20 }}>
        <h3>Contador: {countState.value}</h3>
        <button onClick={() => dispatch({ type: "increment" })}>+</button>
        <button onClick={() => dispatch({ type: "decrement" })} style={{ marginLeft: 10 }}>-</button>
      </div>
    </div>
  );
}

// --------------------------------------------------
// WRAPPER con contexto global (Theme)
// --------------------------------------------------
export default function AppWrapper() {
  return (
    <ThemeContext.Provider value="dark">
      <App />
    </ThemeContext.Provider>
  );
}