/**
 * ============================================================================
 * JP FITNESS CONTROL - BACKEND GOOGLE APPS SCRIPT
 * Sistema de Recomposición Corporal & Sobrecarga Progresiva
 * Atleta: Juan Lizama (JP) | Cuenta: gmusicestudio@gmail.com
 * ============================================================================
 */

// Nombres de hojas estandarizados
const SHEETS = {
  CONFIG: 'CONFIG',
  REGISTRO_DIARIO: 'REGISTRO_DIARIO',
  ALIMENTOS: 'ALIMENTOS',
  COMIDAS: 'COMIDAS',
  EJERCICIOS: 'EJERCICIOS',
  RUTINAS_BASE: 'RUTINAS_BASE',
  ENTRENAMIENTOS: 'ENTRENAMIENTOS',
  MEDIDAS: 'MEDIDAS',
  PROGRESO_SEMANAL: 'PROGRESO_SEMANAL'
};

/**
 * Servir la aplicación Web
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('JP Fitness Control')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Función de inicialización automática de la Hoja de Cálculo
 * Crea las 9 hojas, encabezados formateados y datos semilla iniciales.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. CONFIG
  let sheetConfig = getOrCreateSheet(ss, SHEETS.CONFIG);
  if (sheetConfig.getLastRow() === 0) {
    const headers = ['clave', 'valor', 'descripcion', 'actualizado_en'];
    sheetConfig.appendRow(headers);
    formatHeaderRow(sheetConfig);
    
    const configData = [
      ['usuario_nombre', 'Juan Lizama (JP)', 'Nombre del atleta', new Date()],
      ['usuario_email', 'gmusicestudio@gmail.com', 'Correo principal', new Date()],
      ['usuario_edad', 42, 'Edad real confirmada', new Date()],
      ['estatura_cm', 168.5, 'Estatura (cm)', new Date()],
      ['peso_inicio', 102.0, 'Peso al iniciar el programa (kg)', new Date()],
      ['peso_meta', 80.0, 'Peso objetivo principal (kg)', new Date()],
      ['calorias_meta', 2150, 'Calorías diarias objetivo base (kcal)', new Date()],
      ['proteina_meta', 153, 'Proteína diaria objetivo (g)', new Date()],
      ['carbos_meta', 238, 'Carbohidratos diarios base (g)', new Date()],
      ['grasas_meta', 65, 'Grasas diarias base (g)', new Date()],
      ['agua_meta', 3.0, 'Consumo de agua diario objetivo (Litros)', new Date()],
      ['pasos_meta', 10000, 'Pasos diarios mínimos', new Date()],
      ['rir_objetivo_base', '2 a 3', 'Repeticiones en reserva para cuidar pulso', new Date()],
      ['fecha_inicio', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), 'Fecha de inicio del ciclo', new Date()],
      ['version_app', '1.1.0', 'Versión de JP Fitness Control', new Date()]
    ];
    sheetConfig.getRange(2, 1, configData.length, configData[0].length).setValues(configData);
    sheetConfig.autoResizeColumns(1, 4);
  }

  // 2. REGISTRO_DIARIO
  let sheetRD = getOrCreateSheet(ss, SHEETS.REGISTRO_DIARIO);
  if (sheetRD.getLastRow() === 0) {
    const headers = [
      'id_registro', 'fecha', 'peso_kg', 'horas_sueno', 'calidad_sueno',
      'presion_sistolica', 'presion_diastolica', 'pasos', 'agua_litros',
      'energia_nivel', 'estres_nivel', 'adherencia_dieta', 'notas', 'creado_en'
    ];
    sheetRD.appendRow(headers);
    formatHeaderRow(sheetRD);
    // Semilla inicial día 1
    const hoyStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheetRD.appendRow([
      'RD-' + hoyStr.replace(/-/g, ''), hoyStr, 102.0, 7.5, 4,
      120, 80, 10000, 3.0, 4, 2, '100%', 'Punto de partida oficial. Comenzamos el viaje a 80 kg.', new Date()
    ]);
    sheetRD.autoResizeColumns(1, headers.length);
  }

  // 3. ALIMENTOS
  let sheetAlim = getOrCreateSheet(ss, SHEETS.ALIMENTOS);
  if (sheetAlim.getLastRow() === 0) {
    const headers = [
      'id_alimento', 'nombre', 'categoria', 'porcion_base', 'unidad_medida',
      'calorias', 'proteina_g', 'carbos_g', 'grasas_g', 'favorito', 'activo'
    ];
    sheetAlim.appendRow(headers);
    formatHeaderRow(sheetAlim);
    
    const alimentosData = [
      ['ALI-001', 'Pechuga de pollo a la plancha', 'Proteína', 100, 'g', 165, 31.0, 0.0, 3.6, true, true],
      ['ALI-002', 'Huevo entero cocido/plancha', 'Proteína', 1, 'unidad', 75, 6.5, 0.5, 5.0, true, true],
      ['ALI-003', 'Clara de huevo', 'Proteína', 100, 'g', 52, 11.0, 0.7, 0.2, false, true],
      ['ALI-004', 'Proteína Whey (1 scoop)', 'Suplemento', 30, 'g', 120, 24.0, 2.0, 1.5, true, true],
      ['ALI-005', 'Atún al agua enlatado', 'Proteína', 100, 'g', 115, 26.0, 0.0, 1.0, true, true],
      ['ALI-006', 'Carne molida magra 4%', 'Proteína', 100, 'g', 145, 22.0, 0.0, 6.0, false, true],
      ['ALI-007', 'Arroz blanco cocido', 'Carbohidrato', 100, 'g', 130, 2.7, 28.0, 0.3, true, true],
      ['ALI-008', 'Avena tradicional', 'Carbohidrato', 50, 'g', 190, 7.0, 33.0, 3.5, true, true],
      ['ALI-009', 'Plátano / Banana', 'Fruta/Verdura', 1, 'unidad', 105, 1.3, 27.0, 0.3, true, true],
      ['ALI-010', 'Manzana mediana', 'Fruta/Verdura', 1, 'unidad', 80, 0.4, 21.0, 0.3, false, true],
      ['ALI-011', 'Palta / Aguacate', 'Grasa', 50, 'g', 80, 1.0, 4.0, 7.5, true, true],
      ['ALI-012', 'Aceite de oliva extra virgen', 'Grasa', 10, 'ml', 88, 0.0, 0.0, 10.0, true, true],
      ['ALI-013', 'Pan integral', 'Carbohidrato', 2, 'rebanadas', 140, 6.0, 24.0, 2.0, true, true],
      ['ALI-014', 'Yogurt griego natural sin azúcar', 'Lácteo', 150, 'g', 90, 15.0, 5.0, 1.0, true, true],
      ['ALI-015', 'Frutos secos mixtos (almendras/nueces)', 'Grasa', 30, 'g', 180, 5.0, 6.0, 15.0, false, true],
      ['ALI-016', 'Papas al horno / cocidas', 'Carbohidrato', 150, 'g', 130, 3.0, 30.0, 0.2, false, true]
    ];
    sheetAlim.getRange(2, 1, alimentosData.length, alimentosData[0].length).setValues(alimentosData);
    sheetAlim.autoResizeColumns(1, headers.length);
  }

  // 4. COMIDAS
  let sheetCom = getOrCreateSheet(ss, SHEETS.COMIDAS);
  if (sheetCom.getLastRow() === 0) {
    const headers = [
      'id_comida_item', 'fecha', 'tipo_comida', 'id_alimento', 'nombre_alimento',
      'cantidad', 'unidad', 'calorias_calc', 'proteina_calc_g', 'carbos_calc_g',
      'grasas_calc_g', 'hora_registro'
    ];
    sheetCom.appendRow(headers);
    formatHeaderRow(sheetCom);
    sheetCom.autoResizeColumns(1, headers.length);
  }

  // 5. EJERCICIOS
  let sheetEj = getOrCreateSheet(ss, SHEETS.EJERCICIOS);
  if (sheetEj.getLastRow() === 0) {
    const headers = [
      'id_ejercicio', 'nombre', 'grupo_muscular', 'tipo_carga',
      'video_url', 'notas_tecnica', 'activo'
    ];
    sheetEj.appendRow(headers);
    formatHeaderRow(sheetEj);

    const ejerciciosData = [
      ['EJ-001', 'Press Plano con Mancuernas', 'Pecho', 'Mancuerna (cada una)', '', 'Escápulas retraídas, codos a 45-60 grados, pausa abajo', true],
      ['EJ-002', 'Press Inclinado con Mancuernas', 'Pecho', 'Mancuerna (cada una)', '', 'Inclinación de 30°, foco en haz clavicular', true],
      ['EJ-003', 'Aperturas / Cruces en Polea', 'Pecho', 'Polea/Placas', '', 'Contracción isométrica 1 seg al centro', true],
      ['EJ-004', 'Jalón al Pecho en Polea', 'Espalda', 'Polea/Placas', '', 'Pecho erguido, tirar con los codos hacia la cadera', true],
      ['EJ-005', 'Remo con Mancuerna a 1 Brazo', 'Espalda', 'Mancuerna (cada una)', '', 'Espalda neutra, llevar codo al bolsillo', true],
      ['EJ-006', 'Remo en Polea Baja sentado', 'Espalda', 'Polea/Placas', '', 'Extensión completa sin redondear lumbares', true],
      ['EJ-007', 'Sentadilla Copa / Goblet Squat', 'Cuádriceps', 'Mancuerna (cada una)', '', 'Pies al ancho de hombros, bajar profundo controlado', true],
      ['EJ-008', 'Prensa de Piernas Inclinada', 'Cuádriceps', 'Máquina guiada', '', 'Pies neutros, no despegar glúteo del respaldo', true],
      ['EJ-009', 'Curl Femoral Tumbado/Sentado', 'Isquios/Glúteo', 'Máquina guiada', '', 'Control excéntrico en 3 segundos', true],
      ['EJ-010', 'Elevaciones Laterales Mancuernas', 'Hombro', 'Mancuerna (cada una)', '', 'Leve inclinación adelante, subir en plano escapular', true],
      ['EJ-011', 'Press Militar con Mancuernas', 'Hombro', 'Mancuerna (cada una)', '', 'No hiperextender espalda baja, rango completo', true],
      ['EJ-012', 'Curl de Bíceps con Mancuernas', 'Bíceps', 'Mancuerna (cada una)', '', 'Supinación al final del recorrido', true],
      ['EJ-013', 'Extensión de Tríceps en Polea (Cuerda)', 'Tríceps', 'Polea/Placas', '', 'Codos pegados al torso, abrir cuerda al final', true],
      ['EJ-014', 'Fondos en Paralelas / Máquina Asistida', 'Pecho/Tríceps', 'Peso corporal', '', 'Inclinación al frente para pecho', true],
      ['EJ-015', 'Plancha Abdominal / Core', 'Core', 'Peso corporal', '', 'Glúteos y abdomen apretados, respiración controlada', true],
      ['EJ-016', 'Caminata Activa (Pasos/Cardio)', 'Cardio', 'Peso corporal', '', 'Ritmo constante 100-120 pasos/min', true],
      ['EJ-017', 'Crunch en Polea (Abdomen)', 'Core', 'Polea/Placas', '', 'Redondea el tronco, exhala al contraer', true],
      ['EJ-018', 'Elevación de Piernas Colgado/Banco', 'Core', 'Peso corporal', '', 'Sin balanceo, controla la bajada', true],
      ['EJ-019', 'Curl Martillo', 'Bíceps', 'Mancuerna (cada una)', '', 'Codos pegados al torso', true],
      ['EJ-020', 'Face Pull / Pájaros (Deltoide Posterior)', 'Hombro', 'Polea/Placas', '', 'Codos altos, aprieta escápulas', true],
      ['EJ-021', 'Peso Muerto Rumano con Mancuernas', 'Isquios/Glúteo', 'Mancuerna (cada una)', '', 'Espalda neutra, cadera atrás', true],
      ['EJ-022', 'Elevación de Talones en Prensa', 'Pantorrillas', 'Prensa 45°', '', 'Pausa arriba 1 seg', true],
      ['EJ-023', 'Press de Hombro en Máquina', 'Hombro', 'Máquina guiada', '', 'Sin arquear la espalda baja', true],
      ['EJ-024', 'Press Francés / Tríceps sobre la Cabeza', 'Tríceps', 'Mancuerna (cada una)', '', 'Codos fijos, baja controlado', true]
    ];
    sheetEj.getRange(2, 1, ejerciciosData.length, ejerciciosData[0].length).setValues(ejerciciosData);
    sheetEj.autoResizeColumns(1, headers.length);
  }

  // 6. RUTINAS_BASE
  let sheetRut = getOrCreateSheet(ss, SHEETS.RUTINAS_BASE);
  if (sheetRut.getLastRow() === 0) {
    const headers = [
      'id_rutina_item', 'dia_semana', 'nombre_sesion', 'orden_ejercicio',
      'id_ejercicio', 'series_objetivo', 'reps_min', 'reps_max', 'rir_objetivo', 'descanso_seg'
    ];
    sheetRut.appendRow(headers);
    formatHeaderRow(sheetRut);

    const rutinasData = [
      // Lunes: Pecho y Tríceps + Abdomen
      ['RUT-001', 'Lunes', 'Pecho y Tríceps + Abdomen', 1, 'EJ-001', 4, 8, 10, 2, 120],
      ['RUT-002', 'Lunes', 'Pecho y Tríceps + Abdomen', 2, 'EJ-002', 3, 10, 12, 2, 120],
      ['RUT-003', 'Lunes', 'Pecho y Tríceps + Abdomen', 3, 'EJ-003', 3, 12, 15, 2, 90],
      ['RUT-004', 'Lunes', 'Pecho y Tríceps + Abdomen', 4, 'EJ-013', 3, 12, 15, 2, 90],
      ['RUT-005', 'Lunes', 'Pecho y Tríceps + Abdomen', 5, 'EJ-024', 3, 10, 12, 2, 90],
      ['RUT-006', 'Lunes', 'Pecho y Tríceps + Abdomen', 6, 'EJ-017', 3, 12, 15, 2, 90],
      ['RUT-007', 'Lunes', 'Pecho y Tríceps + Abdomen', 7, 'EJ-018', 3, 10, 15, 2, 90],
      ['RUT-008', 'Lunes', 'Pecho y Tríceps + Abdomen', 8, 'EJ-015', 3, 30, 45, 2, 90],
      // Martes: Espalda y Bíceps
      ['RUT-009', 'Martes', 'Espalda y Bíceps', 1, 'EJ-004', 4, 8, 12, 2, 120],
      ['RUT-010', 'Martes', 'Espalda y Bíceps', 2, 'EJ-006', 3, 10, 12, 2, 120],
      ['RUT-011', 'Martes', 'Espalda y Bíceps', 3, 'EJ-005', 3, 10, 12, 2, 120],
      ['RUT-012', 'Martes', 'Espalda y Bíceps', 4, 'EJ-020', 3, 12, 15, 2, 90],
      ['RUT-013', 'Martes', 'Espalda y Bíceps', 5, 'EJ-012', 3, 10, 12, 2, 90],
      ['RUT-014', 'Martes', 'Espalda y Bíceps', 6, 'EJ-019', 3, 12, 12, 2, 90],
      // Miércoles: Piernas + Abdomen
      ['RUT-015', 'Miércoles', 'Piernas + Abdomen', 1, 'EJ-007', 4, 8, 12, 2, 120],
      ['RUT-016', 'Miércoles', 'Piernas + Abdomen', 2, 'EJ-008', 3, 10, 12, 2, 120],
      ['RUT-017', 'Miércoles', 'Piernas + Abdomen', 3, 'EJ-021', 3, 10, 12, 2, 120],
      ['RUT-018', 'Miércoles', 'Piernas + Abdomen', 4, 'EJ-009', 3, 12, 15, 2, 90],
      ['RUT-019', 'Miércoles', 'Piernas + Abdomen', 5, 'EJ-022', 3, 15, 15, 2, 90],
      ['RUT-020', 'Miércoles', 'Piernas + Abdomen', 6, 'EJ-017', 3, 12, 15, 2, 90],
      ['RUT-021', 'Miércoles', 'Piernas + Abdomen', 7, 'EJ-018', 3, 10, 15, 2, 90],
      ['RUT-022', 'Miércoles', 'Piernas + Abdomen', 8, 'EJ-015', 3, 30, 45, 2, 90],
      // Jueves: Pecho y Hombros + Abdomen
      ['RUT-023', 'Jueves', 'Pecho y Hombros + Abdomen', 1, 'EJ-002', 4, 8, 10, 2, 120],
      ['RUT-024', 'Jueves', 'Pecho y Hombros + Abdomen', 2, 'EJ-011', 3, 8, 12, 2, 120],
      ['RUT-025', 'Jueves', 'Pecho y Hombros + Abdomen', 3, 'EJ-010', 4, 12, 15, 2, 90],
      ['RUT-026', 'Jueves', 'Pecho y Hombros + Abdomen', 4, 'EJ-003', 3, 12, 15, 2, 90],
      ['RUT-027', 'Jueves', 'Pecho y Hombros + Abdomen', 5, 'EJ-020', 3, 12, 15, 2, 90],
      ['RUT-028', 'Jueves', 'Pecho y Hombros + Abdomen', 6, 'EJ-017', 3, 12, 15, 2, 90],
      ['RUT-029', 'Jueves', 'Pecho y Hombros + Abdomen', 7, 'EJ-018', 3, 10, 15, 2, 90],
      ['RUT-030', 'Jueves', 'Pecho y Hombros + Abdomen', 8, 'EJ-015', 3, 30, 45, 2, 90],
      // Viernes: Full Body
      ['RUT-031', 'Viernes', 'Full Body', 1, 'EJ-008', 3, 10, 12, 2, 120],
      ['RUT-032', 'Viernes', 'Full Body', 2, 'EJ-001', 3, 10, 12, 2, 120],
      ['RUT-033', 'Viernes', 'Full Body', 3, 'EJ-004', 3, 10, 12, 2, 120],
      ['RUT-034', 'Viernes', 'Full Body', 4, 'EJ-023', 2, 12, 12, 2, 90],
      ['RUT-035', 'Viernes', 'Full Body', 5, 'EJ-012', 2, 12, 12, 2, 90],
      ['RUT-036', 'Viernes', 'Full Body', 6, 'EJ-013', 2, 12, 12, 2, 90],
      // Sábado: Caminata
      ['RUT-037', 'Sábado', 'Caminata cerro San Cristóbal (60-90 min)', 1, 'EJ-016', 1, 10000, 12000, 3, 0],
      // Domingo: Descanso
      ['RUT-038', 'Domingo', 'Descanso Total y Recuperación', 1, 'EJ-016', 1, 5000, 8000, 3, 0]
    ];
    sheetRut.getRange(2, 1, rutinasData.length, rutinasData[0].length).setValues(rutinasData);
    sheetRut.autoResizeColumns(1, headers.length);
  }

  // 7. ENTRENAMIENTOS
  let sheetEnt = getOrCreateSheet(ss, SHEETS.ENTRENAMIENTOS);
  if (sheetEnt.getLastRow() === 0) {
    const headers = [
      'id_serie', 'fecha', 'dia_sesion', 'id_ejercicio', 'numero_serie',
      'peso_kg', 'repeticiones', 'rir', 'volumen_kg', 'es_record_personal',
      'notas_serie', 'creado_en'
    ];
    sheetEnt.appendRow(headers);
    formatHeaderRow(sheetEnt);
    sheetEnt.autoResizeColumns(1, headers.length);
  }

  // 8. MEDIDAS
  let sheetMed = getOrCreateSheet(ss, SHEETS.MEDIDAS);
  if (sheetMed.getLastRow() === 0) {
    const headers = [
      'id_medida', 'fecha', 'peso_referencia', 'cintura_ombligo_cm',
      'pecho_cm', 'brazo_izq_cm', 'brazo_der_cm', 'muslo_izq_cm',
      'muslo_der_cm', 'cadera_cm', 'foto_frente_url', 'foto_perfil_url',
      'foto_espalda_url', 'comentarios'
    ];
    sheetMed.appendRow(headers);
    formatHeaderRow(sheetMed);
    const hoyStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheetMed.appendRow([
      'MED-' + hoyStr.replace(/-/g, ''), hoyStr, 102.0, '', '', '', '', '', '', '', '', '', '', 'Medición inicial de punto de partida.'
    ]);
    sheetMed.autoResizeColumns(1, headers.length);
  }

  // 9. PROGRESO_SEMANAL
  let sheetProg = getOrCreateSheet(ss, SHEETS.PROGRESO_SEMANAL);
  if (sheetProg.getLastRow() === 0) {
    const headers = [
      'semana_id', 'fecha_inicio', 'fecha_fin', 'peso_promedio', 'delta_peso_semanal',
      'calorias_promedio', 'proteina_promedio', 'adherencia_dieta_pct',
      'sesiones_entreno', 'volumen_total_kg', 'pasos_promedio', 'horas_sueno_prom',
      'estado_ritmo', 'recomendacion_ia', 'ajuste_kcal_sugerido'
    ];
    sheetProg.appendRow(headers);
    formatHeaderRow(sheetProg);
    sheetProg.autoResizeColumns(1, headers.length);
  }

  return { success: true, message: 'Todas las 9 hojas se inicializaron correctamente con datos para JP.' };
}

// ============================================================================
// MÉTODOS DE LA API (Consumidos por el frontend Web App)
// ============================================================================

/**
 * Obtiene toda la información necesaria para el Dashboard de inicio
 */
function apiGetDashboardData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = getConfigsAsMap(ss);
  
  const tz = Session.getScriptTimeZone();
  const hoyStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const diaSemanaNombre = getDiaSemanaNombre(new Date());

  // 1. Registro de hoy
  const registroHoy = getRegistroDiarioByFecha(ss, hoyStr);

  // 2. Comidas de hoy y cálculo de macros
  const comidasHoy = getComidasByFecha(ss, hoyStr);
  let totalesHoy = { calorias: 0, proteina: 0, carbos: 0, grasas: 0 };
  comidasHoy.forEach(item => {
    totalesHoy.calorias += Number(item.calorias_calc || 0);
    totalesHoy.proteina += Number(item.proteina_calc_g || 0);
    totalesHoy.carbos += Number(item.carbos_calc_g || 0);
    totalesHoy.grasas += Number(item.grasas_calc_g || 0);
  });

  // 3. Rutina para el día de hoy
  const rutinaHoy = getRutinaPorDia(ss, diaSemanaNombre);

  // 4. Últimos 28 registros diarios para gráficas y promedios
  const historialPesos = getHistorialPesos(ss, 28);

  // 5. Peso actual (último disponible o baseline)
  let pesoActual = Number(config.peso_inicio || 102.0);
  if (registroHoy && registroHoy.peso_kg) {
    pesoActual = Number(registroHoy.peso_kg);
  } else if (historialPesos.length > 0) {
    pesoActual = Number(historialPesos[historialPesos.length - 1].peso_kg);
  }

  // 6. Diagnóstico y sugerencia algorítmica
  const diagnostico = calcularDiagnosticoRecomposicion(ss, historialPesos, config);

  return {
    success: true,
    data: {
      config: config,
      hoyStr: hoyStr,
      diaSemanaNombre: diaSemanaNombre,
      pesoActual: pesoActual,
      pesoMeta: Number(config.peso_meta || 80.0),
      registroHoy: registroHoy,
      totalesHoy: {
        calorias: Math.round(totalesHoy.calorias),
        proteina: Math.round(totalesHoy.proteina * 10) / 10,
        carbos: Math.round(totalesHoy.carbos * 10) / 10,
        grasas: Math.round(totalesHoy.grasas * 10) / 10
      },
      rutinaHoy: rutinaHoy,
      historialPesos: historialPesos,
      diagnostico: diagnostico
    }
  };
}

/**
 * Guarda o actualiza el registro diario (check-in de hoy)
 */
function apiSaveRegistroDiario_(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.REGISTRO_DIARIO);
    const tz = Session.getScriptTimeZone();
    const fecha = payload.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    const id = 'RD-' + fecha.replace(/-/g, '');

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      let f = data[i][1];
      let fStr = (f instanceof Date) ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f).substring(0, 10);
      if (fStr === fecha) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowValues = [
      id,
      fecha,
      payload.peso_kg ? Number(payload.peso_kg) : '',
      payload.horas_sueno ? Number(payload.horas_sueno) : '',
      payload.calidad_sueno ? Number(payload.calidad_sueno) : '',
      payload.presion_sistolica ? Number(payload.presion_sistolica) : '',
      payload.presion_diastolica ? Number(payload.presion_diastolica) : '',
      payload.pasos ? Number(payload.pasos) : '',
      payload.agua_litros ? Number(payload.agua_litros) : '',
      payload.energia_nivel ? Number(payload.energia_nivel) : '',
      payload.estres_nivel ? Number(payload.estres_nivel) : '',
      payload.adherencia_dieta || '100%',
      payload.notas || '',
      new Date()
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return { success: true, message: 'Check-in diario guardado con éxito.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Añade (una sola vez, por id) más alimentos a la hoja ALIMENTOS: ensaladas, frutas,
 * legumbres, lácteos, pan chileno, etc. Valores aproximados por porción base.
 * Si ya editaste o borraste uno, no se vuelve a crear con el mismo id.
 */
function ensureAlimentosV2_(sheet) {
  const NUEVOS = [
    ['ALI-017', 'Lechuga (ensalada)', 'Verdura/Ensalada', 100, 'g', 15, 1.4, 2.9, 0.2, true, true],
    ['ALI-018', 'Tomate', 'Verdura/Ensalada', 100, 'g', 18, 0.9, 3.9, 0.2, true, true],
    ['ALI-019', 'Pepino', 'Verdura/Ensalada', 100, 'g', 15, 0.7, 3.6, 0.1, true, true],
    ['ALI-020', 'Apio', 'Verdura/Ensalada', 100, 'g', 16, 0.7, 3.0, 0.2, true, true],
    ['ALI-021', 'Ensalada mixta (lechuga, tomate, pepino, apio) - 1 plato grande', 'Verdura/Ensalada', 200, 'g', 35, 2.2, 7.0, 0.4, true, true],
    ['ALI-022', 'Zanahoria cruda', 'Verdura/Ensalada', 100, 'g', 41, 0.9, 9.6, 0.2, false, true],
    ['ALI-023', 'Repollo', 'Verdura/Ensalada', 100, 'g', 25, 1.3, 5.8, 0.1, false, true],
    ['ALI-024', 'Cebolla', 'Verdura/Ensalada', 100, 'g', 40, 1.1, 9.3, 0.1, false, true],
    ['ALI-025', 'Brócoli cocido', 'Verdura/Ensalada', 100, 'g', 35, 2.4, 7.2, 0.4, false, true],
    ['ALI-026', 'Zapallo italiano cocido', 'Verdura/Ensalada', 100, 'g', 17, 1.2, 3.1, 0.3, false, true],
    ['ALI-027', 'Choclo cocido', 'Verdura/Ensalada', 100, 'g', 96, 3.4, 21.0, 1.5, false, true],
    ['ALI-028', 'Limón (jugo de 1 unidad)', 'Verdura/Ensalada', 1, 'unidad', 10, 0.2, 3.2, 0.1, false, true],
    ['ALI-029', 'Sopa casera de verduras (1 plato, aprox.)', 'Verdura/Ensalada', 300, 'ml', 90, 4.0, 14.0, 2.0, true, true],
    ['ALI-030', 'Manzana verde mediana', 'Fruta', 1, 'unidad', 78, 0.4, 21.0, 0.2, true, true],
    ['ALI-031', 'Naranja', 'Fruta', 1, 'unidad', 62, 1.2, 15.4, 0.2, false, true],
    ['ALI-032', 'Pera', 'Fruta', 1, 'unidad', 100, 0.6, 27.0, 0.2, false, true],
    ['ALI-033', 'Durazno', 'Fruta', 1, 'unidad', 60, 1.4, 14.5, 0.4, false, true],
    ['ALI-034', 'Kiwi', 'Fruta', 1, 'unidad', 42, 0.8, 10.0, 0.4, false, true],
    ['ALI-035', 'Frutillas', 'Fruta', 100, 'g', 32, 0.7, 7.7, 0.3, false, true],
    ['ALI-036', 'Uvas', 'Fruta', 100, 'g', 69, 0.7, 18.0, 0.2, false, true],
    ['ALI-037', 'Sandía', 'Fruta', 200, 'g', 60, 1.2, 15.0, 0.3, false, true],
    ['ALI-038', 'Trutro de pollo sin piel cocido', 'Proteína', 100, 'g', 179, 25.0, 0.0, 8.2, false, true],
    ['ALI-039', 'Carne de vacuno magra cocida (posta/lomo)', 'Proteína', 100, 'g', 190, 28.0, 0.0, 8.0, true, true],
    ['ALI-040', 'Lomo de cerdo cocido', 'Proteína', 100, 'g', 210, 27.0, 0.0, 11.0, false, true],
    ['ALI-041', 'Merluza cocida', 'Proteína', 100, 'g', 100, 21.0, 0.0, 1.5, false, true],
    ['ALI-042', 'Jurel en conserva al natural', 'Proteína', 100, 'g', 160, 21.0, 0.0, 8.0, false, true],
    ['ALI-043', 'Jamón de pavo (2 láminas, 40 g)', 'Proteína', 40, 'g', 45, 7.0, 1.0, 1.2, false, true],
    ['ALI-044', 'Lentejas cocidas', 'Legumbre', 100, 'g', 116, 9.0, 20.0, 0.4, true, true],
    ['ALI-045', 'Porotos cocidos', 'Legumbre', 100, 'g', 127, 8.7, 22.8, 0.5, true, true],
    ['ALI-046', 'Garbanzos cocidos', 'Legumbre', 100, 'g', 164, 8.9, 27.4, 2.6, false, true],
    ['ALI-047', 'Marraqueta (1 unidad, aprox. 100 g)', 'Carbohidrato', 1, 'unidad', 265, 9.0, 49.0, 3.2, true, true],
    ['ALI-048', 'Hallulla (1 unidad, aprox. 90 g)', 'Carbohidrato', 1, 'unidad', 250, 8.0, 46.0, 3.5, false, true],
    ['ALI-049', 'Tallarines cocidos', 'Carbohidrato', 100, 'g', 158, 5.8, 31.0, 0.9, false, true],
    ['ALI-050', 'Camote cocido', 'Carbohidrato', 100, 'g', 90, 2.0, 21.0, 0.1, false, true],
    ['ALI-051', 'Leche entera', 'Lácteo', 200, 'ml', 124, 6.6, 9.6, 6.6, false, true],
    ['ALI-052', 'Leche descremada', 'Lácteo', 200, 'ml', 70, 6.8, 9.8, 0.2, false, true],
    ['ALI-053', 'Kéfir natural', 'Lácteo', 200, 'ml', 110, 7.0, 9.0, 5.0, true, true],
    ['ALI-054', 'Yogur natural sin azúcar', 'Lácteo', 150, 'g', 90, 5.0, 7.0, 5.0, false, true],
    ['ALI-055', 'Queso gauda / mantecoso (1 lámina, 30 g)', 'Lácteo', 30, 'g', 107, 7.5, 0.7, 8.1, false, true],
    ['ALI-056', 'Quesillo / queso fresco', 'Lácteo', 100, 'g', 98, 11.0, 3.4, 4.3, false, true],
    ['ALI-057', 'Mantequilla (1 cdta)', 'Grasa', 10, 'g', 72, 0.1, 0.0, 8.1, false, true],
    ['ALI-058', 'Mayonesa (1 cda)', 'Grasa', 15, 'g', 100, 0.1, 0.3, 11.0, false, true],
    ['ALI-059', 'Maní sin sal', 'Grasa', 30, 'g', 170, 7.7, 4.8, 14.7, false, true],
    ['ALI-060', 'Chocolate (porción de 15 g)', 'Otros', 15, 'g', 85, 1.2, 8.5, 5.5, false, true],
    ['ALI-061', 'Coca-Cola Zero / bebida sin azúcar', 'Otros', 350, 'ml', 0, 0.0, 0.0, 0.0, false, true],
    ['ALI-062', 'Café solo o té sin azúcar', 'Otros', 200, 'ml', 2, 0.1, 0.0, 0.0, false, true],
    ['ALI-063', 'Azúcar (1 cdta)', 'Otros', 5, 'g', 20, 0.0, 5.0, 0.0, false, true]
  ];
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return;
  const idsExistentes = {};
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, 1).getValues().forEach(function (r) { idsExistentes[r[0]] = true; });
  }
  const faltan = NUEVOS.filter(function (r) { return !idsExistentes[r[0]]; });
  if (faltan.length === 0) return;
  // Marca de migración: si ya se añadió ALI-017 alguna vez y el usuario lo borró, no insistimos.
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('ALIMENTOS_V2') === 'ok') return;
  sheet.getRange(lastRow + 1, 1, faltan.length, faltan[0].length).setValues(faltan);
  props.setProperty('ALIMENTOS_V2', 'ok');
}

/**
 * Obtiene la lista de alimentos para el módulo de nutrición
 */
function apiGetAlimentos_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ALIMENTOS);
  ensureAlimentosV2_(sheet);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, alimentos: [] };

  const headers = data[0];
  const list = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, col) => obj[h] = data[i][col]);
    if (obj.activo !== false) {
      list.push(obj);
    }
  }
  return { success: true, alimentos: list };
}

/**
 * Agrega un alimento propio a la base (hoja ALIMENTOS) y lo devuelve.
 */
function apiAddAlimento_(p) {
  try {
    const nombre = String((p && p.nombre) || '').trim();
    if (!nombre) return { success: false, error: 'Falta el nombre.' };
    const base = Number(p.porcion_base);
    if (!(base > 0)) return { success: false, error: 'La porción base debe ser mayor a 0.' };
    const num = function (v) { const n = Number(v); return isFinite(n) && n >= 0 ? n : 0; };
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEETS.ALIMENTOS);
      ensureAlimentosV2_(sheet);
      const data = sheet.getDataRange().getValues();
      let maxN = 0;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim().toLowerCase() === nombre.toLowerCase()) {
          return { success: false, error: 'Ya existe un alimento con ese nombre.' };
        }
        const m = /^ALI-(\d+)$/.exec(String(data[i][0]));
        if (m) maxN = Math.max(maxN, Number(m[1]));
      }
      const id = 'ALI-' + ('000' + (maxN + 1)).slice(-3);
      const unidad = ['g', 'ml', 'unidad'].indexOf(p.unidad_medida) >= 0 ? p.unidad_medida : 'g';
      const row = [id, nombre, p.categoria || 'Otros', base, unidad,
        num(p.calorias), num(p.proteina_g), num(p.carbos_g), num(p.grasas_g), false, true];
      sheet.appendRow(row);
      return { success: true, alimento: {
        id_alimento: id, nombre: nombre, categoria: row[2], porcion_base: base, unidad_medida: unidad,
        calorias: row[5], proteina_g: row[6], carbos_g: row[7], grasas_g: row[8], favorito: false, activo: true } };
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
function apiAddAlimento(a) { return serializarCliente_(apiAddAlimento_(a)); }

/**
 * Guarda un ítem de comida consumida
 */
function apiSaveComidaItem_(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.COMIDAS);
    const tz = Session.getScriptTimeZone();
    const fecha = payload.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    const hora = payload.hora || Utilities.formatDate(new Date(), tz, 'HH:mm');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = 'COM-' + fecha.replace(/-/g, '') + '-' + randomHex;

    const rowValues = [
      id,
      fecha,
      payload.tipo_comida || 'Almuerzo',
      payload.id_alimento || '',
      payload.nombre_alimento || '',
      Number(payload.cantidad || 0),
      payload.unidad || 'g',
      Math.round(Number(payload.calorias_calc || 0)),
      Math.round(Number(payload.proteina_calc_g || 0) * 10) / 10,
      Math.round(Number(payload.carbos_calc_g || 0) * 10) / 10,
      Math.round(Number(payload.grasas_calc_g || 0) * 10) / 10,
      hora
    ];

    sheet.appendRow(rowValues);
    return { success: true, message: 'Comida registrada correctamente.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Elimina un registro de comida
 */
function apiDeleteComidaItem_(idComidaItem) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.COMIDAS);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idComidaItem) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Ítem eliminado.' };
      }
    }
    return { success: false, error: 'No se encontró el ítem.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Obtiene las comidas del día seleccionado
 */
function apiGetComidasDia_(fecha) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = Session.getScriptTimeZone();
  const targetDate = fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const items = getComidasByFecha(ss, targetDate);
  return { success: true, fecha: targetDate, comidas: items };
}

/**
 * Guarda una serie de entrenamiento (Sobrecarga Progresiva)
 */
function apiSaveSerieEntrenamiento_(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.ENTRENAMIENTOS);
    const tz = Session.getScriptTimeZone();
    const fecha = payload.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = 'ENT-' + fecha.replace(/-/g, '') + '-' + randomHex;

    const peso = Number(payload.peso_kg || 0);
    const reps = Number(payload.repeticiones || 0);
    const volumen = Math.round(peso * reps * 10) / 10;

    const rowValues = [
      id,
      fecha,
      payload.dia_sesion || '',
      payload.id_ejercicio || '',
      Number(payload.numero_serie || 1),
      peso,
      reps,
      payload.rir !== undefined ? Number(payload.rir) : 1,
      volumen,
      payload.es_record_personal || false,
      payload.notas_serie || '',
      new Date()
    ];

    sheet.appendRow(rowValues);
    return { success: true, message: 'Serie guardada con éxito.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Obtiene el historial previo de un ejercicio para comparar sobrecarga progresiva
 */
function apiGetHistorialEjercicio_(idEjercicio) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ENTRENAMIENTOS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, historial: [] };

  const tz = Session.getScriptTimeZone();
  const records = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === idEjercicio) {
      let f = data[i][1];
      let fStr = (f instanceof Date) ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f).substring(0, 10);
      records.push({
        id_serie: data[i][0],
        fecha: fStr,
        numero_serie: data[i][4],
        peso_kg: data[i][5],
        repeticiones: data[i][6],
        rir: data[i][7],
        volumen_kg: data[i][8],
        notas: data[i][10]
      });
    }
  }

  // Agrupar por fecha
  const porFecha = {};
  records.forEach(r => {
    if (!porFecha[r.fecha]) porFecha[r.fecha] = [];
    porFecha[r.fecha].push(r);
  });

  return { success: true, agupadoPorFecha: porFecha, todos: records, hoy: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd') };
}

/**
 * Guarda una medición antropométrica
 */
function apiSaveMedida_(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.MEDIDAS);
    const tz = Session.getScriptTimeZone();
    const fecha = payload.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    const id = 'MED-' + fecha.replace(/-/g, '');

    const rowValues = [
      id,
      fecha,
      payload.peso_referencia ? Number(payload.peso_referencia) : '',
      payload.cintura_ombligo_cm ? Number(payload.cintura_ombligo_cm) : '',
      payload.pecho_cm ? Number(payload.pecho_cm) : '',
      payload.brazo_izq_cm ? Number(payload.brazo_izq_cm) : '',
      payload.brazo_der_cm ? Number(payload.brazo_der_cm) : '',
      payload.muslo_izq_cm ? Number(payload.muslo_izq_cm) : '',
      payload.muslo_der_cm ? Number(payload.muslo_der_cm) : '',
      payload.cadera_cm ? Number(payload.cadera_cm) : '',
      payload.foto_frente_url || '',
      payload.foto_perfil_url || '',
      payload.foto_espalda_url || '',
      payload.comentarios || ''
    ];

    sheet.appendRow(rowValues);
    return { success: true, message: 'Medidas corporales guardadas.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Obtiene lista de medidas históricas
 */
function apiGetMedidas_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEDIDAS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, medidas: [] };

  const tz = Session.getScriptTimeZone();
  const headers = data[0];
  const list = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, col) => {
      let val = data[i][col];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
      }
      obj[h] = val;
    });
    list.push(obj);
  }
  return { success: true, medidas: list };
}

/**
 * Guarda o actualiza configuraciones en la hoja CONFIG
 */
function apiSaveConfig_(configMap) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.CONFIG);
    const data = sheet.getDataRange().getValues();

    for (let key in configMap) {
      let updated = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(configMap[key]);
          sheet.getRange(i + 1, 4).setValue(new Date());
          updated = true;
          break;
        }
      }
      if (!updated) {
        sheet.appendRow([key, configMap[key], '', new Date()]);
      }
    }
    return { success: true, message: 'Configuraciones actualizadas con éxito.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// ============================================================================
// FUNCIONES AUXILIARES INTERNAS
// ============================================================================

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#0f172a'); // Slate 900
  headerRange.setFontColor('#f8fafc'); // Slate 50
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function getConfigsAsMap(ss) {
  const sheet = ss.getSheetByName(SHEETS.CONFIG);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      map[data[i][0]] = data[i][1];
    }
  }
  return map;
}

function getRegistroDiarioByFecha(ss, fechaStr) {
  const sheet = ss.getSheetByName(SHEETS.REGISTRO_DIARIO);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    let f = data[i][1];
    let fStr = (f instanceof Date) ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f).substring(0, 10);
    if (fStr === fechaStr) {
      let obj = {};
      headers.forEach((h, col) => obj[h] = data[i][col]);
      return obj;
    }
  }
  return null;
}

function getComidasByFecha(ss, fechaStr) {
  const sheet = ss.getSheetByName(SHEETS.COMIDAS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();
  const headers = data[0];
  const list = [];

  for (let i = 1; i < data.length; i++) {
    let f = data[i][1];
    let fStr = (f instanceof Date) ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f).substring(0, 10);
    if (fStr === fechaStr) {
      // Por posición (no por encabezado): la hoja puede tener encabezados distintos
      const r = data[i];
      list.push({
        id_comida_item: r[0], fecha: fStr, tipo_comida: r[2], id_alimento: r[3],
        nombre_alimento: r[4], cantidad: r[5], unidad: r[6],
        calorias_calc: r[7], proteina_calc_g: r[8], carbos_calc_g: r[9],
        grasas_calc_g: r[10], hora_registro: r[11]
      });
    }
  }
  return list;
}

function getDiaSemanaNombre(fecha) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[fecha.getDay()];
}

/**
 * Migración idempotente: añade a EJERCICIOS las columnas modo / trabajo_seg /
 * descanso_intervalo_seg y rellena video_url vacíos con una búsqueda en YouTube.
 * Se ejecuta sola la primera vez que se lee la rutina.
 * modo = 'reps' (solo cronometra descanso) | 'tiempo' (trabajo + descanso + series)
 */
function ensureEjerciciosV2(sheetEj) {
  const lastRow = sheetEj.getLastRow();
  const lastCol = sheetEj.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;
  const headers = sheetEj.getRange(1, 1, 1, lastCol).getValues()[0];
  if (headers.indexOf('modo') !== -1) return;

  const startCol = lastCol + 1;
  sheetEj.getRange(1, startCol, 1, 3).setValues([['modo', 'trabajo_seg', 'descanso_intervalo_seg']]);
  sheetEj.getRange(1, startCol, 1, 3).setFontWeight('bold');

  if (lastRow >= 2) {
    const base = sheetEj.getRange(2, 1, lastRow - 1, lastCol).getValues();
    const iVideo = headers.indexOf('video_url');
    const extra = [];
    const videos = [];
    base.forEach(function (r) {
      const esPlancha = r[0] === 'EJ-015';
      extra.push([esPlancha ? 'tiempo' : 'reps', esPlancha ? 40 : '', esPlancha ? 45 : '']);
      if (iVideo !== -1) {
        videos.push([r[iVideo] || ('https://www.youtube.com/results?search_query=' +
          encodeURIComponent('técnica ' + r[1] + ' ejercicio'))]);
      }
    });
    sheetEj.getRange(2, startCol, extra.length, 3).setValues(extra);
    if (iVideo !== -1) sheetEj.getRange(2, iVideo + 1, videos.length, 1).setValues(videos);
  }
}


/**
 * Demostración de ejercicios (GIF + pasos en español).
 * Fuente: github.com/plataformafitness/exercises-library (código MIT; imágenes © Gym visual, uso con atribución).
 * Añade columnas gif_url y pasos_es a EJERCICIOS y las rellena si están vacías.
 */
function ensureEjerciciosGif_(sheetEj) {
  const lastCol = sheetEj.getLastColumn();
  const lastRow = sheetEj.getLastRow();
  if (lastRow < 2 || lastCol < 1) return;
  const props_ = PropertiesService.getScriptProperties();
  if (props_.getProperty('EJ_GIF_V1') === '1') {
    // V2: Smart Fit no tiene máquina de gemelos -> EJ-022 pasa a la prensa 45°
    if (props_.getProperty('EJ_GIF_V2') !== '1') {
      const h2 = sheetEj.getRange(1, 1, 1, lastCol).getValues()[0];
      const g2 = h2.indexOf('gif_url'), p2 = h2.indexOf('pasos_es');
      const ids2 = sheetEj.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let k = 0; k < ids2.length; k++) {
        if (ids2[k][0] === 'EJ-022') {
          const fila = k + 2;
          sheetEj.getRange(fila, 2).setValue('Elevación de Talones en Prensa');
          sheetEj.getRange(fila, 4).setValue('Prensa 45°');
          if (g2 !== -1) sheetEj.getRange(fila, g2 + 1).setValue('https://raw.githubusercontent.com/plataformafitness/exercises-library/main/videos/1391-ykHcWme.gif');
          if (p2 !== -1) sheetEj.getRange(fila, p2 + 1).setValue('Siéntate en la prensa 45° y apoya solo la parte delantera de los pies en el borde inferior de la plataforma, separados al ancho de los hombros. | Suelta los seguros y extiende las piernas sin bloquear las rodillas; mantenlas casi rectas durante todo el ejercicio. | Baja la plataforma flexionando solo los tobillos, hasta sentir el estiramiento en las pantorrillas. | Empuja con la punta de los pies, sube lo más alto que puedas y haz una pausa de 1 segundo arriba. | Repite el número de repeticiones deseado y al terminar vuelve a poner los seguros.');
        }
      }
      props_.setProperty('EJ_GIF_V2', '1');
    }
    return;
  }
  const MAPA = {"EJ-001":["videos/0289-SpYC0Kp.gif","Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco. | Sujeta una mancuerna en cada mano, con las palmas hacia adelante y los brazos extendidos por encima del pecho. | Baja lentamente las mancuernas hacia los lados del pecho, manteniendo los codos en un ángulo de 90 grados. | Haz una pausa breve, luego empuja las mancuernas de vuelta hacia arriba hasta la posición inicial, extendiendo completamente los brazos. | Repite el número de repeticiones deseado."],"EJ-002":["videos/0314-ns0SIbU.gif","Coloca un banco inclinado a un ángulo de 45 grados. | Siéntate en el banco con los pies apoyados en el suelo y la espalda firmemente apoyada contra el banco. | Sostén una mancuerna en cada mano, con las palmas hacia adelante, y levántalas hasta la altura de los hombros. | Baja lentamente las mancuernas hacia los lados del pecho, manteniendo los codos en un ángulo de 90 grados. | Empuja las mancuernas de nuevo hacia arriba hasta la posición inicial, extendiendo completamente los brazos. | Repite el número de repeticiones deseado."],"EJ-003":["videos/0155-0CXGHya.gif","Ajusta las poleas del cable a la altura del pecho. | Ponte de pie en el centro de la máquina de cable con un pie delante del otro. | Sujeta las agarraderas con las palmas hacia abajo y los brazos extendidos hacia los lados. | Da un paso hacia adelante, manteniendo los brazos ligeramente flexionados. | Con una ligera flexión en los codos, junta las manos frente al pecho. | Haz una pausa breve, luego vuelve lentamente los brazos a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-004":["videos/0198-RVwzP10.gif","Ajusta la máquina de jalón de cable de modo que el asiento quede a una altura cómoda y la almohadilla de rodillas esté asegurada. | Siéntate con la espalda recta y los pies apoyados planos en el suelo. | Sujeta la barra del cable con un agarre prono, un poco más separado que el ancho de los hombros. | Inclínate ligeramente hacia atrás y activa el core. | Jala la barra del cable hacia el pecho, apretando los omóplatos entre sí. | Haz una pausa por un momento en la parte baja del movimiento y luego suelta lentamente la barra de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-005":["videos/0292-C0MA9bC.gif","Ponte de pie con los pies separados a la altura de los hombros, sosteniendo una mancuerna en una mano con la palma hacia el cuerpo. | Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado. | Deja que la mancuerna cuelgue recta hacia el suelo, con el brazo completamente extendido. | Tira de la mancuerna hacia el pecho, manteniendo el codo cerca del cuerpo y juntando los omóplatos. | Haz una pausa breve en la parte más alta, luego baja lentamente la mancuerna de vuelta a la posición inicial. | Repite el número de repeticiones deseado, luego cambia de lado."],"EJ-006":["videos/0861-fUBheHs.gif","Siéntate en la máquina de remo con cable con los pies planos sobre los apoyapiés y las rodillas ligeramente flexionadas. | Sujeta las agarraderas con un agarre prono, manteniendo la espalda recta y los hombros relajados. | Jala las agarraderas hacia el cuerpo, apretando los omóplatos entre sí. | Haz una pausa por un momento en el punto máximo del movimiento, luego suelta lentamente las agarraderas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-007":["videos/1760-yn8yg1r.gif","Ponte de pie con los pies separados a la altura de los hombros, sosteniendo una mancuerna verticalmente contra el pecho con ambas manos. | Manteniendo el pecho erguido y el core activado, baja el cuerpo a una posición de sentadilla empujando las caderas hacia atrás y flexionando las rodillas. | Continúa bajando hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente. | Haz una pausa por un momento en la parte inferior, luego empuja con los talones para regresar a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-008":["videos/1463-2Qh2J1e.gif","Ajusta el asiento de la máquina de trineo de modo que las rodillas queden en un ángulo de 90 grados cuando los pies estén sobre la placa. | Siéntate en la máquina de trineo con la espalda plana contra el respaldo y los pies separados a la altura de los hombros sobre la placa. | Sujeta las asas a los lados del asiento para mayor estabilidad. | Empuja contra la placa para extender las piernas, estirándolas por completo. | Haz una pausa por un momento en la posición alta, luego dobla lentamente las rodillas para bajar la placa de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-009":["videos/0586-17lJ1kr.gif","Ajusta la máquina a tu cuerpo y selecciona el peso deseado. | Túmbate boca abajo en la máquina con las piernas rectas y los talones contra la palanca acolchada. | Sujeta las asas o los lados de la máquina para mayor estabilidad. | Manteniendo la parte superior del cuerpo inmóvil, exhala y flexiona las piernas hacia arriba tanto como sea posible sin levantar las caderas de la almohadilla. | Mantén la posición contraída durante una pausa breve mientras aprietas los isquiotibiales. | Inhala y baja lentamente la palanca de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-010":["videos/0334-DsgkuIt.gif","Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo. | Mantén la espalda recta y activa el core. | Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos. | Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-011":["videos/0405-znQUdHY.gif","Siéntate en un banco con una mancuerna en cada mano, apoyadas en los muslos. | Sube las mancuernas hasta la altura de los hombros, con las palmas hacia adelante. | Presiona las mancuernas hacia arriba hasta que los brazos queden completamente extendidos por encima de la cabeza. | Haz una pausa por un momento en la parte superior, luego baja lentamente las mancuernas de vuelta a la altura de los hombros. | Repite el número de repeticiones deseado."],"EJ-012":["videos/0294-NbVPDMW.gif","Ponte de pie con una mancuerna en cada mano, con las palmas hacia adelante y los brazos completamente extendidos. | Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps. | Continúa levantando las pesas hasta que los bíceps estén completamente contraídos y las mancuernas estén a la altura de los hombros. | Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps. | Inhala y comienza a bajar lentamente las mancuernas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-013":["videos/0200-dU605di.gif","Sujeta un accesorio de cuerda a una polea alta en una máquina de cable. | Ponte de pie frente a la máquina con los pies separados a la altura de los hombros y una ligera flexión en las rodillas. | Sujeta la cuerda con un agarre prono, con las palmas una frente a la otra. | Mantén los codos cerca de los costados y los brazos superiores quietos durante todo el ejercicio. | Exhala y empuja la cuerda hacia abajo extendiendo los codos hasta que los brazos queden completamente extendidos. | Haz una pausa por un momento, luego inhala y regresa lentamente a la posición inicial permitiendo que los codos se flexionen. | Repite el número de repeticiones deseado."],"EJ-014":["videos/0009-PAgTVaK.gif","Ajusta la máquina a la altura deseada y asegura las rodillas sobre la almohadilla. | Agarra las agarraderas con las palmas hacia abajo y los brazos completamente extendidos. | Baja el cuerpo flexionando los codos hasta que los brazos queden paralelos al suelo. | Haz una pausa por un momento, luego empuja tu cuerpo de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-015":["videos/2135-VBAWRPG.gif","Comienza tumbándote boca abajo en el suelo. | Coloca los antebrazos en el suelo, con los codos justo debajo de los hombros. | Extiende las piernas rectas hacia atrás, con la punta de los pies en el suelo. | Activa el core y levanta el cuerpo del suelo, equilibrándote sobre los antebrazos y la punta de los pies. | Mantén el cuerpo en línea recta desde la cabeza hasta los talones. | Mantén esta posición durante el tiempo deseado. | Baja el cuerpo de nuevo a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-017":["videos/0175-WW95auq.gif","Sujeta una agarradera de cuerda a una polea alta y ponte de rodillas de espaldas a la máquina. | Sujeta la agarradera de cuerda con ambas manos y colócala detrás de la cabeza, manteniendo los codos hacia afuera a los lados. | Manteniendo las caderas inmóviles, flexiona la cintura y encoge el torso hacia los muslos. | Haz una pausa por un momento en la parte inferior, luego regresa lentamente a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-018":["videos/0472-I3tsCnC.gif","Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera. | Activa el core y levanta las piernas frente a ti, manteniéndolas rectas. | Continúa levantando hasta que las piernas estén paralelas al suelo o tan alto como puedas llegar cómodamente. | Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-019":["videos/0313-slDvUAU.gif","Ponte de pie con una mancuerna en cada mano, con las palmas mirando hacia el torso. | Mantén los codos cerca del torso y gira las palmas de las manos hasta que queden mirando hacia adelante. | Esta será tu posición inicial. | Ahora, manteniendo los brazos superiores quietos, exhala y flexiona los brazos contrayendo los bíceps. | Continúa levantando las pesas hasta que los bíceps estén completamente contraídos y las mancuernas estén a la altura de los hombros. | Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps. | Luego, inhala y comienza a bajar lentamente las mancuernas de vuelta a la posición inicial. | Repite el número de repeticiones recomendado."],"EJ-020":["videos/0203-wqNPGCg.gif","Sujeta una agarradera de cuerda a una máquina de cable con polea baja. | Ponte de pie frente a la máquina con los pies separados a la altura de los hombros. | Sujeta la agarradera de cuerda con un agarre prono, con las palmas una frente a la otra. | Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta. | Mantén los codos ligeramente flexionados y jala la cuerda hacia el pecho, apretando los omóplatos entre sí. | Haz una pausa por un momento en la parte más alta del movimiento y luego libera lentamente la tensión, regresando a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-021":["videos/1459-rR0LJzx.gif","Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano con un agarre prono. | Manteniendo la espalda recta y el core activado, inclínate desde las caderas y baja las mancuernas hacia el suelo, permitiendo que las rodillas se flexionen ligeramente. | Baja las mancuernas hasta sentir un estiramiento en los isquiotibiales, luego empuja con los talones y activa los glúteos para volver a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-022":["videos/1391-ykHcWme.gif","Siéntate en la prensa 45° y apoya solo la parte delantera de los pies en el borde inferior de la plataforma, separados al ancho de los hombros. | Suelta los seguros y extiende las piernas sin bloquear las rodillas; mantenlas casi rectas durante todo el ejercicio. | Baja la plataforma flexionando solo los tobillos, hasta sentir el estiramiento en las pantorrillas. | Empuja con la punta de los pies, sube lo más alto que puedas y haz una pausa de 1 segundo arriba. | Repite el número de repeticiones deseado y al terminar vuelve a poner los seguros."],"EJ-023":["videos/0603-67n3r98.gif","Ajusta la altura del asiento y colócate en la máquina con la espalda apoyada en el respaldo. | Agarra las asas con un agarre prono y coloca las manos a la altura de los hombros. | Empuja las asas hacia arriba hasta que los brazos queden completamente extendidos, pero sin bloquear los codos. | Haz una pausa breve en lo alto, luego baja lentamente las asas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."],"EJ-024":["videos/0430-PdmaD0N.gif","Ponte de pie con los pies separados a la altura de los hombros y sujeta una mancuerna con una mano. | Levanta la mancuerna por encima de la cabeza, manteniendo el brazo recto. | Flexiona el codo y baja la mancuerna detrás de la cabeza, manteniendo fija la parte superior del brazo. | Extiende el brazo de vuelta hacia arriba, hasta la posición inicial. | Repite el número de repeticiones deseado."]};
  const BASE = 'https://raw.githubusercontent.com/plataformafitness/exercises-library/main/';
  let headers = sheetEj.getRange(1, 1, 1, lastCol).getValues()[0];
  let iGif = headers.indexOf('gif_url');
  let iPasos = headers.indexOf('pasos_es');
  if (iGif === -1) { iGif = headers.length; headers.push('gif_url'); sheetEj.getRange(1, iGif + 1).setValue('gif_url').setFontWeight('bold'); }
  if (iPasos === -1) { iPasos = headers.length; headers.push('pasos_es'); sheetEj.getRange(1, iPasos + 1).setValue('pasos_es').setFontWeight('bold'); }
  const n = lastRow - 1;
  const ids = sheetEj.getRange(2, 1, n, 1).getValues();
  const gifs = sheetEj.getRange(2, iGif + 1, n, 1).getValues();
  const pasos = sheetEj.getRange(2, iPasos + 1, n, 1).getValues();
  for (let i = 0; i < n; i++) {
    const m = MAPA[ids[i][0]];
    if (!m) continue;
    if (!gifs[i][0]) gifs[i][0] = BASE + m[0];
    if (!pasos[i][0]) pasos[i][0] = m[1];
  }
  sheetEj.getRange(2, iGif + 1, n, 1).setValues(gifs);
  sheetEj.getRange(2, iPasos + 1, n, 1).setValues(pasos);
  PropertiesService.getScriptProperties().setProperty('EJ_GIF_V1', '1');
  PropertiesService.getScriptProperties().setProperty('EJ_GIF_V2', '1');
}

/**
 * Plan A (v13): ejercicios nuevos (máquinas Smart Fit + alternativas con mancuernas/peso corporal),
 * columna 'alternativas' y ajuste de la rutina:
 *  - Miércoles: se agrega Extensión de Cuádriceps en Máquina (EJ-025) tras la prensa.
 *  - Jueves: Cruces en Polea (EJ-003) pasa a Pec Fly en Máquina (EJ-026).
 * Se ejecuta una sola vez (script property PLAN_A_V1).
 */
function ensurePlanA_(sheetEj, sheetRut) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('PLAN_A_V1') === '1') return;
  const BASE = 'https://raw.githubusercontent.com/plataformafitness/exercises-library/main/';
  const NUEVOS = {"EJ-025": ["Extensión de Cuádriceps en Máquina", "Cuádriceps", "Máquina guiada", "Sube controlado, pausa 1 seg arriba, baja en 2-3 seg", "videos/0585-my33uHU.gif", "Ajusta la altura del asiento y el respaldo de la máquina a tu cuerpo. | Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre la almohadilla para los pies. | Sujeta las asas o las barras laterales para mayor estabilidad. | Extiende las piernas hacia adelante enderezando las rodillas, levantando el peso. | Haz una pausa breve en lo alto, luego baja lentamente el peso de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-026": ["Pec Fly en Máquina", "Pecho", "Máquina guiada", "Codos levemente flexionados, junta al frente y aprieta 1 seg", "videos/0596-v3xmPAR.gif", "Ajusta la altura del asiento y colócate en la máquina con la espalda apoyada en la almohadilla. | Agarra las asas con un agarre pronado y mantén los codos ligeramente flexionados. | Exhala y empuja las asas hacia adelante, juntándolas frente a tu pecho. | Haz una pausa por un momento, contrayendo los músculos del pecho. | Inhala y vuelve lentamente a la posición inicial, permitiendo que los músculos del pecho se estiren. | Repite el número de repeticiones deseado."], "EJ-027": ["Press de Pecho en Máquina", "Pecho", "Máquina guiada", "Espalda pegada al respaldo, no bloquees los codos", "videos/0577-T0yTjgW.gif", "Ajusta la altura del asiento y colócate en la máquina con la espalda totalmente apoyada en la almohadilla. | Sujeta las asas con un agarre prono y coloca los codos en un ángulo de 90 grados. | Empuja las asas hacia adelante hasta que los brazos queden completamente extendidos, exhalando durante el movimiento. | Haz una pausa breve al final del movimiento, luego vuelve lentamente a la posición inicial, inhalando mientras lo haces. | Repite el número de repeticiones deseado."], "EJ-028": ["Zancadas con Mancuernas", "Cuádriceps", "Mancuerna (cada una)", "Torso erguido, rodilla delantera sobre el pie", "videos/0336-RRWFUcw.gif", "Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano. | Da un paso adelante con el pie derecho, bajando el cuerpo hasta una posición de zancada. | Mantén la espalda recta y el pecho erguido mientras bajas el cuerpo. | Empuja con el talón derecho para regresar a la posición inicial. | Repite con la pierna izquierda. | Alterna las piernas el número de repeticiones deseado."], "EJ-029": ["Remo Inclinado con 2 Mancuernas", "Espalda", "Mancuerna (cada una)", "Espalda neutra, lleva los codos hacia la cadera", "videos/0293-BJ0Hz5L.gif", "Ponte de pie con los pies separados a la altura de los hombros, las rodillas ligeramente flexionadas, y sujeta una mancuerna en cada mano con las palmas hacia tu cuerpo. | Inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado. | Deja que los brazos cuelguen rectos hacia el suelo, con los codos ligeramente flexionados. | Tira de las mancuernas hacia arriba, hacia el pecho, apretando los omóplatos entre sí. | Haz una pausa breve en la parte alta, luego baja lentamente las mancuernas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-030": ["Pullover con Mancuerna", "Espalda", "Mancuerna (cada una)", "Brazos casi rectos, siente el estiramiento del dorsal", "videos/0375-9XjtHvS.gif", "Túmbate boca arriba en un banco con la cabeza en un extremo y los pies en el suelo. | Sujeta una mancuerna con ambas manos y extiende los brazos rectos por encima del pecho. | Manteniendo una ligera flexión en los codos, baja lentamente la mancuerna detrás de la cabeza hasta sentir un estiramiento en el pecho y los hombros. | Haz una pausa por un momento, luego levanta la mancuerna de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-031": ["Aperturas con Mancuernas", "Pecho", "Mancuerna (cada una)", "Codos levemente flexionados, baja hasta sentir estiramiento", "videos/0308-yz9nUhF.gif", "Túmbate boca arriba en un banco con una mancuerna en cada mano, con las palmas enfrentadas entre sí. | Extiende los brazos rectos hacia arriba sobre el pecho, con una ligera flexión en los codos. | Manteniendo una ligera flexión en los codos, baja los brazos hacia los lados en un amplio arco hasta sentir un estiramiento en el pecho. | Haz una pausa por un momento, luego invierte el movimiento y lleva las mancuernas de nuevo hacia arriba hasta la posición inicial. | Repite el número de repeticiones deseado."], "EJ-032": ["Flexiones de Brazos", "Pecho", "Peso corporal", "Cuerpo en línea recta, baja el pecho cerca del suelo", "videos/0662-I4hDWkc.gif", "Comienza en una posición de plancha alta con las manos un poco más separadas que la anchura de los hombros y los pies juntos. | Activa el core y baja el cuerpo hacia el suelo flexionando los codos, manteniendo el cuerpo en línea recta. | Haz una pausa cuando el pecho esté justo por encima del suelo y luego empújate de vuelta a la posición inicial estirando los brazos. | Repite el número de repeticiones deseado."], "EJ-033": ["Patada de Tríceps con Mancuerna", "Tríceps", "Mancuerna (cada una)", "Brazo superior pegado al torso, extiende completo", "videos/0333-W6PxUkg.gif", "Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano. | Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta. | Acerca los brazos superiores a los costados, con los codos flexionados en un ángulo de 90 grados. | Extiende los brazos rectos hacia atrás, contrayendo los tríceps en la parte superior del movimiento. | Haz una pausa por un momento, luego baja lentamente las mancuernas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-034": ["Crunch en el Suelo", "Core", "Peso corporal", "Sube solo el tronco, exhala al contraer", "videos/0274-TFqbd8t.gif", "Túmbate sobre tu espalda con las rodillas flexionadas y los pies apoyados en el suelo. | Coloca las manos detrás de la cabeza con los codos apuntando hacia afuera. | Activa el abdomen y levanta los hombros del suelo, flexionándote hacia adelante en dirección a las rodillas. | Haz una pausa breve en la parte alta, luego baja lentamente los hombros de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-035": ["Pájaros con Mancuernas", "Hombro", "Mancuerna (cada una)", "Torso inclinado, abre los brazos y aprieta escápulas", "videos/0380-v1qBec9.gif", "Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo. | Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado. | Levanta los brazos hacia los lados, manteniendo una ligera flexión en los codos, hasta que queden paralelos al suelo. | Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-036": ["Elevación de Talones con Mancuernas", "Pantorrillas", "Mancuerna (cada una)", "Sube lo más alto posible, pausa 1 seg arriba", "videos/0417-dPmaUaU.gif", "Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano. | Levanta los talones del suelo lo más alto posible, usando las pantorrillas. | Haz una pausa breve en la parte alta y luego baja lentamente los talones de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-037": ["Elevación de Piernas Tumbado", "Core", "Peso corporal", "Zona lumbar pegada al banco, baja sin balanceo", "videos/0620-WhuFnR7.gif", "Túmbate en un banco plano con la espalda presionada contra él. | Coloca las manos debajo de los glúteos como apoyo. | Mantén las piernas rectas y juntas, y elévalas hacia el techo. | Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-038": ["Puente de Glúteos en Banco", "Isquios/Glúteo", "Peso corporal", "Sube la cadera apretando glúteos, pausa 1 seg", "videos/3523-aWedzZX.gif", "Siéntate en el borde de un banco con la espalda apoyada en él y los pies planos sobre el suelo. | Coloca las manos en el banco junto a las caderas para mayor apoyo. | Activa los glúteos y los isquiotibiales, luego levanta las caderas del banco hasta que el cuerpo forme una línea recta desde las rodillas hasta los hombros. | Haz una pausa por un momento en la parte superior, luego baja lentamente las caderas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-039": ["Fondos en Banco", "Tríceps", "Peso corporal", "Codos hacia atrás, hombros lejos de las orejas", "videos/0129-RrLske5.gif", "Siéntate en el borde de un banco o silla con las manos sujetando el borde junto a las caderas. | Desliza los glúteos fuera del banco y estira las piernas frente a ti, manteniendo los talones en el suelo. | Flexiona los codos y baja el cuerpo hacia el suelo, manteniendo la espalda cerca del banco. | Haz una pausa por un momento en la parte inferior, luego empuja tu cuerpo de vuelta a la posición inicial. | Repite el número de repeticiones deseado."], "EJ-040": ["Curl de Bíceps en Máquina", "Bíceps", "Máquina guiada", "Codos fijos en la almohadilla, baja controlado", "videos/0592-b6hQYMb.gif", "Ajusta la altura del asiento y colócate en la máquina de palanca. | Coloca los brazos superiores en la almohadilla y sujeta las asas con un agarre supino. | Mantén la espalda recta y los codos colocados sobre la almohadilla. | Exhala y flexiona los antebrazos hacia los brazos superiores, contrayendo los bíceps. | Haz una pausa breve en la parte más alta del movimiento, contrayendo los bíceps. | Inhala y baja lentamente las asas de vuelta a la posición inicial. | Repite el número de repeticiones deseado."]};
  const ALT = {"EJ-001": "EJ-027,EJ-032", "EJ-002": "EJ-001,EJ-027", "EJ-003": "EJ-026,EJ-031,EJ-032", "EJ-004": "EJ-005,EJ-030", "EJ-005": "EJ-029,EJ-006", "EJ-006": "EJ-029,EJ-005", "EJ-007": "EJ-028,EJ-008", "EJ-008": "EJ-007,EJ-028", "EJ-009": "EJ-021,EJ-038", "EJ-010": "EJ-011,EJ-023", "EJ-011": "EJ-023,EJ-010", "EJ-012": "EJ-019,EJ-040", "EJ-013": "EJ-024,EJ-033,EJ-039", "EJ-014": "EJ-013,EJ-039,EJ-032", "EJ-015": "EJ-034,EJ-017", "EJ-017": "EJ-034,EJ-037,EJ-015", "EJ-018": "EJ-037,EJ-034", "EJ-019": "EJ-012,EJ-040", "EJ-020": "EJ-035,EJ-029", "EJ-021": "EJ-009,EJ-038", "EJ-022": "EJ-036", "EJ-023": "EJ-011,EJ-010", "EJ-024": "EJ-033,EJ-013", "EJ-025": "EJ-007,EJ-028", "EJ-026": "EJ-031,EJ-003", "EJ-027": "EJ-001,EJ-032", "EJ-028": "EJ-007,EJ-008", "EJ-029": "EJ-005,EJ-006", "EJ-030": "EJ-005,EJ-004", "EJ-031": "EJ-003,EJ-026", "EJ-032": "EJ-001,EJ-027", "EJ-033": "EJ-024,EJ-013", "EJ-034": "EJ-017,EJ-037", "EJ-035": "EJ-020,EJ-029", "EJ-036": "EJ-022", "EJ-037": "EJ-018,EJ-034", "EJ-038": "EJ-009,EJ-021", "EJ-039": "EJ-013,EJ-033", "EJ-040": "EJ-012,EJ-019"};
  const lastCol = sheetEj.getLastColumn();
  let headers = sheetEj.getRange(1, 1, 1, lastCol).getValues()[0];
  const asegurar = function (nombre) {
    let i = headers.indexOf(nombre);
    if (i === -1) { i = headers.length; headers.push(nombre); sheetEj.getRange(1, i + 1).setValue(nombre).setFontWeight('bold'); }
    return i;
  };
  const iGif = asegurar('gif_url'), iPasos = asegurar('pasos_es'), iAlt = asegurar('alternativas');
  const iNotas = headers.indexOf('notas_tecnica'), iModo = headers.indexOf('modo'), iAct = headers.indexOf('activo');
  const lastRow = sheetEj.getLastRow();
  const ids = lastRow >= 2 ? sheetEj.getRange(2, 1, lastRow - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  // 1) agregar ejercicios nuevos
  const filas = [];
  Object.keys(NUEVOS).forEach(function (id) {
    if (ids.indexOf(id) !== -1) return;
    const n = NUEVOS[id];
    const f = new Array(headers.length).fill('');
    f[0] = id; f[1] = n[0]; f[2] = n[1]; f[3] = n[2];
    if (iNotas !== -1) f[iNotas] = n[3];
    if (iModo !== -1) f[iModo] = 'reps';
    if (iAct !== -1) f[iAct] = true;
    f[iGif] = BASE + n[4];
    f[iPasos] = n[5];
    filas.push(f);
  });
  if (filas.length) sheetEj.getRange(sheetEj.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  // 2) alternativas para todos
  const total = sheetEj.getLastRow();
  if (total >= 2) {
    const idsAll = sheetEj.getRange(2, 1, total - 1, 1).getValues();
    const altCol = sheetEj.getRange(2, iAlt + 1, total - 1, 1).getValues();
    for (let i = 0; i < idsAll.length; i++) {
      if (!altCol[i][0] && ALT[idsAll[i][0]]) altCol[i][0] = ALT[idsAll[i][0]];
    }
    sheetEj.getRange(2, iAlt + 1, total - 1, 1).setValues(altCol);
  }
  // 3) ajustar rutina
  if (sheetRut && sheetRut.getLastRow() >= 2) {
    const rut = sheetRut.getRange(1, 1, sheetRut.getLastRow(), Math.max(10, sheetRut.getLastColumn())).getValues();
    let maxNum = 0;
    for (let i = 1; i < rut.length; i++) {
      const m = String(rut[i][0]).match(/(\d+)$/);
      if (m) maxNum = Math.max(maxNum, Number(m[1]));
      if (rut[i][1] === 'Jueves' && rut[i][4] === 'EJ-003') sheetRut.getRange(i + 1, 5).setValue('EJ-026');
    }
    let yaExt = false, filaPrensa = -1;
    for (let i = 1; i < rut.length; i++) {
      if (rut[i][1] === 'Miércoles' && rut[i][4] === 'EJ-025') yaExt = true;
      if (rut[i][1] === 'Miércoles' && rut[i][4] === 'EJ-008') filaPrensa = i;
    }
    if (!yaExt && filaPrensa !== -1) {
      const ordenPrensa = Number(rut[filaPrensa][3]);
      for (let i = 1; i < rut.length; i++) {
        if (rut[i][1] === 'Miércoles' && Number(rut[i][3]) > ordenPrensa) sheetRut.getRange(i + 1, 4).setValue(Number(rut[i][3]) + 1);
      }
      const nueva = rut[filaPrensa].slice();
      nueva[0] = 'RUT-' + String(maxNum + 1).padStart(3, '0');
      nueva[3] = ordenPrensa + 1;
      nueva[4] = 'EJ-025';
      nueva[5] = 3; nueva[6] = 12; nueva[7] = 15; nueva[8] = 2; nueva[9] = 90;
      sheetRut.getRange(sheetRut.getLastRow() + 1, 1, 1, nueva.length).setValues([nueva]);
    }
  }
  props.setProperty('PLAN_A_V1', '1');
}

function getRutinaPorDia(ss, diaSemana) {
  const sheetRut = ss.getSheetByName(SHEETS.RUTINAS_BASE);
  const sheetEj = ss.getSheetByName(SHEETS.EJERCICIOS);
  if (!sheetRut || !sheetEj) return { dia: diaSemana, sesion: 'Sin programar', ejercicios: [] };

  ensureEjerciciosV2(sheetEj);
  ensureEjerciciosGif_(sheetEj);
  ensurePlanA_(sheetEj, sheetRut);

  const rutData = sheetRut.getDataRange().getValues();
  const ejData = sheetEj.getDataRange().getValues();
  const H = {};
  ejData[0].forEach(function (h, i) { H[h] = i; });
  const col = function (row, name, fb) { return H[name] !== undefined ? row[H[name]] : fb; };

  // Mapear catálogo de ejercicios
  const ejMap = {};
  for (let i = 1; i < ejData.length; i++) {
    const r = ejData[i];
    ejMap[r[0]] = {
      id_ejercicio: r[0],
      nombre: r[1],
      grupo_muscular: r[2],
      tipo_carga: r[3],
      video_url: col(r, 'video_url', ''),
      gif_url: col(r, 'gif_url', ''),
      pasos_es: col(r, 'pasos_es', ''),
      alternativas: String(col(r, 'alternativas', '') || '').split(',').map(function (x) { return x.trim(); }).filter(String),
      notas_tecnica: col(r, 'notas_tecnica', ''),
      modo: col(r, 'modo', 'reps') === 'tiempo' ? 'tiempo' : 'reps',
      trabajo_seg: Number(col(r, 'trabajo_seg', 0)) || 0,
      descanso_intervalo_seg: Number(col(r, 'descanso_intervalo_seg', 0)) || 0
    };
  }

  let nombreSesion = 'Descanso';
  const ejercicios = [];

  for (let i = 1; i < rutData.length; i++) {
    if (rutData[i][1] === diaSemana) {
      nombreSesion = rutData[i][2];
      let idEj = rutData[i][4];
      let ejInfo = ejMap[idEj] || { nombre: 'Ejercicio ' + idEj, grupo_muscular: '', tipo_carga: '' };
      
      ejercicios.push({
        orden: rutData[i][3],
        id_ejercicio: idEj,
        nombre: ejInfo.nombre,
        grupo_muscular: ejInfo.grupo_muscular,
        tipo_carga: ejInfo.tipo_carga,
        notas_tecnica: ejInfo.notas_tecnica,
        video_url: ejInfo.video_url || '',
        gif_url: ejInfo.gif_url || '',
        pasos_es: ejInfo.pasos_es || '',
        alternativas: (ejInfo.alternativas || []).map(function (aid) { return ejMap[aid]; }).filter(function (x) { return x; }).map(function (x) { return { id_ejercicio: x.id_ejercicio, nombre: x.nombre, grupo_muscular: x.grupo_muscular, tipo_carga: x.tipo_carga, notas_tecnica: x.notas_tecnica, video_url: x.video_url || '', gif_url: x.gif_url || '', pasos_es: x.pasos_es || '', modo: x.modo || 'reps', trabajo_seg: x.trabajo_seg || 0, descanso_intervalo_seg: x.descanso_intervalo_seg || 0 }; }),
        modo: ejInfo.modo || 'reps',
        trabajo_seg: ejInfo.trabajo_seg || 0,
        descanso_intervalo_seg: ejInfo.descanso_intervalo_seg || 0,
        series_objetivo: rutData[i][5],
        reps_min: rutData[i][6],
        reps_max: rutData[i][7],
        rir_objetivo: rutData[i][8],
        descanso_seg: rutData[i][9]
      });
    }
  }

  ejercicios.sort((a, b) => a.orden - b.orden);

  return {
    dia: diaSemana,
    sesion: nombreSesion,
    ejercicios: ejercicios
  };
}

function getHistorialPesos(ss, limit) {
  const sheet = ss.getSheetByName(SHEETS.REGISTRO_DIARIO);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();
  const list = [];

  for (let i = 1; i < data.length; i++) {
    let peso = data[i][2];
    if (peso && !isNaN(peso)) {
      let f = data[i][1];
      let fStr = (f instanceof Date) ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f).substring(0, 10);
      list.push({
        fecha: fStr,
        peso_kg: Number(peso),
        pasos: data[i][7] || 0,
        horas_sueno: data[i][3] || 0
      });
    }
  }

  return list.slice(-limit);
}

/**
 * Motor de decisión semanal (semáforo JP).
 * Usa el PESO PROMEDIO de ventanas de 7 días (no el peso de un solo día):
 *   semana actual = últimos 7 días hasta el último pesaje; semana previa = 7 días antes; etc.
 *   Una semana es válida con al menos 3 pesajes.
 *   VERDE   : baja 0,4-0,9 kg/semana  -> mantener
 *   AMARILLO: baja menos de 0,3 kg durante 2 semanas seguidas -> revisar hábitos y, si se cumplió, -100/150 kcal
 *   ROJO    : baja más de 1 kg/semana -> si hay debilidad, hambre o cae la fuerza, +100/150 kcal
 */
function promedioVentana_(historial, finStr, diasAtras0, diasAtras1) {
  // ventana [fin - diasAtras1, fin - diasAtras0] en días
  const fin = new Date(finStr + 'T12:00:00Z').getTime();
  const dia = 24 * 3600 * 1000;
  const desde = fin - diasAtras1 * dia;
  const hasta = fin - diasAtras0 * dia;
  const items = historial.filter(function (r) {
    const t = new Date(r.fecha + 'T12:00:00Z').getTime();
    return t >= desde && t <= hasta;
  });
  if (items.length < 3) return null;
  return items.reduce(function (acc, r) { return acc + r.peso_kg; }, 0) / items.length;
}

function calcularDiagnosticoRecomposicion(ss, historialPesos, config) {
  const kcal = Number((config && config.calorias_meta) || 2150);
  const lista = (historialPesos || []).slice().sort(function (x, y) { return x.fecha < y.fecha ? -1 : 1; });
  const calibracion = {
    estado: 'Fase de Calibración',
    semaforo: 'azul',
    color: 'blue',
    mensaje: 'Necesito al menos 3 pesajes en cada una de 2 semanas para medir tu ritmo. Pésate en ayunas, mismo horario.',
    recomendacion: 'Mantener ' + kcal + ' kcal y ' + Number((config && config.proteina_meta) || 153) + ' g de proteína base.',
    ajusteKcal: 0
  };
  if (lista.length < 3) return calibracion;

  const fin = lista[lista.length - 1].fecha;
  const w0 = promedioVentana_(lista, fin, 0, 6);
  const w1 = promedioVentana_(lista, fin, 7, 13);
  const w2 = promedioVentana_(lista, fin, 14, 20);
  const r2 = function (n) { return Math.round(n * 100) / 100; };
  if (w0 === null) return calibracion;

  const base = { pesoPromedioSemana: r2(w0), pesoPromedioSemanaAnterior: w1 === null ? null : r2(w1) };
  if (w1 === null) {
    return Object.assign({}, calibracion, base, {
      mensaje: 'Peso promedio de esta semana: ' + r2(w0) + ' kg. Falta la semana previa para calcular el ritmo.'
    });
  }

  const bajada = r2(w1 - w0);            // kg perdidos esta semana (positivo = bajó)
  const bajadaPrev = w2 === null ? null : r2(w2 - w1);
  const delta = -bajada;
  base.cambioSemanal = delta;

  if (bajada > 1.0) {
    return Object.assign({}, base, {
      estado: '🔴 Bajando muy rápido', semaforo: 'rojo', color: 'rose', delta: delta,
      mensaje: 'Bajaste ' + bajada + ' kg de promedio esta semana (más de 1 kg). Si además notas debilidad, mucha hambre o cae tu fuerza, estás perdiendo demasiado rápido.',
      recomendacion: 'Si hay esos síntomas, sube 100-150 kcal. Si no, mantén y vigila una semana más.',
      ajusteKcal: 150
    });
  }
  if (bajada >= 0.4) {
    return Object.assign({}, base, {
      estado: '🟢 Ritmo adecuado', semaforo: 'verde', color: 'emerald', delta: delta,
      mensaje: 'Bajaste ' + bajada + ' kg de promedio esta semana. Ritmo verde (0,4-0,9 kg/semana): protege el músculo.',
      recomendacion: 'Mantener ' + kcal + ' kcal. No cambies nada.',
      ajusteKcal: 0
    });
  }
  if (bajada >= 0.3) {
    return Object.assign({}, base, {
      estado: '🟢 Ritmo sostenible', semaforo: 'verde', color: 'emerald', delta: delta,
      mensaje: 'Bajaste ' + bajada + ' kg de promedio esta semana. Un poco lento pero dentro de lo normal.',
      recomendacion: 'Mantener ' + kcal + ' kcal y observar la próxima semana.',
      ajusteKcal: 0
    });
  }
  // bajada < 0,3 kg
  if (bajadaPrev !== null && bajadaPrev < 0.3) {
    return Object.assign({}, base, {
      estado: '🟡 Estancado 2 semanas', semaforo: 'amarillo', color: 'amber', delta: delta,
      mensaje: 'Menos de 0,3 kg de baja durante 2 semanas seguidas (' + bajadaPrev + ' y ' + bajada + ' kg). Primero revisa: pan extra, picoteos, bebidas con calorías, porciones, entrenamientos y pasos.',
      recomendacion: 'Si realmente cumpliste el plan, reduce 100-150 kcal (meta de ' + (kcal - 150) + ' a ' + (kcal - 100) + ' kcal) o suma 2.000 pasos diarios.',
      ajusteKcal: -150
    });
  }
  return Object.assign({}, base, {
    estado: '⏳ Ritmo lento (1ª semana)', semaforo: 'azul', color: 'blue', delta: delta,
    mensaje: 'Esta semana bajaste ' + bajada + ' kg de promedio. Una sola semana lenta no obliga a cambiar nada: el peso sube y baja por agua y sal.',
    recomendacion: 'Mantener ' + kcal + ' kcal y revisar adherencia. Si la próxima semana sigue bajo 0,3 kg, ajustamos.',
    ajusteKcal: 0
  });
}


// ============================================================================
// ENVOLTORIOS PÚBLICOS: google.script.run no puede devolver objetos Date
// (el cliente recibiría null). Se convierten a texto yyyy-MM-dd.
// Las funciones *_ con guion bajo final son privadas y no se llaman desde el cliente.
// ============================================================================
function serializarCliente_(obj) {
  const tz = Session.getScriptTimeZone();
  return JSON.parse(JSON.stringify(obj, function (k, v) {
    const raw = this[k];
    if (raw instanceof Date) return Utilities.formatDate(raw, tz, 'yyyy-MM-dd');
    return v;
  }));
}

function apiGetDashboardData() {
  return serializarCliente_(apiGetDashboardData_());
}

function apiSaveRegistroDiario(payload) {
  return serializarCliente_(apiSaveRegistroDiario_(payload));
}

function apiGetAlimentos() {
  return serializarCliente_(apiGetAlimentos_());
}

function apiSaveComidaItem(payload) {
  return serializarCliente_(apiSaveComidaItem_(payload));
}

function apiDeleteComidaItem(idComidaItem) {
  return serializarCliente_(apiDeleteComidaItem_(idComidaItem));
}

function apiGetComidasDia(fecha) {
  return serializarCliente_(apiGetComidasDia_(fecha));
}

function apiSaveSerieEntrenamiento(payload) {
  return serializarCliente_(apiSaveSerieEntrenamiento_(payload));
}

function apiGetHistorialEjercicio(idEjercicio) {
  return serializarCliente_(apiGetHistorialEjercicio_(idEjercicio));
}

function apiSaveMedida(payload) {
  return serializarCliente_(apiSaveMedida_(payload));
}

function apiGetMedidas() {
  return serializarCliente_(apiGetMedidas_());
}

function apiSaveConfig(configMap) {
  return serializarCliente_(apiSaveConfig_(configMap));
}

/** Rutina de otro día (selector "Cambiar Día" de la pestaña Entreno). */
function apiGetRutinaDia(dia) {
  return serializarCliente_(getRutinaPorDia(SpreadsheetApp.getActiveSpreadsheet(), String(dia)));
}
