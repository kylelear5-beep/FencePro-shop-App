import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Sidebar
    sidebar_dashboard: 'DASHBOARD',
    sidebar_sop_library: 'SOP LIBRARY',
    sidebar_inventory: 'INVENTORY',
    sidebar_shop_tools: 'SHOP TOOLS',
    sidebar_ask_bob: 'ASK BOB',
    sidebar_yard_crew: 'YARD CREW',
    sidebar_sos_inventory: 'SOS INVENTORY',
    sidebar_fence360: 'FENCE 360',

    // Topbar
    topbar_temp: 'TEMP',
    topbar_mph: 'MPH',
    topbar_fence_pro: 'FENCE-PRO',

    // Section Titles
    section_command: 'COMMAND',
    section_library: 'LIBRARY',
    section_logistics: 'LOGISTICS',
    section_tools: 'TOOLS',
    section_consultation: 'CONSULTATION',
    section_digital_clipboard: 'DIGITAL CLIPBOARD',
    section_schedule: 'SCHEDULE',

    // Dashboard
    dash_good_afternoon: 'GOOD AFTERNOON',
    dash_tagline: 'ESTABLISHED STANDARDS. SUPERIOR RESULTS.',
    dash_session_info: 'FENCE-PRO CONSOLE // SESSION ACTIVE',
    dash_quality_compliant: 'QUALITY COMPLIANT',
    dash_yrs_veteran_tech: 'YRS VETERAN TECH',
    dash_big_bob_status: 'BIG BOB STATUS',
    dash_synced_docs: 'SYNCED DOCS',
    dash_direct_commands: 'DIRECT COMMANDS',
    dash_chat_with_bob: 'CHAT WITH BOB',
    dash_browse_library: 'BROWSE LIBRARY',
    dash_yard_crew: 'YARD CREW',
    dash_material_calc: 'MATERIAL CALC',
    dash_shop_calendar: 'SHOP CALENDAR',
    dash_fence_360_crm: 'FENCE 360 CRM',
    dash_ready: 'READY',
    dash_offline: 'OFFLINE',

    // Assistant
    asst_intro: "Listen up! 👋 I'm Big Bob. I run this shop and make sure we build 'em right and build 'em safe. What do you need?",
    asst_shop_boss: 'THE SHOP BOSS',
    asst_big_bob: 'Big Bob',
    asst_voice_active: 'VOICE ACTIVE',
    asst_quick_tasks: 'QUICK TASKS',
    asst_truck_loading: 'TRUCK LOADING',
    asst_staging_codes: 'STAGING CODES',
    asst_ppe_reqs: 'PPE REQS',
    asst_veteran_consultation: 'VETERAN CONSULTATION',
    asst_mute_bob: 'MUTE BOB',
    asst_type_command: 'Type command here...',
    asst_system_error: 'System error. Recalibrate and try again.',
    asst_connection_failed: 'No handshake with Superior Core. Connection failed.',
    asst_prompt_loading: 'Show morning loading sequence.',
    asst_prompt_staging: 'What is the vinyl staging color code?',
    asst_prompt_ppe: 'What PPE is needed for routing?',

    // Yard Crew
    yard_digital_clipboard: 'YARD CREW DIGITAL CLIPBOARD',
    yard_supervisor: 'Yard Supervisor',

    // Documents
    doc_document_library: 'DOCUMENT LIBRARY',
    doc_upload_doc: 'UPLOAD DOC',
    doc_filter_sops: 'Filter Superior SOPs...',
    doc_sop_reference: 'SOP REFERENCE',
    doc_ask_bob: 'ASK BOB',
    doc_explain_prompt: 'Explain the {name} to me like I\'m new here.',
    doc_upload_new: 'UPLOAD NEW DOCUMENT',
    doc_document_name: 'DOCUMENT NAME',
    doc_category: 'CATEGORY',
    doc_file: 'FILE',
    doc_cancel: 'CANCEL',
    doc_uploading: 'UPLOADING...',
    doc_upload: 'UPLOAD',
    doc_name_placeholder: 'e.g. New Safety Protocol',
    doc_cat_sop: 'Standard Operating Procedures',
    doc_cat_training: 'Training & Onboarding',
    doc_cat_cmm: 'CMM Documents',
    doc_cat_reference: 'Reference',

    // Tools
    tools_shop_tools: 'SHOP TOOLS',

    // BlindCountBoard
    bcb_loading: 'Loading count sheet...',
    bcb_error: '⚠ Error',
    bcb_retry: 'Retry',
    bcb_section_complete: 'Section Complete',
    bcb_email_sent: '📧 Variance report emailed to management',
    bcb_email_label: '⚠ Email:',
    bcb_counted_items: '✓ Counted — {count} items',
    bcb_counted: 'Counted:',
    bcb_not_counted: '⊘ Not Counted — {count} items',
    bcb_skipped: 'SKIPPED',
    bcb_variance_report: '📋 Variance report generated. Review flagged items with management.',
    bcb_new_count: 'New Count',
    bcb_count: 'Count',
    bcb_no_count_today: 'No Count Today',
    bcb_bobs_orders: "Big Bob's Orders • Week {week}",
    bcb_counter: 'Counter:',
    bcb_total: 'Total',
    bcb_today: 'Today',
    bcb_items: 'items',
    bcb_start: 'START',
    bcb_hide_week: '▾ Hide Week Schedule',
    bcb_show_week: '▸ Show Full Week',
    bcb_items_filled: '{filled}/{total} items filled in',
    bcb_add_item: '+ ADD ITEM',
    bcb_add_item_msg: '📦 Add Item to "{category}" — syncs to management',
    bcb_sku: 'SKU *',
    bcb_description: 'Description *',
    bcb_qty_on_hand: 'Qty on hand',
    bcb_saving: 'Saving...',
    bcb_save_item: 'Save Item',
    bcb_cancel_add: 'Cancel',
    bcb_instructions: 'Enter counts for each item below, then press',
    bcb_instructions_btn: '"Submit All & Email Report"',
    bcb_instructions_end: 'at the bottom. One submit for the whole section.',
    bcb_no_items: 'No items in this category',
    bcb_failed: '⚠ Failed',
    bcb_back_sections: '← Back to all sections',
    bcb_submitting: '⏳ Submitting...',
    bcb_submit_all: '✓ Submit All {count} Items & Email Report',
    bcb_submit_partial: 'Submit {filled}/{total} Items & Email Report',
    bcb_enter_counts: 'Enter counts above',
    bcb_items_no_count: '{count} items have no count entered.',
    bcb_not_counted_note: 'They will be logged as "Not Counted" in the report. You can still submit just the items you\'ve counted.',
    bcb_enter_at_least: 'Enter at least one count before submitting.',
    bcb_submit_error: 'Something went wrong during submission. Check the console.',
    bcb_good: 'GOOD',

    // InventoryManager
    inv_management: 'INVENTORY MANAGEMENT',
    inv_count: 'Count',
    inv_add_sku: 'Add SKU',
    inv_remove_sku: 'Remove SKU',
    inv_skipped: 'Skipped',
    inv_calculator: 'Calculator',
    inv_add_new_material: 'Add New Material',
    inv_sku_number: 'SKU Number',
    inv_section_category: 'Section / Category',
    inv_item_description: 'Item Description / Name',
    inv_on_hand_qty: 'Current On-Hand Qty (Optional)',
    inv_save_new: 'Save New Item',
    inv_processing: 'Processing...',
    inv_remove_material: 'Remove Material from Inventory',
    inv_skus: 'SKUs',
    inv_search_placeholder: 'Search SKU or name to find item…',
    inv_loading: 'Loading...',
    inv_removing: 'Removing…',
    inv_remove: '× Remove',
    inv_no_match: 'No items match your search',
    inv_items_not_counted: 'Items Not Counted',
    inv_total: 'Total',
    inv_nothing_skipped: 'Nothing skipped!',
    inv_skipped_by: 'Skipped By:',
    inv_confirm_remove: 'Remove "{name}" ({sku}) from inventory?\nThis also removes it from the shop count sheet.',
    inv_could_not_remove: 'Could not remove:',
    inv_sku_placeholder: 'e.g. POST-VINYL-5X5',
    inv_cat_placeholder: 'e.g. Vinyl Hardware',
    inv_name_placeholder: 'e.g. 5x5x108 .150W POST White',

    // ChainLinkCalc
    calc_title: 'CHAIN LINK MATERIAL CALCULATOR',
    calc_project_specs: 'PROJECT SPECS',
    calc_total_footage: 'TOTAL LINEAR FOOTAGE',
    calc_height: 'HEIGHT (FT)',
    calc_post_spacing: 'POST SPACING (FT)',
    calc_ends_corners: 'ENDS / CORNERS',
    calc_gates: 'GATES (SING/DBL)',
    calc_bom: 'BOM ESTIMATE',
    calc_rolls: "50' ROLLS",
    calc_line_posts: 'LINE POSTS',
    calc_terminal_posts: 'TERMINAL POSTS',
    calc_top_rails: "21' TOP RAILS",
    calc_fittings: 'FITTINGS LIST',
    calc_tension_bands: 'Tension Bands',
    calc_brace_bands: 'Brace Bands',
    calc_post_caps: 'Post Caps',
    calc_rail_ends: 'Rail Ends',
    calc_loop_caps: 'Loop Caps',
    calc_tie_wires: 'Tie Wires (6")',

    // WeightCalculator
    wc_title: 'Screw & Hardware Counter',
    wc_sample_size: 'Sample Size',
    wc_sample_weight: 'Sample Weight (lbs)',
    wc_total_weight: 'Enter Total Scale Weight (lbs)',
    wc_total_pieces: 'Total Piece Count',
    wc_pieces: 'Pieces',
    wc_hint: 'Weigh a small sample of screws first...',
    wc_tip: 'For high accuracy on small screws, use a sample of 100 pieces.',

    // WeatherWidget
    wx_title: 'LOCAL CONDITIONS // HUDSON VALLEY',
    wx_feels_like: 'Feels like',
    wx_station_active: 'STATION ACTIVE',
    wx_low: 'Low:',
    wx_rain: 'Rain:',
    wx_forecast: '3-DAY FORECAST',
    wx_syncing: 'Syncing Satellite...',
    wx_days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // SimpleCalculator
    sc_title: 'Standard',

    // Language Toggle
    lang_label: 'EN',
  },

  es: {
    // Sidebar
    sidebar_dashboard: 'PANEL',
    sidebar_sop_library: 'BIBLIOTECA POE',
    sidebar_inventory: 'INVENTARIO',
    sidebar_shop_tools: 'HERRAMIENTAS',
    sidebar_ask_bob: 'PREGÚNTALE A BOB',
    sidebar_yard_crew: 'EQUIPO DE PATIO',
    sidebar_sos_inventory: 'SOS INVENTARIO',
    sidebar_fence360: 'FENCE 360',

    // Topbar
    topbar_temp: 'TEMP',
    topbar_mph: 'MPH',
    topbar_fence_pro: 'FENCE-PRO',

    // Section Titles
    section_command: 'MANDO',
    section_library: 'BIBLIOTECA',
    section_logistics: 'LOGÍSTICA',
    section_tools: 'HERRAMIENTAS',
    section_consultation: 'CONSULTA',
    section_digital_clipboard: 'PORTAPAPELES DIGITAL',
    section_schedule: 'HORARIO',

    // Dashboard
    dash_good_afternoon: 'BUENAS TARDES',
    dash_tagline: 'ESTÁNDARES ESTABLECIDOS. RESULTADOS SUPERIORES.',
    dash_session_info: 'CONSOLA FENCE-PRO // SESIÓN ACTIVA',
    dash_quality_compliant: 'CALIDAD CONFORME',
    dash_yrs_veteran_tech: 'AÑOS TÉC. VETERANO',
    dash_big_bob_status: 'ESTADO DE BIG BOB',
    dash_synced_docs: 'DOCS SINCRONIZADOS',
    dash_direct_commands: 'COMANDOS DIRECTOS',
    dash_chat_with_bob: 'CHATEAR CON BOB',
    dash_browse_library: 'VER BIBLIOTECA',
    dash_yard_crew: 'EQUIPO DE PATIO',
    dash_material_calc: 'CALC. MATERIALES',
    dash_shop_calendar: 'CALENDARIO DEL TALLER',
    dash_fence_360_crm: 'FENCE 360 CRM',
    dash_ready: 'LISTO',
    dash_offline: 'FUERA DE LÍNEA',

    // Assistant
    asst_intro: "¡Escúchame! 👋 Soy Big Bob. Yo dirijo este taller y me aseguro de que construyamos bien y con seguridad. ¿Qué necesitas?",
    asst_shop_boss: 'EL JEFE DEL TALLER',
    asst_big_bob: 'Big Bob',
    asst_voice_active: 'VOZ ACTIVA',
    asst_quick_tasks: 'TAREAS RÁPIDAS',
    asst_truck_loading: 'CARGA DE CAMIÓN',
    asst_staging_codes: 'CÓDIGOS DE ÁREA',
    asst_ppe_reqs: 'EQUIPO DE PROTECCIÓN',
    asst_veteran_consultation: 'CONSULTA DEL VETERANO',
    asst_mute_bob: 'SILENCIAR A BOB',
    asst_type_command: 'Escribe tu comando aquí...',
    asst_system_error: 'Error del sistema. Recalibrar e intentar de nuevo.',
    asst_connection_failed: 'Sin conexión con Superior Core. Conexión fallida.',
    asst_prompt_loading: 'Muéstrame la secuencia de carga matutina.',
    asst_prompt_staging: '¿Cuál es el código de color de la zona de vinilo?',
    asst_prompt_ppe: '¿Qué equipo de protección se necesita para el fresado?',

    // Yard Crew
    yard_digital_clipboard: 'PORTAPAPELES DIGITAL DEL EQUIPO DE PATIO',
    yard_supervisor: 'Supervisor de Patio',

    // Documents
    doc_document_library: 'BIBLIOTECA DE DOCUMENTOS',
    doc_upload_doc: 'SUBIR DOC',
    doc_filter_sops: 'Filtrar POEs de Superior...',
    doc_sop_reference: 'REFERENCIA POE',
    doc_ask_bob: 'PREGÚNTALE A BOB',
    doc_explain_prompt: 'Explícame {name} como si fuera nuevo aquí.',
    doc_upload_new: 'SUBIR NUEVO DOCUMENTO',
    doc_document_name: 'NOMBRE DEL DOCUMENTO',
    doc_category: 'CATEGORÍA',
    doc_file: 'ARCHIVO',
    doc_cancel: 'CANCELAR',
    doc_uploading: 'SUBIENDO...',
    doc_upload: 'SUBIR',
    doc_name_placeholder: 'ej. Nuevo Protocolo de Seguridad',
    doc_cat_sop: 'Procedimientos Operativos Estándar',
    doc_cat_training: 'Capacitación e Incorporación',
    doc_cat_cmm: 'Documentos CMM',
    doc_cat_reference: 'Referencia',

    // Tools
    tools_shop_tools: 'HERRAMIENTAS DEL TALLER',

    // BlindCountBoard
    bcb_loading: 'Cargando hoja de conteo...',
    bcb_error: '⚠ Error',
    bcb_retry: 'Reintentar',
    bcb_section_complete: 'Sección Completa',
    bcb_email_sent: '📧 Informe de varianzas enviado a la gerencia',
    bcb_email_label: '⚠ Correo:',
    bcb_counted_items: '✓ Contados — {count} artículos',
    bcb_counted: 'Contados:',
    bcb_not_counted: '⊘ No Contados — {count} artículos',
    bcb_skipped: 'OMITIDO',
    bcb_variance_report: '📋 Informe de varianzas generado. Revisar artículos señalados con la gerencia.',
    bcb_new_count: 'Nuevo Conteo',
    bcb_count: 'Conteo',
    bcb_no_count_today: 'Sin Conteo Hoy',
    bcb_bobs_orders: "Órdenes de Big Bob • Semana {week}",
    bcb_counter: 'Contador:',
    bcb_total: 'Total',
    bcb_today: 'Hoy',
    bcb_items: 'artículos',
    bcb_start: 'INICIAR',
    bcb_hide_week: '▾ Ocultar Horario Semanal',
    bcb_show_week: '▸ Mostrar Semana Completa',
    bcb_items_filled: '{filled}/{total} artículos llenados',
    bcb_add_item: '+ AGREGAR ARTÍCULO',
    bcb_add_item_msg: '📦 Agregar artículo a "{category}" — se sincroniza con la gerencia',
    bcb_sku: 'SKU *',
    bcb_description: 'Descripción *',
    bcb_qty_on_hand: 'Cant. en existencia',
    bcb_saving: 'Guardando...',
    bcb_save_item: 'Guardar Artículo',
    bcb_cancel_add: 'Cancelar',
    bcb_instructions: 'Ingrese los conteos para cada artículo abajo, luego presione',
    bcb_instructions_btn: '"Enviar Todo e Informe por Correo"',
    bcb_instructions_end: 'en la parte inferior. Un solo envío para toda la sección.',
    bcb_no_items: 'No hay artículos en esta categoría',
    bcb_failed: '⚠ Falló',
    bcb_back_sections: '← Volver a todas las secciones',
    bcb_submitting: '⏳ Enviando...',
    bcb_submit_all: '✓ Enviar los {count} Artículos e Informe por Correo',
    bcb_submit_partial: 'Enviar {filled}/{total} Artículos e Informe por Correo',
    bcb_enter_counts: 'Ingrese conteos arriba',
    bcb_items_no_count: '{count} artículos no tienen conteo.',
    bcb_not_counted_note: 'Se registrarán como "No Contados" en el informe. Aún puede enviar solo los artículos que contó.',
    bcb_enter_at_least: 'Ingrese al menos un conteo antes de enviar.',
    bcb_submit_error: 'Algo salió mal durante el envío. Revisa la consola.',
    bcb_good: 'BIEN',

    // InventoryManager
    inv_management: 'GESTIÓN DE INVENTARIO',
    inv_count: 'Conteo',
    inv_add_sku: 'Agregar SKU',
    inv_remove_sku: 'Eliminar SKU',
    inv_skipped: 'Omitidos',
    inv_calculator: 'Calculadora',
    inv_add_new_material: 'Agregar Nuevo Material',
    inv_sku_number: 'Número de SKU',
    inv_section_category: 'Sección / Categoría',
    inv_item_description: 'Descripción del Artículo / Nombre',
    inv_on_hand_qty: 'Cant. Actual en Existencia (Opcional)',
    inv_save_new: 'Guardar Nuevo Artículo',
    inv_processing: 'Procesando...',
    inv_remove_material: 'Eliminar Material del Inventario',
    inv_skus: 'SKUs',
    inv_search_placeholder: 'Buscar SKU o nombre del artículo…',
    inv_loading: 'Cargando...',
    inv_removing: 'Eliminando…',
    inv_remove: '× Eliminar',
    inv_no_match: 'No se encontraron artículos',
    inv_items_not_counted: 'Artículos No Contados',
    inv_total: 'Total',
    inv_nothing_skipped: '¡Nada omitido!',
    inv_skipped_by: 'Omitido por:',
    inv_confirm_remove: '¿Eliminar "{name}" ({sku}) del inventario?\nEsto también lo elimina de la hoja de conteo del taller.',
    inv_could_not_remove: 'No se pudo eliminar:',
    inv_sku_placeholder: 'ej. POST-VINILO-5X5',
    inv_cat_placeholder: 'ej. Hardware de Vinilo',
    inv_name_placeholder: 'ej. 5x5x108 .150W POSTE Blanco',

    // ChainLinkCalc
    calc_title: 'CALCULADORA DE MATERIALES DE ESLABÓN',
    calc_project_specs: 'ESPECIFICACIONES DEL PROYECTO',
    calc_total_footage: 'METRAJE LINEAL TOTAL',
    calc_height: 'ALTURA (PIES)',
    calc_post_spacing: 'ESPACIADO DE POSTES (PIES)',
    calc_ends_corners: 'EXTREMOS / ESQUINAS',
    calc_gates: 'PORTONES (IND/DOBLE)',
    calc_bom: 'ESTIMACIÓN DE MATERIALES',
    calc_rolls: "ROLLOS DE 50'",
    calc_line_posts: 'POSTES DE LÍNEA',
    calc_terminal_posts: 'POSTES TERMINALES',
    calc_top_rails: "RIELES SUP. DE 21'",
    calc_fittings: 'LISTA DE ACCESORIOS',
    calc_tension_bands: 'Bandas de Tensión',
    calc_brace_bands: 'Bandas de Refuerzo',
    calc_post_caps: 'Tapas de Poste',
    calc_rail_ends: 'Extremos de Riel',
    calc_loop_caps: 'Tapas de Anillo',
    calc_tie_wires: 'Alambres de Amarre (6")',

    // WeightCalculator
    wc_title: 'Contador de Tornillos y Herrajes',
    wc_sample_size: 'Tamaño de Muestra',
    wc_sample_weight: 'Peso de Muestra (lbs)',
    wc_total_weight: 'Ingrese Peso Total de la Báscula (lbs)',
    wc_total_pieces: 'Conteo Total de Piezas',
    wc_pieces: 'Piezas',
    wc_hint: 'Pese primero una muestra pequeña de tornillos...',
    wc_tip: 'Para mayor precisión con tornillos pequeños, use una muestra de 100 piezas.',

    // WeatherWidget
    wx_title: 'CONDICIONES LOCALES // VALLE DE HUDSON',
    wx_feels_like: 'Sensación de',
    wx_station_active: 'ESTACIÓN ACTIVA',
    wx_low: 'Mín:',
    wx_rain: 'Lluvia:',
    wx_forecast: 'PRONÓSTICO DE 3 DÍAS',
    wx_syncing: 'Sincronizando Satélite...',
    wx_days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],

    // SimpleCalculator
    sc_title: 'Estándar',

    // Language Toggle
    lang_label: 'ES',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key, replacements = {}) => {
    let text = translations[lang]?.[key] || translations.en[key] || key;
    // Replace {token} placeholders
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'es' : 'en');

  return (
    <I18nContext.Provider value={{ t, lang, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export default translations;
