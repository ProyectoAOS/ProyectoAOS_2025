# 🔧 Solución al Error de Vinculación de Cuentas

## ❌ Problema Original

Cuando intentabas iniciar sesión con GitHub después de haber usado Google con el mismo correo, obtenías:

```
FirebaseError: Error (auth/account-exists-with-different-credential)
Error al manejar vinculación: Error: No se encontraron cuentas con este correo
```

## ✅ Solución Implementada

### Cambio Principal: Consolidación Automática

Ahora, cuando detectamos que un usuario intenta iniciar sesión con un proveedor diferente pero usando el mismo email, **automáticamente consolidamos las cuentas en Firestore**.

### Cómo Funciona Ahora

#### Escenario 1: Primera vez con Google
```
Usuario: Inicia con Google (test@gmail.com)
Sistema: ✅ Crea cuenta con UID de Google
Firestore: {
  uid: "google_uid_123",
  correo: "test@gmail.com",
  providers: ["google"]
}
```

#### Escenario 2: Luego intenta con GitHub (mismo email)
```
Usuario: Inicia con GitHub (test@gmail.com)
Sistema: 🔍 Detecta que existe usuario con ese email
Sistema: 🔗 Consolida automáticamente las cuentas
Firestore Principal: {
  uid: "google_uid_123",  // UID original se mantiene
  correo: "test@gmail.com",
  providers: ["google", "github"],  // ✅ Se agrega GitHub
  alternativeUIDs: {
    github: "github_uid_456"  // Se guarda el UID de GitHub
  }
}

Firestore Secundario: {
  uid: "github_uid_456",
  primaryUid: "google_uid_123",  // Apunta al principal
  correo: "test@gmail.com",
  providers: ["google", "github"]
}
```

#### Resultado
✅ El usuario puede iniciar sesión con **Google O GitHub**
✅ Ambos métodos acceden a la **misma cuenta**
✅ Los datos se **sincronizan automáticamente**

## 🔨 Cambios en el Código

### 1. `createOrUpdateUser()` Mejorado

**Antes:**
- Solo creaba/actualizaba el usuario con su UID

**Ahora:**
- Verifica si existe otro usuario con el mismo email
- Consolida automáticamente si encuentra coincidencia
- Mantiene registro de UIDs alternativos
- Sincroniza proveedores entre ambas cuentas

```javascript
// Verificar si existe otro usuario con el mismo email (diferente UID)
const usersRef = collection(db, "users");
const q = query(usersRef, where("correo", "==", user.email));
const querySnapshot = await getDocs(q);

if (!querySnapshot.empty) {
  // Consolidar con cuenta existente
  // ...
}
```

### 2. `handleAccountLinking()` Mejorado

**Antes:**
- Usaba `fetchSignInMethodsForEmail()` que está deprecated
- Fallaba con "No se encontraron cuentas"

**Ahora:**
- Busca directamente en Firestore
- Tiene fallback a Firebase Auth si es necesario
- Proporciona información detallada del usuario existente

```javascript
// Buscar usuario existente por correo en Firestore
const usersRef = collection(db, "users");
const q = query(usersRef, where("correo", "==", email));
const querySnapshot = await getDocs(q);
```

### 3. Mensajes Informativos

Se agregaron logs para indicar cuando las cuentas se consolidan:

```javascript
if (userData.merged) {
  console.log("✅ Cuenta consolidada exitosamente con usuario existente");
}
```

## 📊 Estructura de Datos

### Cuenta Principal (Google UID)
```javascript
{
  id: "google_uid_123",
  uid: "google_uid_123",
  name: "Juan Pérez",
  correo: "juan@gmail.com",
  providers: ["google", "github", "facebook"],
  alternativeUIDs: {
    github: "github_uid_456",
    facebook: "facebook_uid_789"
  },
  photoURL: "https://...",
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### Cuenta Secundaria (GitHub UID)
```javascript
{
  id: "github_uid_456",
  uid: "github_uid_456",
  primaryUid: "google_uid_123",  // ← Apunta al principal
  name: "Juan Pérez",
  correo: "juan@gmail.com",
  providers: ["google", "github"],
  photoURL: "https://...",
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

## 🧪 Cómo Probar

### Test 1: Consolidación Automática
1. **Limpia Firestore** (borra el usuario de prueba si existe)
2. **Inicia con Google** usando test@gmail.com
   - ✅ Debería crear cuenta nueva
3. **Cierra sesión**
4. **Inicia con GitHub** usando test@gmail.com
   - ✅ Debería consolidar automáticamente
   - ✅ En consola verás: "Cuenta consolidada exitosamente"
5. **Verifica Firestore**
   - Deberías ver dos documentos con el mismo email
   - Uno con `primaryUid` apuntando al otro
6. **Cierra sesión y prueba ambos**
   - ✅ Google funciona
   - ✅ GitHub funciona
   - ✅ Ambos acceden a los mismos datos

### Test 2: Verificar Providers
```javascript
// En la consola del navegador
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.providers);
// Debería mostrar: ["google", "github"]
```

## 🔐 Configuración de Firebase

**IMPORTANTE:** Asegúrate de tener configurado en Firebase Console:

1. Ve a Authentication > Settings
2. En "User account management":
   - **DESACTIVA** "Prevent creation of multiple accounts with same email"
   - O asegúrate que permita vinculación

## ⚠️ Casos Edge

### Si el error persiste:

1. **Limpiar caché de Firebase:**
```javascript
// En la consola del navegador
localStorage.clear();
sessionStorage.clear();
// Recargar página
```

2. **Verificar que GitHub esté configurado:**
   - Firebase Console > Authentication > Sign-in method
   - GitHub debe estar habilitado
   - Client ID y Secret deben estar configurados

3. **Verificar dominio autorizado:**
   - Firebase Console > Authentication > Settings > Authorized domains
   - `localhost` debe estar en la lista

## 🎯 Beneficios de esta Solución

✅ **Automática:** No requiere pasos manuales del usuario
✅ **Transparente:** El usuario ni siquiera nota la consolidación
✅ **Robusta:** Maneja múltiples escenarios y proveedores
✅ **Escalable:** Soporta agregar más proveedores fácilmente
✅ **Segura:** Mantiene la integridad de los datos
✅ **Flexible:** Guarda referencias cruzadas entre cuentas

## 🚀 Próximos Pasos Opcionales

### 1. Mostrar Toast de Éxito
```jsx
// En login.jsx, agregar un toast
if (result.merged) {
  toast.success("¡Cuenta vinculada exitosamente!");
}
```

### 2. Panel de Proveedores Vinculados
Usar el componente `AccountLinking.jsx` para mostrar todos los proveedores:

```jsx
import AccountLinking from './components/AccountLinking/AccountLinking';

// En tu página de perfil
<AccountLinking />
```

### 3. Migrar Datos Adicionales
Si tienes datos específicos en otros documentos (pedidos, favoritos, etc.), considera consolidarlos también:

```javascript
// Ejemplo: Migrar pedidos
const ordersRef = collection(db, "orders");
const oldOrders = query(ordersRef, where("userId", "==", oldUid));
// Actualizar a primaryUid...
```

## 📞 Soporte

Si el error persiste:
1. Verifica la consola del navegador (F12)
2. Revisa que Firebase Console esté configurado
3. Asegúrate que los proveedores estén habilitados
4. Verifica que el email sea el mismo en ambos proveedores

## ✨ Resumen

El sistema ahora:
- ✅ Detecta automáticamente emails duplicados
- ✅ Consolida cuentas en Firestore
- ✅ Permite login con cualquier proveedor vinculado
- ✅ Mantiene sincronizados los datos
- ✅ Proporciona mejor experiencia de usuario

**¡Ya no deberías ver ese error!** 🎉
