import React, { useState, useEffect } from 'react';
import './AuditPage.css';
import { getAuditLogs, getAuditStats } from '../../services/auditService';
import { getUsers } from '../../services/userService';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    authProvider: 'all',
    success: 'all',
    dateRange: 'all',
    user: 'all',
  });

  useEffect(() => {
    fetchAuditData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, logs]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData, usersData] = await Promise.all([
        getAuditLogs(),
        getAuditStats(),
        getUsers()
      ]);
      setLogs(logsData);
      setFilteredLogs(logsData);
      setStats(statsData);
      setUsers(usersData);
      console.log(`📊 Datos cargados: ${logsData.length} logs, ${usersData.length} usuarios`);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      await Swal.fire({
        title: 'Error',
        text: 'Error al cargar los datos de auditoría.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        background: '#1F2937',
        color: '#FFFFFF',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.userName?.toLowerCase().includes(term) ||
        log.userEmail?.toLowerCase().includes(term) ||
        log.userId?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term)
      );
    }

    // Filtro por usuario
    if (filters.user !== 'all') {
      filtered = filtered.filter(log => log.userEmail === filters.user);
    }

    // Filtro por acción
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Filtro por proveedor
    if (filters.authProvider !== 'all') {
      filtered = filtered.filter(log => log.authProvider === filters.authProvider);
    }

    // Filtro por éxito/fallo
    if (filters.success !== 'all') {
      filtered = filtered.filter(log => 
        log.success === (filters.success === 'true')
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(log => {
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
          return logDate >= startDate;
        });
      }
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      action: 'all',
      authProvider: 'all',
      success: 'all',
      dateRange: 'all',
      user: 'all',
    });
  };

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

  const getActionBadge = (action) => {
    const badges = {
      login: { class: 'badge--info', text: 'Inicio de Sesión' },
      logout: { class: 'badge--warning', text: 'Cierre de Sesión' },
      register: { class: 'badge--success', text: 'Registro' },
      account_merge: { class: 'badge--primary', text: 'Consolidación' },
    };
    return badges[action] || { class: 'badge--muted', text: action };
  };

  const getProviderBadge = (provider) => {
    const badges = {
      password: { class: 'badge--primary', text: 'Email' },
      google: { class: 'badge--danger', text: 'Google' },
      github: { class: 'badge--dark', text: 'GitHub' },
      facebook: { class: 'badge--info', text: 'Facebook' },
    };
    return badges[provider] || { class: 'badge--muted', text: provider };
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay registros para exportar.',
        icon: 'warning',
        confirmButtonColor: '#3B82F6',
        background: '#1F2937',
        color: '#FFFFFF',
      });
      return;
    }

    const headers = ['Fecha', 'Usuario', 'Correo', 'Acción', 'Proveedor', 'Estado', 'Consolidado', 'Navegador'];
    const csvData = filteredLogs.map(log => [
      formatDate(log.timestamp),
      log.userName || 'N/A',
      log.userEmail || 'N/A',
      log.action,
      log.authProvider,
      log.success ? 'Éxito' : 'Fallo',
      log.merged ? 'Sí' : 'No',
      log.userAgent || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (filteredLogs.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay registros para exportar.',
        icon: 'warning',
        confirmButtonColor: '#3B82F6',
        background: '#1F2937',
        color: '#FFFFFF',
      });
      return;
    }

    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Formato horizontal para más espacio
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Título
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Auditoria de Usuarios', pageWidth / 2, 15, { align: 'center' });

      // Subtítulo
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const fechaActual = new Date().toLocaleDateString('es-ES');
      const horaActual = new Date().toLocaleTimeString('es-ES');
      doc.text(`Reporte generado el ${fechaActual} a las ${horaActual}`, pageWidth / 2, 22, { align: 'center' });

      // Información de filtros aplicados
      const activeFilters = [];
      if (filters.user !== 'all') activeFilters.push(`Usuario: ${filters.user}`);
      if (filters.action !== 'all') activeFilters.push(`Accion: ${filters.action}`);
      if (filters.authProvider !== 'all') activeFilters.push(`Proveedor: ${filters.authProvider}`);
      if (filters.success !== 'all') activeFilters.push(`Estado: ${filters.success === 'true' ? 'Exitosos' : 'Fallidos'}`);
      if (filters.dateRange !== 'all') activeFilters.push(`Periodo: ${filters.dateRange}`);
      
      let startY = 28;
      if (activeFilters.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filtros aplicados: ${activeFilters.join(', ')}`, 14, 28);
        startY = 32;
      }

      // Preparar datos para la tabla
      const tableData = filteredLogs.map(log => {
        const actionText = getActionBadge(log.action).text;
        const providerText = getProviderBadge(log.authProvider).text;
        return [
          formatDate(log.timestamp),
          log.userName || 'N/A',
          log.userEmail || 'N/A',
          actionText,
          providerText,
          log.success ? 'Exito' : 'Fallo',
          log.merged ? 'Si' : 'No'
        ];
      });

      // Generar tabla
      autoTable(doc, {
        startY: startY,
        head: [['Fecha', 'Usuario', 'Correo', 'Accion', 'Proveedor', 'Estado', 'Consolidado']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          doc.text(`Pagina ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });

      // Agregar resumen al final
      const finalY = doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : startY + 10;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total de registros: ${filteredLogs.length}`, 14, finalY + 10);
      
      // Estadísticas adicionales
      const successCount = filteredLogs.filter(log => log.success).length;
      const failCount = filteredLogs.length - successCount;
      const mergedCount = filteredLogs.filter(log => log.merged).length;
      
      doc.text(`Exitosos: ${successCount}  |  Fallidos: ${failCount}  |  Consolidados: ${mergedCount}`, 14, finalY + 16);

      // Guardar PDF
      const fileName = `auditoria_usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      Swal.fire({
        title: 'Exito',
        text: 'PDF exportado correctamente',
        icon: 'success',
        confirmButtonColor: '#3B82F6',
        background: '#1F2937',
        color: '#FFFFFF',
        timer: 2000
      });

    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al generar el PDF. Por favor, intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        background: '#1F2937',
        color: '#FFFFFF',
      });
    }
  };

  // Obtener usuarios únicos de los logs
  const getUniqueUsersFromLogs = () => {
    const uniqueUsers = new Map();
    logs.forEach(log => {
      if (log.userEmail && !uniqueUsers.has(log.userEmail)) {
        uniqueUsers.set(log.userEmail, log.userName || log.userEmail);
      }
    });
    return Array.from(uniqueUsers.entries()).map(([email, name]) => ({ email, name }));
  };

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div>
          <h2 className="audit-title">Auditoría de Seguridad</h2>
          <p className="audit-subtitle">Monitoreo de actividad de usuarios</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="audit-export-button" onClick={exportToCSV}>
            📊 Exportar CSV
          </button>
          <button className="audit-export-button" onClick={exportToPDF}>
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="audit-filters">
        <div className="audit-search-container">
          <input
            type="text"
            className="audit-search-input"
            placeholder="🔍 Buscar por usuario, correo, ID o acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="audit-filter-group">
          <select
            className="audit-select"
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
          >
            <option value="all">👥 Todos los Usuarios</option>
            {getUniqueUsersFromLogs().map((user, index) => (
              <option key={index} value={user.email}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <select
            className="audit-select"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="all">🎯 Todas las Acciones</option>
            <option value="login">🔐 Inicio de Sesión</option>
            <option value="logout">🚪 Cierre de Sesión</option>
            <option value="register">🆕 Registro</option>
            <option value="account_merge">🔗 Consolidación</option>
          </select>

          <select
            className="audit-select"
            value={filters.authProvider}
            onChange={(e) => handleFilterChange('authProvider', e.target.value)}
          >
            <option value="all">🔑 Todos los Proveedores</option>
            <option value="password">📧 Email</option>
            <option value="google">🔴 Google</option>
            <option value="github">⚫ GitHub</option>
            <option value="facebook">🔵 Facebook</option>
          </select>

          <select
            className="audit-select"
            value={filters.success}
            onChange={(e) => handleFilterChange('success', e.target.value)}
          >
            <option value="all">📈 Todos los Estados</option>
            <option value="true">✅ Exitosos</option>
            <option value="false">❌ Fallidos</option>
          </select>

          <select
            className="audit-select"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">📅 Todo el Tiempo</option>
            <option value="today">📆 Hoy</option>
            <option value="week">📊 Última Semana</option>
            <option value="month">📈 Último Mes</option>
          </select>

          <button className="audit-clear-button" onClick={clearFilters}>
            🔄 Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Logs */}
      {loading ? (
        <div className="audit-loading">
          <div className="audit-spinner"></div>
          <p>Cargando registros de auditoría...</p>
        </div>
      ) : (
        <div className="audit-table-container">
          {filteredLogs.length === 0 ? (
            <div className="audit-empty">
              <div className="audit-empty-icon">📭</div>
              <p>No se encontraron registros de auditoría.</p>
              {(searchTerm || filters.action !== 'all' || filters.authProvider !== 'all') && (
                <button className="audit-empty-button" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Acción</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actionBadge = getActionBadge(log.action);
                  const providerBadge = getProviderBadge(log.authProvider);

                  return (
                    <tr key={log.id} className={!log.success ? 'audit-row-error' : ''}>
                      <td className="audit-cell-date">{formatDate(log.timestamp)}</td>
                      <td className="audit-cell-user">
                        {log.userName || 'N/A'}
                        {log.merged && <span className="audit-merge-badge">🔗</span>}
                      </td>
                      <td className="audit-cell-email">{log.userEmail || 'N/A'}</td>
                      <td>
                        <span className={`badge ${actionBadge.class}`}>
                          {actionBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${providerBadge.class}`}>
                          {providerBadge.text}
                        </span>
                      </td>
                      <td>
                        {log.success ? (
                          <span className="badge badge--success">✓ Éxito</span>
                        ) : (
                          <span className="badge badge--danger">✗ Fallo</span>
                        )}
                      </td>
                      <td className="audit-cell-details">
                        <button
                          className="audit-details-button"
                          onClick={() => {
                            Swal.fire({
                              title: 'Detalles del Evento',
                              html: `
                                <div style="text-align: left; padding: 10px;">
                                  <p><strong>🆔 ID Usuario:</strong> ${log.userId || 'N/A'}</p>
                                  <p><strong>👤 Nombre:</strong> ${log.userName || 'N/A'}</p>
                                  <p><strong>📧 Email:</strong> ${log.userEmail || 'N/A'}</p>
                                  <p><strong>🎯 Acción:</strong> ${log.action}</p>
                                  <p><strong>🔑 Proveedor:</strong> ${log.authProvider}</p>
                                  <p><strong>💻 Plataforma:</strong> ${log.platform || 'N/A'}</p>
                                  <p><strong>🌐 Idioma:</strong> ${log.language || 'N/A'}</p>
                                  <p><strong>🖥️ Navegador:</strong> ${log.userAgent || 'N/A'}</p>
                                  ${log.merged ? `
                                    <hr style="margin: 15px 0; border-color: #4b5563;">
                                    <p><strong>🔗 Consolidación de Cuenta</strong></p>
                                    <p><strong>UID Principal:</strong> ${log.primaryUid || 'N/A'}</p>
                                    <p><strong>UID Alternativo:</strong> ${log.alternativeUid || 'N/A'}</p>
                                  ` : ''}
                                  ${!log.success ? `
                                    <hr style="margin: 15px 0; border-color: #4b5563;">
                                    <p><strong>❌ Error:</strong> ${log.errorMessage || 'N/A'}</p>
                                  ` : ''}
                                </div>
                              `,
                              confirmButtonColor: '#3B82F6',
                              background: '#1F2937',
                              color: '#FFFFFF',
                              width: '600px',
                            });
                          }}
                        >
                          Ver Más
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && filteredLogs.length > 0 && (
        <div className="audit-results-count">
          📊 Mostrando {filteredLogs.length} de {logs.length} registros
        </div>
      )}
    </div>
  );
}

export default AuditPage;