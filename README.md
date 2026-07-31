🔥 Visor de Incendios Forestales en Tiempo Real

Aplicación WebGIS construida con Angular y ArcGIS Maps SDK for JavaScript que visualiza incendios activos en tiempo real usando datos abiertos de NASA FIRMS.

Este proyecto nació como preparación práctica para trabajar con tecnologías ESRI en un contexto profesional — específicamente, con la vacante de Desarrollador/a WebGIS de Cotesa en mente.

🗺️ Qué hace
Muestra incendios activos en España sobre un mapa interactivo (arcgis-map)
Permite filtrar por período (1, 2 o 3 días) y por intensidad del incendio (FRP)
Renderiza los puntos con una simbología de clases (class-breaks) según intensidad
Popup con fecha e intensidad al hacer clic en cada incendio
Panel lateral con estadísticas en tiempo real (total de incendios, intensidad máxima) y leyenda visual
Interfaz construida con Calcite Design System (shell, panel, list, segmented-control)

🛠️ Stack técnico
Categoría	Tecnologías
Framework	Angular (standalone components, Signals)
Mapas	ArcGIS Maps SDK for JavaScript (@arcgis/core, @arcgis/map-components)
UI	Calcite Design System (@esri/calcite-components)
Datos	NASA FIRMS (CSV → GeoJSON en cliente)
Capas	GeoJSONLayer con renderer class-breaks
Lenguaje	TypeScript

📐 Arquitectura
Fires service: obtiene y parsea los datos CSV de NASA FIRMS
App component: gestiona el estado con Signals (totalFires, maxIntensity, isLoading, filtros)
Conversión de datos a GeoJSON en cliente → Blob → GeoJSONLayer dinámico
Filtrado reactivo por período e intensidad sin recargar el mapa completo


🚀 Cómo ejecutarlo localmente
Requisitos previos
Node.js v18 o superior
Angular CLI instalado globalmente
bash
npm install -g @angular/cli
1. Clonar el repositorio
bash
git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git
cd <nombre-del-repo>
2. Instalar dependencias
bash
npm install
3. (Opcional) Configurar variables de entorno

Si el proyecto usa una API key o portal de ArcGIS propio, crea un archivo .env o revisa src/auth/configureOAuth.ts y añade tus credenciales:

bash
# .env (ejemplo, si aplica)
ARCGIS_APP_ID=tu_app_id_aqui

Si no usas un portal privado ni OAuth, puedes omitir este paso — el mapa base y las capas públicas funcionan sin credenciales adicionales.

4. Levantar el servidor de desarrollo
bash
ng serve
