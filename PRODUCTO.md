# Producto de invitaciones digitales

## Marca y contacto

- Marca: Evently.
- Web: a definir.
- WhatsApp comercial: +54 9 291 644-6200.
- Correo comercial y cuenta de Mercado Pago: pena_matias@hotmail.com.

## Propuesta

Una plataforma de autoservicio que permita pasar de nombre, fecha, lugar y estilo a una invitación publicable en menos de diez minutos. La promesa no es solamente diseño: incluye la operación del evento antes, durante y después.

La invitación de Clara continúa separada en `index.html`. La landing comercial se construye como `producto.html`, por lo que puede probarse y publicarse sin cambiar enlaces ya compartidos.

## Oferta inicial

| Plan | Precio de lanzamiento | Enfoque |
| --- | ---: | --- |
| Esencial | ARS 14.900 | Invitación animada, RSVP, mapa, cuenta regresiva y cambios ilimitados |
| Completa | ARS 24.900 | Panel, estadísticas, galería, música, regalos, playlist, QR y mesas |
| Única | ARS 39.900 | Dirección creativa, animación a medida, carga asistida y soporte |

Son precios por evento y no por invitado. Deben mantenerse en un único archivo/configuración y revisarse periódicamente por inflación. La referencia competitiva observada en septiembre de 2026 ubica ofertas argentinas alrededor de ARS 20.000–30.000, con variantes que comienzan en ARS 25.000. El plan Completa busca ofrecer más operación por un valor similar.

## Alta en minutos

1. Probar sin cuenta: tipo de evento, protagonista, fecha, lugar, estilo y módulos.
2. Ver una portada real en simultáneo.
3. Elegir plan y pagar.
4. Crear cuenta con Google o enlace mágico.
5. Crear automáticamente un evento con slug único y los datos del borrador.
6. Abrir un checklist de publicación: portada, fecha, ubicación, contacto, RSVP y privacidad.
7. Publicar y obtener enlace, QR y mensaje listo para WhatsApp.

Nunca se debe afirmar que el evento fue creado o cobrado antes de recibir confirmación del backend y del proveedor de pago.

## Arquitectura recomendada

El modelo actual sirve para un solo evento. Antes de habilitar ventas, moverlo a una estructura multi-evento:

```text
users/{uid}
events/{eventId}
events/{eventId}/settings/config
events/{eventId}/guests/{guestId}
events/{eventId}/songs/{songId}
events/{eventId}/guestbook/{messageId}
events/{eventId}/photos/{photoId}
events/{eventId}/analytics/{eventId}
events/{eventId}/audit/{auditId}
orders/{orderId}
```

Cada evento debe contener `ownerUid`, `adminUids`, `slug`, `plan`, `status`, `createdAt`, `publishedAt` y `expiresAt`. Las reglas autorizan por UID, no solo por email. La invitación pública lee únicamente configuración publicada y contenido aprobado. Confirmaciones y auditoría son privadas.

Para pagos, usar Mercado Pago Checkout Pro y validar el webhook en una Cloud Function o servicio equivalente. Solo el webhook aprobado activa `orders.status=paid` y crea el evento. No confiar en el regreso del navegador. Esto requiere facturación/backend y no debe simularse desde el frontend.

## Analítica y trazabilidad

Embudo mínimo, sin texto libre ni datos personales en eventos analíticos:

- `invitation_view`
- `invitation_open`
- `rsvp_start`
- `rsvp_complete`
- `rsvp_declined`
- `share_click`
- `map_click`
- `music_play`
- `checkin_complete`

Panel:

- visitantes únicos y aperturas;
- conversión apertura → RSVP;
- confirmados, rechazados y pendientes;
- adultos, menores y menús especiales;
- evolución por día;
- clics en mapa/WhatsApp;
- tasa de check-in y horario de llegadas;
- actividad administrativa y cambios publicados.

La colección `audit` debe registrar acción, recurso, UID administrativo y fecha; nunca contraseñas, tokens ni contenidos sensibles completos.

## SEO

- La landing comercial es indexable, tiene título, descripción, canonical, sitemap y datos estructurados `Product`.
- Las invitaciones privadas usan `noindex, nofollow`; no conviene posicionar nombres, direcciones o teléfonos de eventos privados.
- Al usar dominio propio, actualizar canonical, sitemap, Open Graph, Search Console y Analytics.
- Crear páginas indexables por intención: invitaciones de 15, casamiento, cumpleaños, baby shower y eventos empresariales; cada una con demos originales, preguntas frecuentes y contenido útil.
- Evitar páginas generadas masivamente con texto repetido.

## Accesibilidad y calidad

Objetivo: WCAG 2.2 AA.

- navegación completa por teclado y foco siempre visible;
- controles táctiles de al menos 44 px cuando sea posible;
- encabezados y landmarks semánticos;
- etiquetas y errores asociados a cada campo;
- contraste verificado por plantilla;
- `prefers-reduced-motion` para reducir animaciones;
- texto alternativo y subtítulos/transcripción para video relevante;
- no depender solo de color, audio o movimiento;
- pruebas a 320, 360, 390, 768 y 1440 px.

## Seguridad

- aplicar OWASP Top 10 2025 como lista de riesgos, especialmente control de acceso, mala configuración, cadena de suministro, inyección, fallos de autenticación y logging;
- reglas de Firestore versionadas y probadas en Emulator Suite;
- Firebase Authentication y App Check como controles complementarios;
- permisos multi-tenant por UID y denegación por defecto;
- validación de tipo, tamaño y campos tanto en cliente como backend;
- sanitización de CSV y contenido generado por invitados;
- CSP, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` y otros encabezados en un hosting que permita configurarlos;
- rate limiting/backend para RSVP, votos, fotos y formularios;
- dependencias con revisión automática y bloqueo de despliegue ante fallos críticos;
- minimización de datos, política de retención, exportación y eliminación por evento.

## Próximas decisiones comerciales necesarias

- dominio definitivo;
- credenciales de aplicación y webhook de Mercado Pago (nunca se publican en el frontend);
- vigencia de cada invitación y política de devolución;
- si los precios incluyen diseño asistido e impuestos;
- textos legales de privacidad, términos y tratamiento de datos de menores.
