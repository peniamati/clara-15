# Puesta en marcha y guía del organizador

## Estado de esta revisión

La compilación y TypeScript pasan. Esta rama no acredita todavía una puesta en producción: falta desplegar y probar las reglas contra el proyecto real, activar Authentication anónimo y ejecutar una prueba con una cuenta de invitado y una de organizador. No se han borrado ni migrado datos de Firebase.

## Uso diario

- Entrar al sitio con `#organizador` al final de la dirección, o pulsar Organizador.
- Iniciar sesión con una cuenta de Google incluida en Administradores.
- Confirmaciones muestra personas, estado, teléfono, email, edad, menú, tutor y mensaje. Permite buscar, filtrar, asignar mesa y registrar el ingreso.
- Exportar descarga CSV compatible con Excel. Contiene datos personales: compartir sólo con quienes organizan el evento.
- Personalizar permite editar textos, imágenes por URL, música, historia, galería, cronograma, regalos, mesas y trivia. Guardar cambios espera confirmación de la base de datos. Las encuestas tienen su propio botón Publicar.
- Moderación permite aprobar u ocultar canciones, firmas y fotos. Las cápsulas son privadas para la organización; su apertura futura es manual.

## Dónde quedan los datos

| Datos | Servicio y ubicación |
| --- | --- |
| Textos, apariencia, historia, galería, cronograma, mesas, regalos, trivia | Firestore: settings/config |
| Confirmaciones, contacto, menú, tutor, mesa, ingreso | Firestore: guests |
| Canciones | Firestore: songs |
| Firmas | Firestore: guestbook |
| Cápsulas privadas | Firestore: capsules |
| Fotos comprimidas y moderación | Firestore: photobooth |
| Encuestas y votos | Firestore: polls y subcolecciones votes |
| Métricas anónimas de interacción | Firestore: analytics |

Los datos anteriores que sólo estaban en localStorage no se importan automáticamente: cada dispositivo tenía su propia copia, mezclada con ejemplos. Los registros reales existentes en Firestore se conservan. Las historias, galerías y mesas de ejemplo dejan de aparecer: hay que cargar el contenido real desde el editor.

## Configuración externa necesaria

1. Abrir el proyecto Firebase que corresponde a VITE_FIREBASE_PROJECT_ID. Verificar todos los valores contra los secrets del repositorio, sin compartir claves ni credenciales en el chat.
2. Authentication → Sign-in method: Google para organizadores y Anonymous para invitados. Verificar el dominio peniamati.github.io en Authorized domains.
3. Crear/verificar Firestore y su identificador. La aplicación usa VITE_FIREBASE_DATABASE_ID o (default).
4. En settings/config, comprobar adminEmails (minúsculas) antes de publicar reglas: debe contener la cuenta de quien administra. No quitar la última cuenta. La configuración inicial, si falta, debe guardarla una de las dos cuentas de arranque presentes en firestore.rules.
5. Las fotos se comprimen en el navegador y se guardan en Firestore para mantener el proyecto en el plan gratuito. No hace falta activar Storage.
6. Autenticar Firebase CLI con una cuenta que tenga permisos del proyecto. Revisar y publicar firestore.rules para el proyecto/base correctos. firebase.json apunta a la base predeterminada; si se usa una base con nombre, ajustar esa selección antes de desplegar.
7. Probar primero las reglas en emulador/staging. El workflow de GitHub Pages publica sólo la web: NO publica las reglas ni activa servicios Firebase.

## Prueba obligatoria antes del lanzamiento

- Invitado sin cuenta Google: enviar confirmación con y sin email; comprobar que son dos personas distintas y que no aparece éxito si falla el guardado.
- Organizador en otro dispositivo: ver esa respuesta, filtrar, exportar, asignar mesa, registrar ingreso y volver a cargar.
- Visitante: comprobar que no puede listar guests, leer cápsulas, cambiar settings/config ni aprobar contenido.
- Enviar canción/firma/foto, verificar que no aparecen públicamente hasta aprobarlas. Verificar persistencia al recargar y en otro dispositivo.
- Votar y recargar; un mismo usuario anónimo no debe repetir su voto. Borrar datos del navegador crea otra identidad: para protección adicional contra abuso hace falta App Check/controles de servidor.
- Probar foto JPEG/PNG/WebP, su compresión, moderación y descarga. Se rechazan originales mayores a 12 MB.
- Probar navegación, edición, guardar y vista previa a 360 px, 390 px y escritorio; verificar que no hay scroll de la invitación detrás del panel.
- Revisar los datos reales del evento, fotos autorizadas, horario, mapas, enlaces bancarios y canciones de YouTube que permitan reproducción integrada.

## Límites y trabajo pendiente de validación

- No hay correo automático: el email se guarda como contacto. Los enlaces de WhatsApp abren el compositor del dispositivo.
- Los regalos abren proveedores externos; los importes se actualizan manualmente, sin conciliación de pagos.
- El ingreso permite introducir/buscar un código QR; no incluye lector de cámara.
- Trivia y memotest son juegos locales. Las encuestas tienen votos compartidos. El sorteo depende del listado de asistentes disponible para la organización.
- Aún deben validarse reglas con emulador, permisos reales, subida de fotos y pruebas visuales autenticadas. La revisión de dependencias informó vulnerabilidades y debe resolverse antes de declarar producción cerrada.
# Sincronización de Spotify

El workflow de Pages consulta Spotify una vez por día, a las 06:17 de Argentina. Las ejecuciones por cambios en `main` siguen publicando el sitio. La playlist incrustada de Spotify muestra sus propios cambios sin esperar a GitHub Pages.

Para que el listado y los votos de la web se actualicen para todos al entrar una visita, la función `refreshSpotifyOnVisit` guarda la playlist en `spotifySync/current` de Firestore. La web escucha ese documento en tiempo real. Las visitas simultáneas comparten una única actualización y el servidor no consulta Spotify más de una vez cada 15 minutos. Requiere Cloud Functions for Firebase (plan Blaze); no se envían credenciales de Spotify al navegador.

1. En el proyecto Firebase `foton-8d1e5`, habilitar Cloud Functions y tener disponible el CLI con acceso de despliegue.
2. Guardar `SPOTIFY_CLIENT_ID` y `SPOTIFY_REFRESH_TOKEN` como secretos de Functions (`firebase functions:secrets:set SPOTIFY_CLIENT_ID` y `firebase functions:secrets:set SPOTIFY_REFRESH_TOKEN`). Usar los mismos valores que ya utiliza GitHub Actions, sin copiarlos al repositorio.
3. Si `VITE_FIREBASE_DATABASE_ID` no es `(default)`, configurar `SPOTIFY_FIRESTORE_DATABASE_ID` con ese mismo identificador. Desde `functions`, instalar con `npm ci`. Desde la raíz, desplegar las reglas y la función: `firebase deploy --only firestore:rules,functions:refreshSpotifyOnVisit --project foton-8d1e5`.
4. Crear la variable de repositorio `VITE_SPOTIFY_LIVE_SYNC=true` en GitHub Actions y ejecutar el workflow una vez para publicar el cliente. Hasta completar estos pasos, la web usa la sincronización diaria.

## Fotos del álbum dentro del muro

El Muro de Fotos de la Noche muestra las fotos del álbum público de Google Fotos junto a los recuerdos publicados desde la web. `scripts/sync-event-album.mjs` lee el enlace de la configuración pública y genera `src/data/eventAlbumPhotos.json`. La ejecución diaria existente actualiza tanto Spotify como el álbum y solo despliega si cambió alguno de ellos. No se crean ejecuciones adicionales por visita.

Google Fotos no ofrece una galería incrustada mediante el enlace compartido: el importador lee los datos de su página pública sin ejecutar código remoto. Si esa página cambia de formato o no está disponible, se conserva la última importación válida. Un álbum privado no puede importarse con este método. Las fotos del álbum se gestionan en Google Fotos; no se duplican como documentos de Firestore ni se les muestran controles de likes que requieran esos documentos.
