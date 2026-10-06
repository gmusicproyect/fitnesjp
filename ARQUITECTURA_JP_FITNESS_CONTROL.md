# JP FITNESS CONTROL — DOCUMENTO MAESTRO DE ARQUITECTURA
**Sistema Integral de Recomposición Corporal & Alto Rendimiento Personal**
*Plataforma: Google Sheets (Base de Datos) + Google Apps Script (Backend / Web App Responsive)*

---

## 1. Visión y Perfil Inicial del Atleta

El objetivo de **JP Fitness Control** no es ser un contador pasivo de calorías, sino un **centro de mando de recomposición corporal y sobrecarga progresiva**. El sistema centraliza métricas de nutrición, fuerza, recuperación y salud metabólica, integrando un motor de reglas para tomar decisiones objetivas semana a semana.

### Parámetros de Partida (Baseline JP - 42 años)
| Parámetro | Valor Inicial | Meta Principal | Notas Estratégicas |
| :--- | :--- | :--- | :--- |
| **Peso Corporal** | **102.0 kg** | **80.0 kg** | Ritmo objetivo: -0.5 a -0.7 kg/semana (~37 semanas) |
| **Edad / Estatura** | **42 años** / **168.5 cm** | Parámetros clínicos | TMB 1.868 kcal, Gasto 2.802 kcal |
| **Objetivo Nutricional** | **2.150 kcal/día** | Déficit 650 kcal | P: 153 g, G: 65 g, C: 238 g |
| **Distribución Semanal** | • Lun - Jue: Rutina dividida + Core<br>• Vie: Full Body<br>• Sáb: Caminata Zona 2<br>• Dom: Descanso | RIR 2 a 3 | Descansos: 120s en compuestos, 90s en aislamiento |
| **Métricas de Salud Críticas** | Frecuencia cardíaca en reposo (90-112 lpm), presión arterial con manguito, sueño (6.5h -> 7h+) | Cuidado Cardiovascular | Chequeo médico preventivo y electrocardiograma |

---

## 2. Arquitectura Tecnológica

```
+-------------------------------------------------------------------------+
|                  INTERFAZ DE USUARIO (Mobile-First Web App)             |
|        HTML5 semántico + CSS moderno / Tailwind + Vanilla JS reactivo   |
|   (Accesible desde navegador en PC y como PWA/Web App instalada en móvil)|
+-------------------------------------------------------------------------+
                                    │
                                    │ llamadas asíncronas
                                    │ (google.script.run / REST API)
                                    ▼
+-------------------------------------------------------------------------+
|                      BACKEND & MOTOR DE LÓGICA                          |
|                     Google Apps Script (GAS)                           |
|   • Controlador Web App (doGet / doPost)                                |
|   • Módulo de Servicios: Nutrición, Rutina, Biometría, Motor Progresión |
|   • Caché temporal (CacheService) y validación de tipos                 |
+-------------------------------------------------------------------------+
                                    │
                                    │ lectura / escritura por lotes
                                    ▼
+-------------------------------------------------------------------------+
|                    BASE DE DATOS (Google Sheets)                        |
|                                                                         |
|  [CONFIG]             [REGISTRO_DIARIO]    [ALIMENTOS]                  |
|  [COMIDAS]            [EJERCICIOS]         [RUTINAS_BASE]               |
|  [ENTRENAMIENTOS]     [MEDIDAS]            [PROGRESO_SEMANAL]           |
+-------------------------------------------------------------------------+
```

### Ventajas de este Stack:
1. **Cero costo de infraestructura:** 100% alojado en Google Workspace.
2. **Propiedad total de la información:** Todos los registros permanecen en tu Google Drive.
3. **Respaldo y edición híbrida:** Puedes ingresar datos rápidamente desde la interfaz web o editar masivamente directo en la hoja de cálculo.
4. **Cero fricción de despliegue:** Compatible con cualquier teléfono o computador sin pasar por app stores.

---

## 3. Modelo de Datos y Estructura de Hojas (Google Sheets)

Para evitar inconsistencias en el código, cada hoja tiene un nombre estandarizado en mayúsculas y sus columnas respetan nombres en formato `snake_case`.

---

### Hoja 1: `CONFIG`
Configuraciones globales, metas actuales y parámetros del motor de cálculo. Formato Clave-Valor.

| Columna | Tipo | Descripción / Ejemplo |
| :--- | :--- | :--- |
| `clave` (PK) | String | Identificador único (`peso_inicio`, `peso_meta`, `calorias_meta`, `proteina_meta`, `carbs_meta`, `grasas_meta`, `agua_meta`, `pasos_meta`, `fecha_inicio`, `semana_actual`) |
| `valor` | String/Number | Valor asignado (ej: `101.0`, `80.0`, `2200`, `170`, `200`, `65`, `3.0`, `10000`) |
| `descripcion` | String | Explicación para referencia humana |
| `actualizado_en` | Timestamp | Fecha y hora del último ajuste |

---

### Hoja 2: `REGISTRO_DIARIO`
Seguimiento diario holístico (peso, descanso, salud y hábitos). 1 fila por día.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_registro` (PK) | String | Formato `RD-YYYYMMDD` (ej. `RD-20261005`) |
| `fecha` | Date | `YYYY-MM-DD` |
| `peso_kg` | Number | Peso en ayunas (ej: `100.8`) |
| `horas_sueno` | Number | Horas dormidas (ej: `7.5`) |
| `calidad_sueno` | Integer | Escala 1 al 5 (1 = pésimo, 5 = excelente) |
| `presion_sistolica` | Integer | Presión arterial alta (ej: `120`) |
| `presion_diastolica`| Integer | Presión arterial baja (ej: `80`) |
| `pasos` | Integer | Pasos totales registrados por celular/reloj (ej: `10240`) |
| `agua_litros` | Number | Agua total consumida (ej: `3.2`) |
| `energia_nivel` | Integer | Escala 1 al 5 de vitalidad percibida |
| `estres_nivel` | Integer | Escala 1 al 5 de nivel de estrés |
| `adherencia_dieta` | String | `100%`, `80%`, `Incumplida` |
| `notas` | String | Observaciones del día (dolores articulares, eventos sociales, etc.) |
| `creado_en` | Timestamp | Marca temporal de guardado |

---

### Hoja 3: `ALIMENTOS`
Biblioteca maestro de alimentos frecuentes para registro ultra rápido en 1 toque.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_alimento` (PK) | String | Formato `ALI-001`, `ALI-002`... |
| `nombre` | String | Ej: `Pechuga de pollo a la plancha`, `Huevo entero`, `Avena`, `Arroz blanco` |
| `categoria` | String | `Proteína`, `Carbohidrato`, `Grasa`, `Fruta/Verdura`, `Lácteo`, `Suplemento`, `Mixto` |
| `porcion_base` | Number | Cantidad de referencia (ej: `100`) |
| `unidad_medida` | String | `g`, `ml`, `unidad`, `scoop` |
| `calorias` | Number | Calorías por porción base (ej: `165`) |
| `proteina_g` | Number | Proteínas en gramos (ej: `31.0`) |
| `carbos_g` | Number | Carbohidratos en gramos (ej: `0.0`) |
| `grasas_g` | Number | Grasas en gramos (ej: `3.6`) |
| `favorito` | Boolean | `TRUE` si aparece en el acceso rápido de la app |
| `activo` | Boolean | `TRUE` para habilitar en listas |

---

### Hoja 4: `COMIDAS`
Desglose granular de alimentos consumidos en cada comida del día.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_comida_item` (PK)| String | Formato `COM-YYYYMMDD-XXXX` |
| `fecha` | Date | `YYYY-MM-DD` |
| `tipo_comida` | String | `Desayuno`, `Almuerzo`, `Once/Merienda`, `Cena`, `Snack/Pre-Post` |
| `id_alimento` (FK) | String | Referencia a `ALIMENTOS.id_alimento` |
| `nombre_alimento` | String | Nombre al momento del consumo |
| `cantidad` | Number | Cantidad consumida (ej: `200`) |
| `unidad` | String | `g`, `ml`, `unidad` |
| `calorias_calc` | Number | `(cantidad / porcion_base) * calorias` |
| `proteina_calc_g` | Number | `(cantidad / porcion_base) * proteina_g` |
| `carbos_calc_g` | Number | `(cantidad / porcion_base) * carbos_g` |
| `grasas_calc_g` | Number | `(cantidad / porcion_base) * grasas_g` |
| `hora_registro` | String | `HH:mm` |

---

### Hoja 5: `EJERCICIOS`
Catálogo maestro de movimientos de fuerza y cardio.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_ejercicio` (PK) | String | Formato `EJ-001`, `EJ-002`... |
| `nombre` | String | Ej: `Press Banca con Mancuernas`, `Sentadilla Hack`, `Jalón al Pecho` |
| `grupo_muscular` | String | `Pecho`, `Espalda`, `Cuádriceps`, `Isquios/Glúteo`, `Hombro`, `Bíceps`, `Tríceps`, `Core`, `Cardio` |
| `tipo_carga` | String | `Mancuerna (cada una)`, `Barra total`, `Polea/Placas`, `Máquina guiada`, `Peso corporal` |
| `video_url` | String | Link corto o gif de recordatorio técnico |
| `notas_tecnica` | String | Cue mental: "codos a 45°, pausa en el pecho de 1 seg" |
| `activo` | Boolean | `TRUE` / `FALSE` |

---

### Hoja 6: `RUTINAS_BASE`
Plantilla semanal configurada para JP (Lunes a Sábado).

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_rutina_item` (PK)| String | `RUT-001` |
| `dia_semana` | String | `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes`, `Sábado`, `Domingo` |
| `nombre_sesion` | String | Ej: `Torso Fuerza (Pecho/Espalda)`, `Pierna Enfoque Cuádriceps`, `Full Body`, etc. |
| `orden_ejercicio` | Integer | `1`, `2`, `3`, `4`... |
| `id_ejercicio` (FK) | String | Referencia a `EJERCICIOS.id_ejercicio` |
| `series_objetivo` | Integer | Ej: `3` o `4` |
| `reps_min` | Integer | Rango inferior (ej: `8`) |
| `reps_max` | Integer | Rango superior (ej: `12`) |
| `rir_objetivo` | Integer | Reps en recámara deseadas (ej: `1` a `2`) |
| `descanso_seg` | Integer | Segundos recomendados (ej: `120`) |

---

### Hoja 7: `ENTRENAMIENTOS`
Registro serie a serie de cada sesión ejecutada. Base de la sobrecarga progresiva.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_serie` (PK) | String | Formato `ENT-YYYYMMDD-XXXX` |
| `fecha` | Date | `YYYY-MM-DD` |
| `dia_sesion` | String | Ej: `Lunes - Torso` |
| `id_ejercicio` (FK) | String | Referencia a `EJERCICIOS.id_ejercicio` |
| `numero_serie` | Integer | `1`, `2`, `3`, `4` |
| `peso_kg` | Number | Carga levantada (ej: `28.0`) |
| `repeticiones` | Integer | Repeticiones completadas limpias (ej: `10`) |
| `rir` | Integer | Reps in Reserve estimadas (0 = fallo, 1 = faltó 1, 2 = faltaron 2) |
| `volumen_kg` | Number | `peso_kg * repeticiones` (tonelaje de la serie) |
| `es_record_personal`| Boolean | `TRUE` si superó repeticiones o peso previo para esa serie |
| `notas_serie` | String | Ej: "Buena técnica, la última rep costó pero sin perder postura" |
| `creado_en` | Timestamp | Registro temporal exacto |

---

### Hoja 8: `MEDIDAS`
Antropometría periódica (cada 2 o 4 semanas) para verificar recomposición (pérdida de grasa vs masa muscular).

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_medida` (PK) | String | Formato `MED-YYYYMMDD` |
| `fecha` | Date | `YYYY-MM-DD` |
| `peso_referencia` | Number | Peso de la mañana de medición |
| `cintura_ombligo_cm`| Number | Marcador fundamental de grasa visceral |
| `pecho_cm` | Number | Circunferencia pectoral |
| `brazo_izq_cm` | Number | Brazo relajado/contraído |
| `brazo_der_cm` | Number | Brazo derecho |
| `muslo_izq_cm` | Number | Muslo medio |
| `muslo_der_cm` | Number | Muslo medio |
| `cadera_cm` | Number | Perímetro glúteo |
| `foto_frente_url` | String | Link a carpeta privada en Google Drive (opcional) |
| `foto_perfil_url` | String | Link a Drive (opcional) |
| `foto_espalda_url`| String | Link a Drive (opcional) |
| `comentarios` | String | "Se nota mayor definición en hombros y menor inflamación" |

---

### Hoja 9: `PROGRESO_SEMANAL`
Consolidados semanales para toma de decisiones y reportes de evolución.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `semana_id` (PK) | String | Formato `2026-W41` |
| `fecha_inicio` | Date | Lunes de esa semana |
| `fecha_fin` | Date | Domingo de esa semana |
| `peso_promedio` | Number | Media de pesajes válidos de la semana (filtra oscilaciones) |
| `delta_peso_semanal`| Number | `peso_promedio_actual - peso_promedio_anterior` |
| `calorias_promedio` | Number | Ingesta media diaria real |
| `proteina_promedio` | Number | Ingesta media diaria de proteína |
| `adherencia_dieta_pct`| Number | % días que cumplió meta calórica (+/- 100 kcal) |
| `sesiones_entreno` | Integer | Número de sesiones completadas vs programadas (ej: `5/5`) |
| `volumen_total_kg` | Number | Suma total de tonelaje levantado en la semana |
| `pasos_promedio` | Integer | Media diaria de pasos |
| `horas_sueno_prom` | Number | Media de descanso |
| `estado_ritmo` | String | `Óptimo (-0.5 a -0.9 kg)`, `Lento (< -0.3 kg)`, `Excesivo (> -1.2 kg)`, `Estancado (>= 0 kg)` |
| `recomendacion_ia` | String | Consejo generado por el motor de reglas |
| `ajuste_kcal_sugerido`| Integer | `0`, `-150`, `+100`, etc. |

---

## 4. Estructura de Pantallas y Experiencia de Usuario (Web App)

La aplicación web contará con una barra inferior de navegación fija con 5 módulos clave:

```
[  🏠 Inicio  ] [  🥗 Nutrición  ] [  🏋️‍♂️ Entreno  ] [  📈 Progreso  ] [  ⚙️ Perfil  ]
```

### Pantalla 1: 🏠 Inicio (Dashboard Ejecutivo JP)
- **Tarjeta de Meta Principal:**
  - Barra de progreso visual interactiva: `101.0 kg` (Inicio) ────●────── `80.0 kg` (Meta).
  - Kilos restantes: `21.0 kg`.
  - Peso de hoy vs promedio móvil de 7 días.
- **Acceso Rápido "Check-in Diario" (Modal de 30 segundos):**
  - Input numérico grande: Peso de hoy (kg).
  - Inputs rápidos de salud: Horas de sueño, Presión arterial (Sist/Diast), Agua (L).
  - Sliders de 1 a 5: Energía y Estrés.
  - Botón: **"Guardar Check-in de Hoy"**.
- **Resumen Nutricional del Día:**
  - Anillos circulares de progreso: Calorías (`Actual / 2.200 kcal`), Proteína (`Actual / 170 g`), Carbos y Grasas.
- **Entrenamiento de Hoy:**
  - Tarjeta con la sesión correspondiente según el día de la semana (ej: si es Lunes: "Torso Fuerza").
  - Botón directo: **"Iniciar Sesión de Entrenamiento"**.

---

### Pantalla 2: 🥗 Nutrición
- **Selector de Comida:** Desayuno | Almuerzo | Once | Cena | Snacks.
- **Buscador predictivo y Favoritos de Alimentos:**
  - Al escribir "huevo" o "pollo", autocompleta con datos de la hoja `ALIMENTOS`.
  - Botones de 1 toque de alimentos frecuentes (ej: "1 Scoop Whey", "150g Pollo", "2 Huevos").
- **Visualizador de Totales en Tiempo Real:**
  - Barra superior persistente con el desglose de macros del día.
- **Historial del Día:**
  - Lista de alimentos cargados con opción de editar o borrar en caso de error.

---

### Pantalla 3: 🏋️‍♂️ Entrenamiento (Sobrecarga Progresiva)
- **Encabezado Inteligente:**
  - Muestra la rutina base programada para el día.
- **Tarjeta por Ejercicio:**
  - Nombre del ejercicio + grupo muscular.
  - **DATO CLAVE (Referencia Histórica):** Muestra de forma destacada qué hiciste la última vez:
    *Ejemplo:* `Semana anterior: 50 kg × 10, 9, 8 reps (RIR 1)`.
  - **Fila de Serie Activa:**
    - Carga (kg) [ - ] [ 50 ] [ + ]
    - Repeticiones [ - ] [ 12 ] [ + ]
    - RIR selector rápido (0, 1, 2, 3)
    - Botón **"Completar Serie"** (marca check verde y arranca un temporizador flotante de descanso).
- **Indicador de Sobrecarga en Vivo:**
  - Si igualaste o superaste el volumen o las repeticiones de la sesión pasada, aparece una insignia verde: **🔥 ¡Sobrecarga superada!**

---

### Pantalla 4: 📈 Progreso & Biometría
- **Pestaña 1: Tendencia de Peso & Gráfica Semanal:**
  - Gráfico de línea con peso diario vs media semanal para evitar pánico por retención de líquidos.
- **Pestaña 2: Fuerza y Sobrecarga por Ejercicio:**
  - Selector desplegable para ver la evolución de cualquier ejercicio clave (ej. Press Pecho, Jalón, Sentadilla) a lo largo de las semanas.
- **Pestaña 3: Medidas Corporales:**
  - Registro quincenal de contornos (cintura, pecho, brazo, muslo).
  - Indicador de reducción de cintura (clave en pérdida de grasa visceral).

---

### Pantalla 5: ⚙️ Perfil, Ajustes & Motor de Decisiones
- **Configuraciones de Metas:**
  - Ajuste de calorías base, proteína, agua y pasos diarios.
- **Panel de Recomendación Semanal (Motor de Reglas):**
  - Muestra el diagnóstico de los últimos 7 y 14 días.
  - Explica la recomendación matemática (mantener, recortar 150 kcal o hacer descarga de entrenamiento).
- **Sincronización:**
  - Estado de conexión con Google Sheets y botón para refrescar datos de la caché.

---

## 5. Algoritmo del Motor de Decisiones (Lógica de Recomposición)

El valor diferencial de **JP Fitness Control** es su capacidad para procesar la información y sugerir ajustes como un preparador metodológico.

### A. Reglas de Ajuste Calórico (Evaluación cada 14 días)
Se utiliza la media móvil semanal para filtrar variaciones agudas de agua, sal o glucógeno:

$$\Delta Peso = \text{Promedio Semana Actual} - \text{Promedio Semana Anterior}$$

1. **Ritmo Ideal ($-0.5\text{ a }-0.8\text{ kg/semana}$):**
   - Estado: ✅ **Ritmo de recomposición óptimo.**
   - Acción: **Mantener 2.200 kcal.** No acelerar el proceso innecesariamente para proteger masa muscular y energía de entreno.
2. **Ritmo Lento / Estancado ($-0.2\text{ a }+0.2\text{ kg}$ durante 2 semanas consecutivas):**
   - Condición de adherencia:
     - Si `Adherencia Nutrición` $\ge 85\%$: **Déficit ajustado.** Reducir $100 - 150\text{ kcal}$ o sumar $2.000$ pasos diarios.
     - Si `Adherencia Nutrición` $< 85\%$: **Problema de consistencia.** Mantener calorías y sugerir priorizar fines de semana.
3. **Pérdida Acelerada ($> -1.2\text{ kg/semana}$ durante 2 semanas seguidas):**
   - Estado: ⚠️ **Pérdida excesiva con riesgo de masa muscular y fatiga.**
   - Acción: **Subir $150 - 200\text{ kcal}$** (mayormente en carbohidratos alrededor del entrenamiento).

### B. Regla de Sobrecarga Progresiva (Doble Progresión)
Para cada ejercicio dentro de la rutina:
- **Rango objetivo:** Ej. 8 a 12 repeticiones con una carga fija (ej. 50 kg).
- **Paso 1:** Mantener el peso (50 kg) hasta que en todas las series programadas (ej. 3 series) se alcancen las 12 repeticiones limpias con $RIR \ge 1$ (`12 / 12 / 12`).
- **Paso 2:** Una vez completado el techo del rango, la app sugiere automáticamente:
  $$\text{Nueva Carga} = \text{Carga Anterior} + 2.5\text{ a }5.0\text{ kg}$$
  y se reinicia el ciclo buscando las 8 repeticiones en la base del rango.

---

## 6. Plan de Implementación por Fases

| Fase | Alcance y Entregables | Estado |
| :--- | :--- | :--- |
| **Fase 0 (Actual)** | **Documento Maestro de Arquitectura y Estructura de Tablas.** Definición unívoca de campos, contratos de datos y reglas de negocio. | 🎯 En curso |
| **Fase 1 (MVP)** | • Creación/formateo automático de las 9 hojas en Google Sheets con encabezados y datos de prueba.<br>• Script Apps Script base (`Code.gs` + backend de APIs).<br>• Interfaz Web App para Check-in diario de peso y registro de comidas/macros.<br>• Módulo de entrenamiento para registrar series y ver la carga de la semana previa. | Siguiente paso |
| **Fase 2 (Salud & Gráficos)** | • Gráficos dinámicos de tendencia de peso y adherencia.<br>• Módulo de presión arterial, calidad de sueño y agua.<br>• Módulo de medidas antropométricas corporales. | Posterior al MVP |
| **Fase 3 (Motor Inteligente)** | • Cálculo automatizado del progreso semanal en segundo plano.<br>• Generador de sugerencias y ajustes de calorías/pasos.<br>• Alertas de sobrecarga y recomendaciones de peso en cada ejercicio. | Evolución |
| **Fase 4 (PWA & Premium)** | • Soporte offline básico y PWA instalable en pantalla de inicio de iPhone/Android.<br>• Gamificación: rachas de entrenamiento, medallas de consistencia y reportes exportables en PDF. | Pulido |

---

## 7. Instrucciones para la Construcción

Con este documento maestro consolidado:
1. **Google Sheets:** Las hojas deben crearse exactamente con los nombres estipulados en la Sección 3 para evitar errores de referencia en el código.
2. **Apps Script:** Las funciones de lectura y escritura se mapearán de forma limpia contra estas hojas usando llamadas por lotes (`getValues` / `setValues`) para maximizar la velocidad.
3. **Frontend:** Los módulos de interfaz se desacoplan de forma que el MVP (Fase 1) sea 100% utilizable y funcional desde el primer día.
