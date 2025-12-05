# 📊 Exportación de Datos de Auditoría

## Descripción

El sistema de auditoría incluye funcionalidades para exportar los registros de auditoría en dos formatos diferentes: **CSV** y **PDF**. Estas opciones permiten a los administradores generar reportes y analizar la actividad de los usuarios fuera de la aplicación.

## 🎯 Características

### Exportación a CSV
- ✅ Formato de texto plano compatible con Excel y hojas de cálculo
- ✅ Incluye todos los campos de auditoría
- ✅ Codificación UTF-8 con BOM para caracteres especiales
- ✅ Datos separados por comas con comillas de protección

### Exportación a PDF
- ✅ Formato profesional con diseño estructurado
- ✅ Orientación horizontal para mejor visualización
- ✅ Tabla con columnas organizadas y estilos aplicados
- ✅ Paginación automática con numeración
- ✅ Encabezado con información del reporte
- ✅ Fecha de generación y total de registros

## 📦 Dependencias

Las siguientes librerías son necesarias para las exportaciones:

```json
{
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.3"
}
```

Para instalarlas:

```bash
npm install jspdf jspdf-autotable
```

## 🚀 Uso

### Desde la Interfaz de Usuario

1. Navega a la página de **Auditoría de Seguridad**
2. Aplica los filtros deseados (opcional):
   - 👥 Filtrar por usuario
   - 🎯 Filtrar por acción (login, logout, registro, consolidación)
   - 🔑 Filtrar por proveedor (Email, Google, GitHub, Facebook)
   - 📈 Filtrar por estado (exitoso/fallido)
   - 📅 Filtrar por rango de fechas
3. Haz clic en uno de los botones de exportación:
   - **📊 Exportar CSV** - Genera archivo CSV
   - **📄 Exportar PDF** - Genera archivo PDF

### Datos Exportados

Ambos formatos incluyen la siguiente información:

| Campo | Descripción |
|-------|-------------|
| **Fecha** | Fecha y hora del evento (formato: dd/mmm/yyyy, hh:mm:ss) |
| **Usuario** | Nombre del usuario que realizó la acción |
| **Correo** | Email del usuario |
| **Acción** | Tipo de acción (Inicio de Sesión, Cierre de Sesión, Registro, Consolidación) |
| **Proveedor** | Método de autenticación (Email, Google, GitHub, Facebook) |
| **Estado** | Resultado de la acción (Éxito/Fallo) |
| **Consolidado** | Indica si la cuenta fue consolidada (Sí/No) |

**Nota:** La exportación CSV incluye adicionalmente el campo **Navegador** con el User Agent completo.

## 💻 Implementación Técnica

### Exportación CSV

```javascript
const exportToCSV = () => {
  // Valida que existan datos
  if (filteredLogs.length === 0) {
    // Muestra alerta
    return;
  }

  // Prepara encabezados y datos
  const headers = ['Fecha', 'Usuario', 'Correo', 'Acción', 'Proveedor', 'Estado', 'Consolidado', 'Navegador'];
  const csvData = filteredLogs.map(log => [/* datos mapeados */]);

  // Genera contenido CSV
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Crea Blob y descarga
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
```

### Exportación PDF

```javascript
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportToPDF = () => {
  // Valida que existan datos
  if (filteredLogs.length === 0) {
    // Muestra alerta
    return;
  }

  try {
    // Crea documento en orientación horizontal
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Agrega título y metadata
    doc.setFontSize(18);
    doc.text('Reporte de Auditoría de Seguridad', 14, 20);

    // Genera tabla con autoTable
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 40,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      }
      // ... más configuraciones
    });

    // Descarga el archivo
    doc.save(`auditoria_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    // Manejo de errores
  }
};
```

## 📋 Funciones Auxiliares

### `formatDate(timestamp)`
Formatea las fechas de Firebase Timestamp a formato legible en español.

```javascript
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
```

### `getActionBadge(action)`
Traduce las acciones del sistema a texto legible.

### `getProviderBadge(provider)`
Traduce los proveedores de autenticación a texto legible.

## 🎨 Características del PDF

### Diseño del Documento
- **Formato:** A4 Horizontal (297mm x 210mm)
- **Márgenes:** 14mm (superior, derecha, izquierda), 20mm (inferior)
- **Fuente del título:** 18pt
- **Fuente del contenido:** 8pt

### Tabla
- **Tema:** Striped (filas alternadas)
- **Colores:**
  - Encabezado: Azul (#3B82F6)
  - Filas pares: Blanco
  - Filas impares: Gris claro (#F5F7FA)

### Paginación
- Numeración automática en el pie de página
- Formato: "Página X de Y"
- Color: Gris (#969696)

## ⚠️ Validaciones

Ambas funciones de exportación incluyen las siguientes validaciones:

1. **Validación de datos vacíos:**
   ```javascript
   if (filteredLogs.length === 0) {
     Swal.fire({
       title: 'Sin datos',
       text: 'No hay registros para exportar.',
       icon: 'warning'
     });
     return;
   }
   ```

2. **Manejo de errores (PDF):**
   - Bloque try-catch para capturar errores de generación
   - Mensaje de error amigable al usuario
   - Console.log para debugging

## 📁 Nombres de Archivos

Los archivos generados siguen la siguiente nomenclatura:

```
auditoria_YYYY-MM-DD.csv
auditoria_YYYY-MM-DD.pdf
```

Ejemplo: `auditoria_2025-11-29.csv`

## 🔍 Filtros y Exportación

Las exportaciones respetan los filtros aplicados en la interfaz:

- Si hay filtros activos, se exportan **solo los registros filtrados**
- Si no hay filtros, se exportan **todos los registros** de la base de datos
- El contador muestra: "Mostrando X de Y registros"

## 🎯 Casos de Uso

### 1. Auditoría Completa
Exportar todos los registros sin filtros para análisis histórico completo.

### 2. Análisis de Usuario Específico
Filtrar por usuario y exportar para revisión de actividad individual.

### 3. Reporte de Intentos Fallidos
Filtrar por estado "Fallidos" para identificar posibles problemas de seguridad.

### 4. Análisis Temporal
Filtrar por rango de fechas (hoy, última semana, último mes) para reportes periódicos.

### 5. Auditoría por Proveedor
Exportar actividad específica de cada método de autenticación.

## 🛠️ Troubleshooting

### Error: "doc.autoTable is not a function"
**Solución:** Asegúrate de importar correctamente jspdf-autotable:

```javascript
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Usar: autoTable(doc, {...})
// NO: doc.autoTable({...})
```

### El CSV no muestra caracteres especiales
**Solución:** El BOM UTF-8 (`\uFEFF`) debe estar al inicio del contenido:

```javascript
const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
```

### El PDF está en blanco
**Solución:** Verifica que `filteredLogs` contenga datos y que `formatDate()`, `getActionBadge()` y `getProviderBadge()` funcionen correctamente.

## 📝 Notas Adicionales

- Los archivos se descargan automáticamente en la carpeta de Descargas del navegador
- No se requiere configuración adicional en el servidor
- Las exportaciones son procesadas completamente en el cliente
- No hay límite de registros para la exportación
- Los PDFs con muchos registros se paginarán automáticamente

## 🔐 Consideraciones de Seguridad

- Solo usuarios autenticados pueden acceder a la página de auditoría
- Los datos exportados contienen información sensible (emails, actividad de usuarios)
- Se recomienda proteger los archivos exportados adecuadamente
- No se recomienda compartir estos archivos sin autorización

## 📚 Referencias

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF-AutoTable Documentation](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [MDN - Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [MDN - URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
