# 🎒 Recogidas Escolares — Calendario Colaborativo Semanal (iOS HIG)

Aplicación web colaborativa diseñada siguiendo al detalle las **Apple Human Interface Guidelines (HIG)** para coordinar y organizar los turnos de recogida de los niños entre familiares, amigos y cuidadores.

Permite visualizar la semana, apuntarse con un solo toque en las casillas disponibles, ver quién está asignado a cada turno en tiempo real y compartir resúmenes organizados directamente por WhatsApp.

---

## ✨ Características Principales

* 🍎 **Diseño iOS Nativo (Apple HIG):**
  * Tipografía y jerarquía basada en *SF Pro*.
  * Acabados translúcidos con desenfoque de fondo (*frosted glass* / `backdrop-blur`).
  * Controles segmentados estilo píldora de iOS con animación táctil.
  * *Bottom Sheet* modal emergente con tirador gestual para apuntarse o editar turnos.
  * Paleta de colores oficiales de Apple (System Blue, Green, Orange, Purple, Red).
  * Soporte completo para Modo Claro y Modo Oscuro (*Dark Mode*).
  * Sensación háptica táctil en dispositivos móviles mediante la API de vibración.
  * Adaptable a pantallas completas con soporte de *Safe Area* (notch / Dynamic Island e indicador inferior de inicio).

* 📅 **Gestión Semanal de Recogidas:**
  * **Franjas Horarias por defecto:**
    * **Mediodía (14:00):** Salida de comedor / fin de jornada matutina.
    * **Tarde (16:30):** Salida habitual de la tarde / extraescolares.
  * **Franjas 100% configurables:** Añade o edita cualquier hueco horario desde el panel de Ajustes (ej. *Madrugadores 08:00*, *Natación 17:30*).
  * **Vistas flexibles:**
    1. **Semana Completa:** Matriz visual interactiva de Lunes a Viernes.
    2. **Día a Día:** Vista de agenda por jornadas con selector rápido.
    3. **Resumen y Cobertura:** Porcentaje de la semana cubierto, lista de turnos aún huérfanos y desglose de quién ha cubierto cuántas recogidas.

* 👥 **Colaboración Rápida y Ágil:**
  * **Sin contraseñas complicadas:** Acceso directo con enlace. Basta con pulsar la casilla, escribir o seleccionar tu nombre y confirmar.
  * **Perfiles rápidos:** Atajos de un toque para *Papá*, *Mamá*, *Abuelos*, *Tíos* con avatares (🚗, 🎒, 👵, 👨, 👩) y colores distintivos.
  * **Notas contextuales:** Posibilidad de indicar si se lleva en coche, si se recogen más niños o avisar de pequeños retrasos.
  * **Liberación de turnos:** Si a alguien le surge un imprevisto, puede liberar el hueco para que otro familiar se asigne.

* 📲 **Integración con WhatsApp:**
  * Generador de mensaje de WhatsApp con formato listo para compartir en el grupo familiar o escolar con el enlace directo para que los demás se apunten.

* ⚡ **Sincronización en Tiempo Real con Supabase:**
  * Funciona en **modo offline/local inmediato** si no hay claves configuradas.
  * Conexión con **Supabase Realtime**: Cuando un familiar se asigna a una casilla en su móvil, todos los demás teléfonos u ordenadores conectados ven el cambio al instante.

---

## 🚀 Inicio Rápido en Local

Para probar o desarrollar la aplicación en tu ordenador:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador (o en el Safari de tu iPhone con la IP local).

---

## 🌐 Cómo Alojar en Vercel (Recomendado)

1. Sube este repositorio a tu cuenta de GitHub.
2. Entra en [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New Project"** e importa el repositorio de GitHub.
4. Vercel detectará la configuración automáticamente (`vite`).
5. (Opcional) Si quieres sincronización en la nube desde el despliegue, añade en *Environment Variables*:
   * `VITE_SUPABASE_URL`: Tu URL de proyecto Supabase.
   * `VITE_SUPABASE_ANON_KEY`: Tu Anon Public Key de Supabase.
6. Pulsa en **Deploy**. ¡En menos de 1 minuto tendrás una URL pública para compartir!

---

## 🐙 Cómo Alojar en GitHub Pages

El proyecto incluye el flujo automatizado de GitHub Actions en `.github/workflows/deploy.yml`:

1. En tu repositorio de GitHub, dirígete a **Settings > Pages**.
2. En la sección **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Cada vez que hagas `git push` a la rama `main`, la aplicación se compilará y desplegará automáticamente en tu enlace de GitHub Pages.

---

## 🗄️ Configuración de Supabase Realtime (2 minutos)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En el menú lateral, abre el **SQL Editor** y haz clic en **New query**.
3. Pega el contenido del archivo [`supabase/schema.sql`](supabase/schema.sql) (también puedes copiarlo con 1 clic desde el menú de Ajustes dentro de la app) y pulsa **Run**.
4. Ve a **Project Settings > API** y copia:
   * **Project URL**
   * **Project API Keys (`anon` `public`)**
5. Puedes introducirlas:
   * Directamente en el modal de **Ajustes > Nube Realtime** dentro de la app web.
   * O bien en las variables de entorno de tu proyecto en Vercel (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
