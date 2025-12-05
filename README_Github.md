# Autenticación con GitHub

## Configuración Requerida

### 1. Configuración en GitHub

1. Ir a **GitHub Settings** → **Developer settings** → **OAuth Apps**
2. Haz clic en **New OAuth App**
3. Completar la configuración:
   - **Application name:** `ProyectoAOS-2025`
   - **Homepage URL:** `https://proyectoaos-2025.web.app/`
   - **Authorization callback URL:** `https://proyectoaos-2025.firebaseapp.com/__/auth/handler`
4. Guarda el **Client ID** y **Client Secret**

### 2. Configuración en Firebase

1. Ir a la consola de Firebase
2. Se selecciona el proyecto (`ProyectoAOS-2025`)
3. Vamos a **Authentication** → **Sign-in method**
4. Habilitamos el proveedor **GitHub**
5. Se ingresa el **Client ID** y **Client Secret** obtenidos de GitHub

---

## Implementación en Código

### Servicio de Autenticación (userService.js)

```javascript
export const loginWithGithub = async () => {
  try {
    githubProvider.setCustomParameters({
      prompt: 'select_account',
      allow_signup: 'true'
    });

    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    if (!user.email) {
      throw new Error("GitHub no proporcionó un email.");
    }

    const userData = await createOrUpdateUser(user, "GitHub");
    await addLoginRecord(user.uid);

    return userData;
    
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else {
      throw new Error(error.message || "Error al iniciar sesión con GitHub");
    }
  }
};
```

### Función de Consolidación de Usuarios

```javascript
const createOrUpdateUser = async (user, providerName) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  const userData = {
    name: user.displayName,
    correo: user.email,
    photoURL: user.photoURL || "",
    uid: user.uid,
    lastLoginAt: new Date(),
  };

  if (userDoc.exists()) {
    // Actualizar usuario existente
    const existingData = userDoc.data();
    const providers = existingData.providers || [];
    const providerLower = providerName.toLowerCase();
    
    if (!providers.includes(providerLower)) {
      providers.push(providerLower);
    }

    await updateDoc(userDocRef, {
      providers: providers,
      lastLoginAt: new Date(),
    });

    return {
      id: user.uid,
      name: existingData.name,
      correo: existingData.correo,
      providers: providers,
    };
  } else {
    // Verificar si existe usuario con mismo email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("correo", "==", user.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Consolidar con usuario existente
      const existingUserDoc = querySnapshot.docs[0];
      const existingUserData = existingUserDoc.data();
      const existingUid = existingUserDoc.id;
      
      const providers = existingUserData.providers || [];
      const providerLower = providerName.toLowerCase();
      
      if (!providers.includes(providerLower)) {
        providers.push(providerLower);
      }
      
      await updateDoc(doc(db, "users", existingUid), {
        providers: providers,
        lastLoginAt: new Date(),
      });
      
      return {
        id: existingUid,
        name: existingUserData.name,
        correo: existingUserData.correo,
        providers: providers,
        merged: true,
      };
    }
    
    // Crear nuevo usuario
    const newUserData = {
      ...userData,
      providers: [providerName.toLowerCase()],
      createdAt: new Date(),
    };

    await setDoc(userDocRef, newUserData);
    return { id: user.uid, ...newUserData };
  }
};
```

### Componente React (loginPage)

```javascript
const handleGithubLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const userData = await loginWithGithub();
    
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData.merged) {
      console.log("Cuenta de GitHub vinculada con cuenta existente");
    }

    navigate("/dashboard");
  } catch (err) {
    setError(err.message || "Error al iniciar sesión con GitHub");
    setLoading(false);
  }
};
```

---

## Flujo de Autenticación

1. Usuario hace clic en botón GitHub
2. Se abre popup de autenticación de GitHub
3. Usuario autoriza la aplicación
4. Firebase maneja el token de acceso
5. Sistema verifica/crea usuario en Firestore
6. Si existe usuario con mismo email, consolida las cuentas
7. Usuario redirigido al dashboard

---

## Estructura de Datos

```javascript
{
  id: "uid_del_usuario",
  name: "Nombre de GitHub",
  correo: "email@github.com",
  providers: ["github"],
  photoURL: "avatar_url",
  createdAt: "fecha_creacion",
  lastLoginAt: "ultimo_acceso",
  merged: true // Solo si se consolidó
}
```

---

## Notas Importantes

- La autenticación con GitHub permite a los usuarios iniciar sesión usando sus credenciales de GitHub
- El sistema consolida automáticamente cuentas cuando detecta usuarios existentes con el mismo email
- Es importante que los usuarios tengan un email público en su perfil de GitHub
- Los proveedores se almacenan en un array para permitir múltiples métodos de autenticación por usuario
