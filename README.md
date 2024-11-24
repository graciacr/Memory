# Proyecto **Memory Game** 🎮🃏

Crea una **WebApp multijugador** para jugar al clásico juego **Memory** de forma remota, con un tablero interactivo y comunicación en tiempo real gracias a **WebSockets**. 

---

## 🚀 **¿Qué es?**

**Memory Game** es un juego donde dos jugadores compiten para encontrar parejas de cartas.  
- **Tablero**: 4x4 (16 casillas, 8 parejas de cartas).  
- **Objetivo**: Voltear cartas para encontrar parejas.  
- **Dinámica**: 
  - Cada jugador realiza su turno mientras el otro espera.
  - Las cartas volteadas y los resultados se sincronizan en tiempo real.

---

## 🛠️ **Funcionalidades principales**

✅ **Juego multijugador en tiempo real**  
   - Conecta a dos jugadores de forma remota.  
   - Soporta múltiples partidas simultáneas (¡hasta 3 partidas al mismo tiempo!).  

✅ **Sincronización de jugadas**  
   - Ambos jugadores ven los movimientos de su oponente en tiempo real.  
   - El servidor gestiona los turnos y valida las jugadas.  

✅ **Interfaz interactiva y educativa**  
   - Cartas con imágenes aptas para un entorno escolar.  
   - Mensajes claros: *“Esperando jugador…”, “Es tu turno”, “Partida finalizada”*.  
   - Al final, muestra el tablero, el ganador y la opción de volver a jugar.

---

## ⚙️ **Requisitos técnicos**

### 📌 **Tecnologías necesarias**  
1. **Node.js**: Para ejecutar el servidor de WebSockets.  
2. **WebSockets**: Comunicación en tiempo real entre los jugadores.  
3. **HTML/CSS/JavaScript**: Para crear la interfaz gráfica.  

### 📌 **Materiales adicionales**  
- Imágenes educativas para las cartas (pueden buscarse online).  
- Tutoriales y recursos de apoyo (¡Google es tu amigo!).  

---

## 📝 **Tareas principales**

### 🧩 **1. Crear el servidor WebSockets**  
   - Gestionar turnos y sincronización entre jugadores.  
   - Manejar mensajes como:  
     - Conexión de jugadores.  
     - Jugadas y validación.  
     - Final de partida.  

### 🧩 **2. Diseñar la WebApp**  
   - Crear el tablero interactivo.  
   - Mostrar mensajes de estado:  
     - *“Esperando jugador…”*  
     - *“Turno del oponente”*  
     - *“Has ganado” o *“Has perdido”*.  

### 🧩 **3. Gestionar partidas simultáneas**  
   - Soportar varias partidas al mismo tiempo (3 partidas con 6 jugadores).  

---

## 🏁 **Flujo del juego**

1. **Inicio**:  
   - Jugador 1 entra a la sala → *“Esperando jugador…”*.  
   - Jugador 2 se une → empieza la partida.  

2. **Turnos**:  
   - El servidor indica quién juega y valida las jugadas.  
   - Se sincronizan las cartas volteadas para ambos jugadores.  

3. **Final de partida**:  
   - Cuando se encuentran todas las parejas:  
     - Muestra el tablero final.  
     - Declara al ganador.  
     - Ofrece opción de volver a jugar.  

---
