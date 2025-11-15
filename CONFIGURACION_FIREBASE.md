# Configuración de Firebase para Vinculación de Cuentas

## ⚠️ IMPORTANTE: Configuración requerida en Firebase Console

Para que la vinculación de cuentas funcione correctamente, debes configurar Firebase Console:

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **proyectoaos-2025**

### Paso 2: Configurar Autenticación
1. En el menú lateral, ve a **Authentication** (Autenticación)
2. Click en la pestaña **Settings** (Configuración)
3. En la sección **User account management** (Gestión de cuentas de usuario):
   - **DESACTIVA** la opción "Prevent creation of multiple accounts with the same email address"
   - **O** si prefieres mantenerla activa, asegúrate de que esté configurada para permitir vinculación automática

### Paso 3: Habilitar Proveedores
Asegúrate de que los siguientes proveedores estén habilitados en la pestaña **Sign-in method**:

1. **Google**
   - Estado: Habilitado ✅
   - Email del proyecto de asistencia: [tu-email]

2. **GitHub**
   - Estado: Habilitado ✅
   - Client ID y Client Secret configurados

3. **Email/Password**
   - Estado: Habilitado ✅

4. **Facebook** (opcional)
   - Estado: Habilitado si lo usas
   - App ID y App Secret configurados

### Paso 4: Configurar Dominios Autorizados
En **Authentication > Settings > Authorized domains**:
- Agrega todos los dominios desde los que permitirás login
- localhost debe estar en la lista para desarrollo

## Cómo Funciona la Vinculación

### Escenario 1: Usuario se registra con Google
1. Usuario inicia sesión con Google (email: usuario@example.com)
2. Se crea cuenta con UID de Google
3. Usuario intenta iniciar sesión con GitHub usando el mismo email
4. Sistema detecta que el email ya existe
5. Muestra mensaje: "Este correo ya está registrado con: Google"
6. Usuario debe iniciar sesión con Google primero
7. Una vez autenticado, puede vincular GitHub desde su perfil

### Escenario 2: Vinculación Manual
1. Usuario ya está autenticado
2. En su perfil, puede usar `linkProviderToAccount('github')`
3. Se abre popup de GitHub
4. Usuario autoriza
5. Las cuentas se vinculan
6. Ahora puede usar cualquiera de los dos métodos para iniciar sesión

## Flujo de Vinculación Implementado

```
Usuario intenta login con GitHub
    ↓
¿Email ya existe?
    ↓ SÍ
Sistema guarda credencial pendiente
    ↓
Muestra mensaje: "Inicia sesión con Google primero"
    ↓
Usuario inicia sesión con Google/método original
    ↓
Sistema vincula automáticamente la credencial pendiente
    ↓
✅ Ahora puede usar ambos métodos
```

## Funciones Disponibles

### En userService.js:

1. **loginWithGoogle()** - Login con Google + manejo de vinculación
2. **loginWithGithub()** - Login con GitHub + manejo de vinculación
3. **loginWithFacebook()** - Login con Facebook + manejo de vinculación
4. **completeLinkWithCredential(credential)** - Completa vinculación pendiente
5. **linkProviderToAccount(providerName)** - Vinculación manual desde perfil

## Ejemplo de Uso en Código

```javascript
// Login con detección automática de vinculación
const result = await loginWithGoogle();

if (result.needsLinking) {
  // Guardar info de vinculación
  setLinkingInfo(result);
  // Mostrar mensaje al usuario
  alert(result.message);
  // Usuario debe iniciar sesión con método original
} else {
  // Login exitoso
  navigate('/dashboard');
}
```

## Testing

### Probar Vinculación:
1. Registrarse con Google usando email: test@gmail.com
2. Cerrar sesión
3. Intentar iniciar sesión con GitHub usando el mismo email: test@gmail.com
4. Verás mensaje de vinculación
5. Inicia sesión con Google
6. Sistema vinculará automáticamente GitHub
7. Cierra sesión e inicia con cualquiera de los dos métodos ✅

## Seguridad

- ✅ Firebase verifica la propiedad del email
- ✅ Usuario debe autenticarse con método original primero
- ✅ No se pueden vincular cuentas de correos diferentes
- ✅ Credenciales se validan antes de vincular
- ✅ Se registra en Firestore qué proveedores usa cada usuario

## Estructura en Firestore

```
users/
  {uid}/
    name: "Usuario"
    correo: "test@gmail.com"
    providers: ["google", "github"]  // Array de proveedores vinculados
    photoURL: "..."
    createdAt: timestamp
    lastLoginAt: timestamp
```

## Solución de Problemas

### Error: "account-exists-with-different-credential"
- ✅ Esto es ESPERADO y se maneja automáticamente
- El sistema mostrará mensaje de vinculación
- Usuario debe iniciar sesión con método original

### Error: "credential-already-in-use"
- La credencial ya está vinculada a otra cuenta
- Verifica que no haya cuentas duplicadas en Firestore

### Error: "invalid-credential"
- La credencial ha expirado
- Usuario debe intentar el proceso nuevamente

## Próximos Pasos

Para mejorar la experiencia:
1. Agregar página de perfil donde usuario vea sus proveedores vinculados
2. Permitir desvincular proveedores (excepto el último)
3. Mostrar iconos de proveedores vinculados en el perfil
4. Enviar email de confirmación cuando se vincule nueva cuenta
