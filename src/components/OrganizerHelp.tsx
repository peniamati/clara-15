import React from 'react';

export function OrganizerHelp() {
  return <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-sm leading-relaxed">
    <h3 className="mb-3 text-xl font-semibold">Cómo administrar tu evento</h3>
    <ol className="list-decimal space-y-2 pl-5">
      <li><strong>Personalizar:</strong> modificá textos, lugar, música y apariencia. Guardar cambios publica lo que editaste; Vista previa permite revisarlo.</li>
      <li><strong>Confirmaciones:</strong> buscá a cada persona, filtrá quienes confirmaron o no asistirán y consultá teléfono, menú y contacto del tutor.</li>
      <li><strong>Moderación:</strong> aprobá canciones, firmas y fotos antes de mostrarlas en la invitación.</li>
      <li><strong>Exportar:</strong> descargá la lista en CSV para abrirla con Excel y compartirla con recepción o catering.</li>
      <li><strong>Administradores:</strong> agregá únicamente las cuentas de las personas que gestionan el evento.</li>
    </ol>
    <h4 className="mb-2 mt-5 font-semibold">Dónde quedan los datos</h4>
    <p>Las respuestas se guardan en Firebase, colección guests. La configuración está en settings/config; canciones, firmas y fotos están en songs, guestbook y photobooth. Los archivos de fotos se guardan en Firebase Storage. Las cápsulas están en capsules y sólo las consulta la organización.</p>
    <p className="mt-2">No necesitás entrar a Firebase para el trabajo diario. Usá esta pantalla con tu cuenta de Google autorizada. El correo es un dato de contacto: no se envían emails automáticos. Los enlaces de regalos abren el proveedor de pago y no acreditan transferencias automáticamente.</p>
  </section>;
}
