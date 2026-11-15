<p align="center">
  <img src="public/images/his-logo.png" alt="Humans in Space logo" width="120" />
</p>

<h1 align="center">Humans in Space</h1>

<p align="center">
  <strong>Your interests. Your universe. Your missions.</strong><br />
  A web game to design, manage and simulate complete space missions.
</p>

<p align="center">
  NASA Space Apps Challenge 2026 · <em>Space Mission Design Game</em> challenge
</p>

<p align="center">
  <a href="#english">English</a> · <a href="#español">Español</a>
</p>

---

<a id="english"></a>

# English

## About the project

**Humans in Space** is an interactive game where anyone, with or without a background in space engineering, designs a mission, makes engineering decisions with limited resources, and watches a phase-by-phase simulation show how each choice changes the outcome.

The game is built on one idea: **not all of us are astronauts, but all of us can contribute to space**. It starts from the player's interests and personality and connects them with real missions or missions inspired by real programs (UNLP, SpaceX, NASA Artemis, Universidad de Mendoza).

> One universe. Millions of personalities. A shared future.

## Features

- **Home with a live community:** sign up and sign in, plus real database stats (explorers, missions played, medals awarded and top countries).
- **Avatar editor:** profiles by profession or personality, type (human, robot or fantasy), appearance, accessories and space suits.
- **Interests:** ten areas used to recommend related missions.
- **Universe (Orbital Station):** explorable map with keyboard (WASD or arrows) or touch joystick, showing other real players' avatars and their country flag.
- **Mission Center:** mission catalog with different difficulty levels.
- **Mission design:** engineering decisions with pros and cons, a real-time resource panel (budget, energy, fuel, mass, communication and life support) and pre-launch checks.
- **Live space weather:** real NASA data shown before each mission (see [NASA API connection](#nasa-api-connection)).
- **Phase-by-phase simulation:** event log and resource consumption per phase.
- **Post-mission result:** status (success, partial or failed), objectives met, a resource balance (at launch vs. at the end), explained score and tips to retry.
- **Progression:** experience, levels, medals and ranking points.
- **Results Tower:** global ranking with real players, teams and countries.
- **Space Library:** concepts explained in plain language and linked from the decisions.
- **Hangar:** edit profile, avatar, team and country.

### Missions

| Mission | Inspired by | Difficulty | Resources |
|---|---|---|---|
| Recover the USAT-1 satellite | Universidad Nacional de La Plata (UNLP) | Beginner | Budget, energy, communication |
| Reach Mars | SpaceX · Starship | Intermediate | Budget, fuel, mass, energy, life support |
| Build a lunar base | NASA · Artemis program | Intermediate | Budget, mass, energy, life support |
| Launch MendoSat | Universidad de Mendoza | Advanced | Budget, mass (2U CubeSat limit), energy, communication |

All four missions are playable.

### Scoring

- Up to **1000** points for objectives met.
- Up to **300** points for resource efficiency.
- Up to **200** points for safety (communication or life support).
- Penalties for warning and danger events.

Only the **improvement over your best score** on each mission counts toward the ranking, so replaying a mission does not inflate points.

<a id="nasa-api-connection"></a>

## NASA API connection

The game uses **one official NASA API**: **DONKI** (Space Weather Database Of Notifications, Knowledge, Information), published through the NASA Open APIs portal at [api.nasa.gov](https://api.nasa.gov).

**What is queried**

The server route `app/api/space-weather/route.ts` calls five DONKI endpoints for the **last 7 days**:

| Endpoint | Data | Fields used |
|---|---|---|
| `https://api.nasa.gov/DONKI/FLR` | Solar flares | `classType` (GOES X-ray class) |
| `https://api.nasa.gov/DONKI/CME` | Coronal mass ejections | `cmeAnalyses[]`: `isMostAccurate`, `type`, `enlilList[]` Earth impact flags |
| `https://api.nasa.gov/DONKI/GST` | Geomagnetic storms | `allKpIndex[].kpIndex` |
| `https://api.nasa.gov/DONKI/SEP` | Solar energetic particles | `linkedEvents[]` |
| `https://api.nasa.gov/DONKI/IPS` | Interplanetary shocks | `location`, `linkedEvents[]` |

These five sources feed **six indicators** in the mission briefing: Sun (a summary of flares and CMEs), flares, CMEs, storms, particles and shocks. Each one is shown as good, medium, complicated or no data.

**How it works**

- Requests are made **only from the server**. The API key never reaches the browser.
- The key is read from the `NASA_API_KEY` environment variable. Without it, the route falls back to NASA's public `DEMO_KEY`, which has much lower rate limits.
- Results are cached for **30 minutes** (in memory and via `Cache-Control: s-maxage=1800, stale-while-revalidate=3600`) to stay within NASA's rate limits.
- If an endpoint fails, the last successful response is reused and the panel is marked as outdated. A failed query is never displayed as "good".
- An empty list from DONKI means "no notable events catalogued in 7 days", because DONKI only records notable events.

**Important disclaimers**

- The interpretation rules in `lib/space-weather/classify.ts` are **Humans in Space's own educational thresholds**. They are **not** official NASA thresholds, alerts or mission-safety forecasts.
- Geomagnetic storm data describes Earth's magnetic environment only, not conditions on a trip to the Moon or Mars.
- Mission outcomes are decided by the game's own simulation engine (`lib/game/simulate.ts`). Real space weather is shown as context and does not alter the score.
- The missions are educational simulations **inspired by** real programs. No other NASA API is used, and the project is not affiliated with or endorsed by NASA or the institutions mentioned.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19
- [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) components
- [Supabase](https://supabase.com): Postgres, authentication and Row Level Security
- [NASA Open APIs · DONKI](https://api.nasa.gov) for space weather
- [SWR](https://swr.vercel.app) for client-side data
- [Lucide](https://lucide.dev) icons
- Deployed on [Vercel](https://vercel.com)

## Project structure

```
app/
  page.tsx                   Entry point
  actions.ts                 Server actions: profile and result recording
  stats-actions.ts           Community stats for the home page
  api/space-weather/route.ts NASA DONKI proxy with cache
components/game/             Game screens and components
  onboarding.tsx             Home, sign up, avatar and interests
  universe.tsx               Open world (Orbital Station)
  mission-runner.tsx         Mission briefing (includes space weather)
  space-weather.tsx          Space weather panel
  mission-design.tsx         Engineering decisions
  mission-simulation.tsx     Phase-by-phase simulation
  mission-result.tsx         Result and analysis
  results-view.tsx           Global ranking
  learn-view.tsx             Space Library
  hangar-view.tsx            Player profile
lib/game/
  missions.ts                USAT-1 and Mars missions
  missions-extra.ts          Lunar base and MendoSat missions
  simulate.ts                Simulation and scoring engine
  meta.ts                    Levels, medals and experience
  glossary.ts                Library concepts
  store.ts                   Player state backed by Supabase
lib/space-weather/
  classify.ts                Educational interpretation of DONKI data
lib/supabase/                Supabase clients (browser and server)
public/                      Images, logo and assets
```

## Database

| Table | Contents |
|---|---|
| `profiles` | One profile per user: name, team, country, avatar, interests, points, experience (`xp`) and medals. Created automatically on sign up. |
| `missions` | Mission catalog. |
| `mission_records` | Best score, best status and number of attempts per user and mission. |
| `mission_attempts` | History of every attempt: status, score, experience, points awarded and decisions made. |

**Security**

- Row Level Security enabled on every table.
- Each player can only edit their own profile.
- Points and results are recorded **only from the server** through the `record_mission_result` function. The browser cannot write scores.

**Sample queries** (in the Supabase SQL Editor)

```sql
-- Global ranking
select name, team, country, points, xp
from public.profiles
order by points desc
limit 20;

-- A player's attempt history
select a.created_at, m.title, a.status, a.score, a.points_awarded
from public.mission_attempts a
join public.missions m on m.id = a.mission_id
join public.profiles p on p.id = a.user_id
where p.name = 'Player name'
order by a.created_at desc;
```

## Running locally

**Requirements:** Node.js 20 or later, pnpm and a Supabase project.

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/rbascunan/humansinspace.git
   cd humansinspace
   pnpm install
   ```

2. Create a `.env.local` file:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NASA_API_KEY=
   ```

   > `SUPABASE_SERVICE_ROLE_KEY` is used only on the server to record results. Never share it or expose it to the browser.
   >
   > Get a free `NASA_API_KEY` at [api.nasa.gov](https://api.nasa.gov). If you leave it empty, `DEMO_KEY` is used with lower rate limits.

3. Create the tables, policies and functions described in [Database](#database) in Supabase.

4. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |

## How it answers the challenge

| The challenge asks for | Humans in Space offers |
|---|---|
| Design, manage and simulate a complete mission | Objective, design, phase-by-phase simulation and final evaluation |
| Engineering decisions with consequences | Every option has pros, cons and effects on resources |
| Manage limited resources | Budget, energy, fuel, mass, communication and life support in real time |
| Show the trade-offs | There is no single solution: balance is rewarded |
| Evaluation with clear feedback | Final status, objectives, resource balance, explained score and tips |
| Accessible to all levels | Plain language, built-in Library, hints and progressive difficulty |
| Real-world data | Live space weather from NASA DONKI before each mission |
| Replay, compare and compete | Unlimited retries, history and a global ranking by team and country |

## Next steps

- Real-time cooperative missions for teams of up to 4 people, with distinct roles (planning, spacecraft, science and communications).

## Author

App created by **Betito Bascuñan** for the **NASA Space Apps Challenge 2026**.

---

<a id="español"></a>

# Español

## Sobre el proyecto

**Humans in Space** es un juego interactivo en el que cualquier persona, sepa o no de ingeniería espacial, diseña una misión, toma decisiones de ingeniería con recursos limitados y ve en una simulación por fases cómo cada elección cambia el resultado.

El juego parte de una idea: **no todos somos astronautas, pero todos podemos aportar al espacio**. Por eso empieza por los intereses y la personalidad del jugador y los conecta con misiones reales o inspiradas en programas reales (UNLP, SpaceX, NASA Artemis, Universidad de Mendoza).

> Un universo. Millones de personalidades. Un futuro compartido.

## Funcionalidades

- **Home con comunidad en vivo:** registro e ingreso, más estadísticas reales de la base de datos (exploradores, misiones realizadas, medallas entregadas y países con más participantes).
- **Editor de avatar:** perfiles por profesión o personalidad, tipo (humano, robot o fantástico), apariencia, accesorios y trajes espaciales.
- **Intereses:** diez áreas que se usan para recomendar misiones afines.
- **Universo (Estación Orbital):** mapa explorable con teclado (WASD o flechas) o joystick táctil, con los avatares de otros jugadores reales y la bandera de su país.
- **Centro de Misiones:** catálogo de misiones con distintas dificultades.
- **Diseño de misión:** decisiones de ingeniería con ventajas y desventajas, un panel de recursos en tiempo real (presupuesto, energía, combustible, masa, comunicación y supervivencia) y validaciones antes del lanzamiento.
- **Clima espacial en vivo:** datos reales de la NASA antes de cada misión (ver [Conexión con las APIs de la NASA](#conexión-con-las-apis-de-la-nasa)).
- **Simulación por fases:** bitácora de eventos y consumo de recursos fase a fase.
- **Resultado post-misión:** estado (exitosa, parcial o fallida), objetivos cumplidos, balance de recursos (al despegar y al finalizar), puntaje explicado y recomendaciones para reintentar.
- **Progresión:** experiencia, niveles, medallas y puntos para el ranking.
- **Torre de Resultados:** ranking global con jugadores reales, equipos y países.
- **Biblioteca Espacial:** conceptos explicados en lenguaje simple y enlazados desde las decisiones.
- **Hangar:** edición del perfil, el avatar, el equipo y el país.

### Misiones

| Misión | Inspiración | Dificultad | Recursos |
|---|---|---|---|
| Recuperar el satélite USAT-1 | Universidad Nacional de La Plata (UNLP) | Inicial | Presupuesto, energía, comunicación |
| Llegar a Marte | SpaceX · Starship | Intermedia | Presupuesto, combustible, masa, energía, supervivencia |
| Construir una base lunar | NASA · Programa Artemis | Intermedia | Presupuesto, masa, energía, supervivencia |
| Lanzar MendoSat | Universidad de Mendoza | Avanzada | Presupuesto, masa (límite CubeSat 2U), energía, comunicación |

Las cuatro misiones son jugables.

### Puntaje

- Hasta **1000** puntos por objetivos cumplidos.
- Hasta **300** puntos por eficiencia en el uso de recursos.
- Hasta **200** puntos por seguridad (comunicación o supervivencia).
- Penalizaciones por eventos de advertencia y de peligro.

Al ranking solo suma la **mejora sobre tu mejor puntaje** en cada misión, así que repetir una misión no infla los puntos.

<a id="conexión-con-las-apis-de-la-nasa"></a>

## Conexión con las APIs de la NASA

El juego usa **una API oficial de la NASA**: **DONKI** (Space Weather Database Of Notifications, Knowledge, Information), publicada en el portal NASA Open APIs, [api.nasa.gov](https://api.nasa.gov).

**Qué se consulta**

La ruta de servidor `app/api/space-weather/route.ts` consulta cinco endpoints de DONKI para los **últimos 7 días**:

| Endpoint | Dato | Campos usados |
|---|---|---|
| `https://api.nasa.gov/DONKI/FLR` | Fulguraciones solares | `classType` (clase de rayos X GOES) |
| `https://api.nasa.gov/DONKI/CME` | Eyecciones de masa coronal | `cmeAnalyses[]`: `isMostAccurate`, `type`, indicadores de impacto en la Tierra de `enlilList[]` |
| `https://api.nasa.gov/DONKI/GST` | Tormentas geomagnéticas | `allKpIndex[].kpIndex` |
| `https://api.nasa.gov/DONKI/SEP` | Partículas solares energéticas | `linkedEvents[]` |
| `https://api.nasa.gov/DONKI/IPS` | Choques interplanetarios | `location`, `linkedEvents[]` |

Con estas cinco fuentes se arman **seis indicadores** en la presentación de la misión: Sol (resumen de fulguraciones y eyecciones), fulguraciones, eyecciones, tormentas, partículas y choques. Cada uno se muestra como bien, medio, complicado o sin datos.

**Cómo funciona**

- Las consultas se hacen **solo desde el servidor**. La clave nunca llega al navegador.
- La clave se lee de la variable de entorno `NASA_API_KEY`. Si no está, se usa la `DEMO_KEY` pública de la NASA, que tiene límites de uso mucho más bajos.
- Los resultados se guardan en caché **30 minutos** (en memoria y con `Cache-Control: s-maxage=1800, stale-while-revalidate=3600`) para respetar los límites de la NASA.
- Si un endpoint falla, se reutiliza la última respuesta correcta y el panel se marca como desactualizado. Una consulta fallida nunca se muestra como "bien".
- Una lista vacía de DONKI significa "sin eventos notables catalogados en 7 días", porque DONKI solo registra eventos notables.

**Aclaraciones importantes**

- Las reglas de interpretación de `lib/space-weather/classify.ts` son **umbrales educativos propios de Humans in Space**. **No** son umbrales, alertas ni pronósticos oficiales de la NASA para la seguridad de misiones.
- Las tormentas geomagnéticas describen solo el entorno magnético de la Tierra, no las condiciones de un viaje a la Luna o a Marte.
- El resultado de las misiones lo decide el motor de simulación propio del juego (`lib/game/simulate.ts`). El clima espacial real se muestra como contexto y no modifica el puntaje.
- Las misiones son simulaciones educativas **inspiradas en** programas reales. No se usa ninguna otra API de la NASA, y el proyecto no está afiliado ni avalado por la NASA ni por las instituciones mencionadas.

## Tecnologías

- [Next.js 16](https://nextjs.org) (App Router) y React 19
- [Tailwind CSS](https://tailwindcss.com) y componentes de [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com): Postgres, autenticación y Row Level Security
- [NASA Open APIs · DONKI](https://api.nasa.gov) para el clima espacial
- [SWR](https://swr.vercel.app) para datos del lado del cliente
- [Lucide](https://lucide.dev) para los íconos
- Deploy en [Vercel](https://vercel.com)

## Estructura del proyecto

```
app/
  page.tsx                   Punto de entrada
  actions.ts                 Server actions: perfil y registro de resultados
  stats-actions.ts           Estadísticas de la comunidad para la home
  api/space-weather/route.ts Proxy de NASA DONKI con caché
components/game/             Pantallas y componentes del juego
  onboarding.tsx             Home, registro, avatar e intereses
  universe.tsx               Mundo abierto (Estación Orbital)
  mission-runner.tsx         Presentación de la misión (incluye clima espacial)
  space-weather.tsx          Panel de clima espacial
  mission-design.tsx         Decisiones de ingeniería
  mission-simulation.tsx     Simulación por fases
  mission-result.tsx         Resultado y análisis
  results-view.tsx           Ranking global
  learn-view.tsx             Biblioteca Espacial
  hangar-view.tsx            Perfil del jugador
lib/game/
  missions.ts                Misiones USAT-1 y Marte
  missions-extra.ts          Misiones base lunar y MendoSat
  simulate.ts                Motor de simulación y puntaje
  meta.ts                    Niveles, medallas y experiencia
  glossary.ts                Conceptos de la Biblioteca
  store.ts                   Estado del jugador conectado a Supabase
lib/space-weather/
  classify.ts                Interpretación educativa de los datos de DONKI
lib/supabase/                Clientes de Supabase (navegador y servidor)
public/                      Imágenes, logo y recursos
```

## Base de datos

| Tabla | Contenido |
|---|---|
| `profiles` | Un perfil por usuario: nombre, equipo, país, avatar, intereses, puntos, experiencia (`xp`) y medallas. Se crea automáticamente al registrarse. |
| `missions` | Catálogo de misiones. |
| `mission_records` | Mejor puntaje, mejor estado y cantidad de intentos por usuario y misión. |
| `mission_attempts` | Historial de cada intento: estado, puntaje, experiencia, puntos otorgados y decisiones tomadas. |

**Seguridad**

- Row Level Security activado en todas las tablas.
- Cada jugador solo puede editar su propio perfil.
- Los puntos y resultados se registran **solo desde el servidor** mediante la función `record_mission_result`. El navegador no puede escribir puntajes.

**Consultas de ejemplo** (en el SQL Editor de Supabase)

```sql
-- Ranking global
select name, team, country, points, xp
from public.profiles
order by points desc
limit 20;

-- Historial de intentos de un jugador
select a.created_at, m.title, a.status, a.score, a.points_awarded
from public.mission_attempts a
join public.missions m on m.id = a.mission_id
join public.profiles p on p.id = a.user_id
where p.name = 'Nombre del jugador'
order by a.created_at desc;
```

## Cómo correrlo en tu máquina

**Requisitos:** Node.js 20 o superior, pnpm y un proyecto de Supabase.

1. Cloná el repositorio e instalá las dependencias:

   ```bash
   git clone https://github.com/rbascunan/humansinspace.git
   cd humansinspace
   pnpm install
   ```

2. Creá un archivo `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NASA_API_KEY=
   ```

   > La `SUPABASE_SERVICE_ROLE_KEY` se usa solo del lado del servidor para registrar resultados. No la compartas ni la expongas en el navegador.
   >
   > Conseguí una `NASA_API_KEY` gratis en [api.nasa.gov](https://api.nasa.gov). Si la dejás vacía, se usa la `DEMO_KEY`, con límites más bajos.

3. Creá en Supabase las tablas, políticas y funciones descritas en [Base de datos](#base-de-datos).

4. Iniciá el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |

## Cómo responde al desafío

| El desafío pide | Humans in Space ofrece |
|---|---|
| Diseñar, gestionar y simular una misión completa | Objetivo, diseño, simulación por fases y evaluación final |
| Decisiones de ingeniería con consecuencias | Cada opción tiene ventajas, desventajas y efectos sobre los recursos |
| Gestionar recursos limitados | Presupuesto, energía, combustible, masa, comunicación y supervivencia en tiempo real |
| Mostrar los trade-offs | No hay una única solución: se premia el equilibrio |
| Evaluación con feedback claro | Estado final, objetivos, balance de recursos, puntaje explicado y recomendaciones |
| Accesible para todos los niveles | Lenguaje simple, Biblioteca integrada, pistas y dificultades progresivas |
| Datos del mundo real | Clima espacial en vivo de NASA DONKI antes de cada misión |
| Rejugar, comparar y competir | Reintentos ilimitados, historial y ranking global por equipo y país |

## Próximos pasos

- Misiones cooperativas en tiempo real para equipos de hasta 4 personas, con roles diferenciados (planificación, nave, ciencia y comunicaciones).

## Autor

App creada por **Betito Bascuñan** para la **NASA Space Apps Challenge 2026**.
