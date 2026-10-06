# GUÍA DE DESPLIEGUE RÁPIDO — JP FITNESS CONTROL
**Cuenta asignada:** `gmusicestudio@gmail.com`

El sistema está compuesto por 2 archivos principales listos para copiar y pegar:
1. `Code.gs` (Backend, API, Motor de Recomposición y Sobrecarga Progresiva)
2. `Index.html` (Interfaz de usuario Web App para celular y computador)

Sigue estos 5 sencillos pasos para dejarlo 100% operativo en tu cuenta de Google:

---

### Paso 1: Crear la Hoja de Cálculo en Google Drive
1. Inicia sesión en Google con **`gmusicestudio@gmail.com`**.
2. Ve a [Google Sheets](https://sheets.new) y crea una nueva hoja en blanco.
3. Nómbrala en la esquina superior izquierda como:
   `JP Fitness Control - Base de Datos`

---

### Paso 2: Abrir el Editor de Apps Script
1. En el menú superior de la hoja de cálculo, haz clic en **Extensiones** $\rightarrow$ **Apps Script**.
2. Se abrirá una nueva pestaña con el editor de código. Nombra el proyecto como `JP Fitness Control App`.

---

### Paso 3: Pegar los Archivos del Proyecto

#### 3.1. Archivo `Code.gs`
1. En el editor verás un archivo llamado `Código.gs` (o `Code.gs`).
2. Borra todo lo que tenga adentro.
3. Abre el archivo local [`Code.gs`](file:///Volumes/Juan%20lizama%20h/fitnes%20jp/Code.gs), copia todo su contenido y pégalo en el editor de Google.
4. Presiona el ícono del disquete 💾 (**Guardar proyecto**).

#### 3.2. Archivo `Index.html`
1. En el panel izquierdo del editor, haz clic en el botón **+** (junto a "Archivos") y selecciona **HTML**.
2. Nombra el archivo exactamente como: `Index` (Apps Script le agregará automáticamente el `.html`).
3. Borra el código inicial por defecto.
4. Abre el archivo local [`Index.html`](file:///Volumes/Juan%20lizama%20h/fitnes%20jp/Index.html), copia todo su contenido y pégalo en el editor.
5. Presiona 💾 (**Guardar proyecto**).

---

### Paso 4: Inicializar las 9 Hojas Automáticamente
1. En la barra de herramientas superior del editor de Apps Script, busca el menú desplegable de funciones (donde dice `myFunction` o similar).
2. Selecciona la función: **`setupSheets`**.
3. Haz clic en el botón **Ejecutar** (ícono de reproducir ▶️).
4. **Permisos de Google:**
   - Te saldrá un aviso: *"Se requiere autorización"*. Haz clic en **Revisar permisos**.
   - Elige tu cuenta `gmusicestudio@gmail.com`.
   - Haz clic en **Avanzado** (o *Advanced*) $\rightarrow$ **Ir a JP Fitness Control (no seguro)** $\rightarrow$ **Permitir**.
5. Regresa a la pestaña de tu Google Sheet: **¡Verás que se crearon y formatearon automáticamente las 9 pestañas con todos tus datos iniciales, alimentos y rutinas!**

---

### Paso 5: Implementar y Usar como Web App en tu Celular
1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **Implementar** (Deploy) $\rightarrow$ **Nueva implementación**.
2. Haz clic en el ícono de engranaje ⚙️ (Seleccionar tipo) $\rightarrow$ **Aplicación web**.
3. Configura los 3 campos:
   - **Descripción:** `JP Fitness Control v1`
   - **Ejecutar como:** `Yo (gmusicestudio@gmail.com)`
   - **Quién tiene acceso:** `Solo yo` (o *Cualquier persona con una cuenta de Google* si prefieres no loguearte cada vez).
4. Haz clic en **Implementar**.
5. Copia la **URL de la aplicación web** generada.

---

### 📲 Cómo añadirla a la pantalla de inicio de tu celular (Icono de App Nativa)
* **En iPhone (Safari):** Abre el enlace $\rightarrow$ Botón *Compartir* $\rightarrow$ **"Agregar a pantalla de inicio"**.
* **En Android (Chrome):** Abre el enlace $\rightarrow$ Menú tres puntos $\rightarrow$ **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.

¡Listo! Ya tienes tu centro de control de recomposición corporal funcionando con tu base de datos privada en Google Sheets.
