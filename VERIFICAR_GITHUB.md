# 🔧 Verificar Vinculación de GitHub

## Pasos para asegurar que GitHub se vincule correctamente:

### 1. Verifica que GitHub tenga email público

1. Ve a https://github.com/settings/emails
2. Asegúrate de que tu email esté **verificado**
3. Desmarca "Keep my email addresses private" si está marcado
4. O usa el email de GitHub que se muestra (`...@users.noreply.github.com`)

### 2. Verifica en Firebase Console

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto: **proyectoaos-2025**
3. Authentication > Users
4. Deberías ver tu usuario con los proveedores vinculados

### 3. Verifica en Firestore

1. En Firebase Console
2. Firestore Database
3. Colección `users`
4. Busca tu documento
5. Campo `providers` debe mostrar: `["google", "github"]`

### 4. Para probar la vinculación:

**Opción A: Con logs de consola (recomendado)**

1. Abre tu aplicación
2. Abre la consola del navegador (F12 > Console)
3. Inicia sesión con Google primero
4. Observa los logs en consola
5. Cierra sesión
6. Inicia sesión con GitHub
7. Observa los logs - deberías ver:
   ```
   🔍 Buscando usuario existente con email: tu@email.com
   📊 Usuarios encontrados con este email: 1
   ✅ Usuario existente encontrado: {...}
   ➕ Agregando proveedor github a la cuenta existente
   ✅ Documento principal actualizado
   ✅ Documento secundario creado
   ✅ Cuenta consolidada exitosamente con usuario existente
   ```

**Opción B: Verificación manual**

1. Inicia sesión con Google
2. Anota tu email
3. Cierra sesión
4. Inicia sesión con GitHub
5. Verifica en Firebase Console > Authentication
6. Deberías ver dos usuarios con el mismo email (normal)
7. Verifica en Firestore > users
8. Deberías ver dos documentos:
   - Uno principal (Google UID) con `providers: ["google", "github"]`
   - Uno secundario (GitHub UID) con `primaryUid` apuntando al principal

### 5. Emails de GitHub

GitHub puede proporcionar diferentes emails:
- Email principal verificado: `tu@gmail.com`
- Email privado: `12345+username@users.noreply.github.com`

**Para que funcione la vinculación:**
- Ambos proveedores (Google y GitHub) deben usar EL MISMO email
- Si GitHub usa el email privado, no se vinculará con Google

**Solución:**
1. Ve a https://github.com/settings/emails
2. Desmarca "Keep my email addresses private"
3. Asegúrate que el email principal sea el mismo que usas en Google

### 6. Si sigue sin funcionar:

Ejecuta este código en la consola del navegador después de iniciar con GitHub:

```javascript
// Ver datos del usuario de Firebase
const user = firebase.auth().currentUser;
console.log("GitHub User:", {
  uid: user.uid,
  email: user.email,
  emailVerified: user.emailVerified,
  providerData: user.providerData
});

// Ver datos en Firestore
const userData = JSON.parse(localStorage.getItem('user'));
console.log("User Data:", userData);
```

### 7. Reiniciar prueba limpia:

```javascript
// En consola del navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Luego:
1. Inicia con Google
2. Verifica en Firestore que se creó el usuario
3. Cierra sesión
4. Inicia con GitHub (MISMO email)
5. Verifica que se agregó "github" a providers

### 8. Verificar configuración de Firebase

En Firebase Console > Authentication > Settings:
- "Prevent creation of multiple accounts with same email" debe estar **DESACTIVADO**

### 9. Logs esperados en consola:

Cuando GitHub se vincule correctamente, verás:

```
GitHub User Info: {
  email: "tu@gmail.com",
  emailVerified: false,
  displayName: "Tu Nombre",
  uid: "github_uid_123",
  providerData: [...]
}

🔍 Buscando usuario existente con email: tu@gmail.com
📊 Usuarios encontrados con este email: 1
✅ Usuario existente encontrado: {
  existingUid: "google_uid_abc",
  currentUid: "github_uid_123",
  existingProviders: ["google"],
  newProvider: "GitHub"
}
➕ Agregando proveedor github a la cuenta existente
✅ Documento principal actualizado
✅ Documento secundario creado (github_uid_123 → google_uid_abc)
✅ Cuenta consolidada exitosamente con usuario existente
```

### 10. Problemas comunes:

❌ **"GitHub no proporcionó un email"**
- Solución: Hacer email público en GitHub

❌ **Emails diferentes**
- Google: usuario@gmail.com
- GitHub: 12345+usuario@users.noreply.github.com
- Solución: Usar mismo email en ambos

❌ **Usuario no encontrado**
- Verifica que primero hayas iniciado con Google
- Verifica que el email sea exactamente el mismo

❌ **No aparece en providers array**
- Verifica logs de consola
- Revisa Firestore directamente
- Intenta limpiar caché y reintentar

---

## ✅ Checklist rápido:

- [ ] Email de GitHub es público y verificado
- [ ] Mismo email en Google y GitHub
- [ ] Firebase Console: "Prevent multiple accounts" desactivado
- [ ] GitHub OAuth configurado en Firebase Console
- [ ] Primero iniciar con Google, luego con GitHub
- [ ] Revisar logs en consola del navegador
- [ ] Verificar en Firestore que providers tenga ["google", "github"]
