import React from 'react';

export function OrganizerHelp() {
  return <details className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-sm leading-relaxed">
    <summary className="cursor-pointer font-semibold text-white">¿Es tu primera vez? Guía rápida</summary>
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-zinc-300">
      <li><strong>Asistencia:</strong> consultá confirmaciones, menús y mesas; descargá una tabla para recepción.</li>
      <li><strong>Publicaciones:</strong> revisá canciones, firmas y fotos. Se muestran al publicarse; desde ahí podés ocultarlas o eliminarlas.</li>
      <li><strong>Invitación:</strong> cambiá textos, fecha, lugar o diseño. Usá Vista previa y después Guardar cambios.</li>
      <li><strong>Accesos:</strong> agregá solo cuentas de Google de personas que deban administrar el evento.</li>
    </ol>
    <p className="mt-4 text-zinc-400">Para el trabajo diario no necesitás entrar a Firebase ni a Google Drive. Los cambios de la invitación se guardan al pulsar «Guardar cambios»; las acciones sobre invitados y publicaciones se aplican al realizarlas.</p>
  </details>;
}
