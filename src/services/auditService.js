import { addDoc, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { auditCollection, auditModel } from "../models/audit";

// Obtener información del navegador
const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
};

// Registrar evento de auditoría
export const logAuditEvent = async (eventData) => {
  try {
    const browserInfo = getBrowserInfo();
    
    const auditLog = {
      ...auditModel,
      ...eventData,
      timestamp: new Date(),
      userAgent: browserInfo.userAgent,
      platform: browserInfo.platform,
      language: browserInfo.language,
    };

    console.log("🔍 Intentando registrar evento de auditoría:", {
      userId: auditLog.userId,
      userName: auditLog.userName,
      userEmail: auditLog.userEmail,
      action: auditLog.action,
      authProvider: auditLog.authProvider,
      merged: auditLog.merged,
    });

    const docRef = await addDoc(auditCollection, auditLog);
    console.log("✅ Evento de auditoría registrado exitosamente:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error al registrar evento de auditoría:", error);
    console.error("❌ Datos que intentaban guardarse:", eventData);
    // No lanzar el error para no bloquear el login
    return null;
  }
};

// Obtener todos los logs de auditoría con filtros opcionales
export const getAuditLogs = async (filters = {}) => {
  try {
    // Query base: todos los logs ordenados por timestamp descendente
    let q = query(auditCollection, orderBy("timestamp", "desc"));

    // Aplicar límite si existe
    if (filters.limitResults) {
      q = query(auditCollection, orderBy("timestamp", "desc"), limit(filters.limitResults));
    }

    console.log("📊 Obteniendo logs de auditoría...");
    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`✅ Se obtuvieron ${logs.length} logs de auditoría`);

    // Aplicar filtros en memoria (más confiable que filtrar en Firestore)
    let filteredLogs = logs;

    if (filters.action && filters.action !== "all") {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.authProvider && filters.authProvider !== "all") {
      filteredLogs = filteredLogs.filter(log => log.authProvider === filters.authProvider);
    }

    if (filters.success !== undefined && filters.success !== "all") {
      const successValue = filters.success === "true" || filters.success === true;
      filteredLogs = filteredLogs.filter(log => log.success === successValue);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        return logDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        return logDate <= filters.endDate;
      });
    }

    return filteredLogs;
  } catch (error) {
    console.error("❌ Error al obtener logs de auditoría:", error);
    throw error;
  }
};

// Obtener logs por usuario específico
export const getAuditLogsByUser = async (userId) => {
  try {
    const q = query(
      auditCollection,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return logs;
  } catch (error) {
    console.error("❌ Error al obtener logs por usuario:", error);
    throw error;
  }
};

// Obtener estadísticas de auditoría
export const getAuditStats = async () => {
  try {
    const querySnapshot = await getDocs(auditCollection);
    const stats = {
      total: 0,
      byAction: {},
      byProvider: {},
      byUser: {},
      successRate: 0,
      successCount: 0,
      failureCount: 0,
      mergedAccounts: 0,
    };

    let successCount = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;

      // Contar por acción
      stats.byAction[data.action] = (stats.byAction[data.action] || 0) + 1;

      // Contar por proveedor
      stats.byProvider[data.authProvider] = (stats.byProvider[data.authProvider] || 0) + 1;

      // Contar por usuario
      if (data.userEmail) {
        stats.byUser[data.userEmail] = (stats.byUser[data.userEmail] || 0) + 1;
      }

      // Contar éxitos y fallos
      if (data.success) {
        successCount++;
        stats.successCount++;
      } else {
        stats.failureCount++;
      }

      // Contar cuentas consolidadas
      if (data.merged) {
        stats.mergedAccounts++;
      }
    });

    stats.successRate = stats.total > 0 ? ((successCount / stats.total) * 100).toFixed(2) : 0;

    console.log("📊 Estadísticas de auditoría:", stats);
    return stats;
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    throw error;
  }
};

// Obtener logs recientes (últimos N)
export const getRecentAuditLogs = async (limitCount = 50) => {
  try {
    const q = query(
      auditCollection,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return logs;
  } catch (error) {
    console.error("❌ Error al obtener logs recientes:", error);
    throw error;
  }
};

// Obtener actividad por rango de fechas
export const getAuditLogsByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      auditCollection,
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return logs;
  } catch (error) {
    console.error("❌ Error al obtener logs por rango de fechas:", error);
    // Si falla la query compuesta, obtener todos y filtrar en memoria
    return getAuditLogs({ startDate, endDate });
  }
};