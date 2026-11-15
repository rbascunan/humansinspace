<p align="center">
  <img src="public/images/his-logo.png" alt="Logo de Humans in Space" width="120" />
</p>

<h1 align="center">Humans in Space</h1>

<p align="center">
  <strong>Tus intereses. Tu universo. Tus misiones.</strong><br />
  Un juego web para diseñar, gestionar y simular misiones espaciales completas.
</p>

<p align="center">
  NASA Space Apps Challenge 2026 · Desafío <em>Space Mission Design Game</em>
</p>

---

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
- **Simulación por fases:** bitácora de eventos y consumo de recursos fase a fase.
- **Resultado post-misión:** estado (exitosa, parcial o fallida), objetivos cumplidos, puntaje explicado y recomendaciones para reintentar.
- **Progresión:** XP, niveles, medallas y puntos para el ranking.
- **Torre de Resultados:** ranking global con jugadores reales, equipos y países.
- **Biblioteca Espacial:** conceptos explicados en lenguaje simple y enlazados desde las decisiones.
- **Hangar:** edición del perfil, el avatar, el equipo y el país.

### Misiones

| Misión | Inspiración | Dificultad | Estado |
|---|---|---|---|
| Recuperar el satélite USAT-1 | Universidad Nacional de La Plata (UNLP) | Inicial | Jugable |
| Llegar a Marte | SpaceX · Starship | Intermedia | Jugable |
| Construir una base lunar | NASA · Programa Artemis | Intermedia | Próximamente |
| Rescatar MendoSat | Universidad de Mendoza | Avanzada | Próximamente |

### Puntaje

- Hasta **1000** puntos por objetivos cumplidos.
- Hasta **300** puntos por eficiencia en el uso de recursos.
- Hasta **200** puntos por seguridad (comunicación o supervivencia).
- Penalizaciones por eventos de advertencia y de peligro.

Al ranking solo suma la **mejora sobre tu mejor puntaje** en cada misión, así que repetir una misión no infla los puntos.

## Tecnologías

- [Next.js 16](https://nextjs.org) (App Router) y React 19
- [Tailwind CSS](https://tailwindcss.com) y componentes de [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com): Postgres, autenticación y Row Level Security
- [SWR](https://swr.vercel.app) para datos del lado del cliente
- [Lucide](https://lucide.dev) para los íconos
- Deploy en [Vercel](https://vercel.com)

## Estructura del proyecto

```
app/
  page.tsx            Punto de entrada
  actions.ts          Server actions: perfil y registro de resultados
  stats-actions.ts    Estadísticas de la comunidad para la home
components/game/      Pantallas y componentes del juego
  onboarding.tsx        Home, registro, avatar e intereses
  universe.tsx          Mundo abierto (Estación Orbital)
  mission-design.tsx    Decisiones de ingeniería
  mission-simulation.tsx  Simulación por fases
  mission-result.tsx    Resultado y análisis
  results-view.tsx      Ranking global
  learn-view.tsx        Biblioteca Espacial
  hangar-view.tsx       Perfil del jugador
lib/game/
  missions.ts         Definición de misiones y decisiones
  simulate.ts         Motor de simulación y puntaje
  meta.ts             Niveles, medallas y XP
  glossary.ts         Conceptos de la Biblioteca
  store.ts            Estado del jugador conectado a Supabase
lib/supabase/         Clientes de Supabase (navegador y servidor)
public/               Imágenes, logo y recursos
```

## Base de datos

| Tabla | Contenido |
|---|---|
| `profiles` | Un perfil por usuario: nombre, equipo, país, avatar, intereses, puntos, XP y medallas. Se crea automáticamente al registrarse. |
| `missions` | Catálogo de misiones. |
| `mission_records` | Mejor puntaje, mejor estado y cantidad de intentos por usuario y misión. |
| `mission_attempts` | Historial de cada intento: estado, puntaje, XP, puntos otorgados y decisiones tomadas. |

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

2. Creá un archivo `.env.local` con las variables de tu proyecto de Supabase:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   > La `SUPABASE_SERVICE_ROLE_KEY` se usa solo del lado del servidor para registrar resultados. No la compartas ni la expongas en el navegador.

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
| Evaluación con feedback claro | Estado final, objetivos, puntaje explicado y recomendaciones |
| Accesible para todos los niveles | Lenguaje simple, Biblioteca integrada, pistas y dificultades progresivas |
| Rejugar, comparar y competir | Reintentos ilimitados, historial y ranking global por equipo y país |

## Próximos pasos

- Habilitar las misiones de la base lunar y MendoSat.
- Misiones cooperativas en tiempo real para equipos de hasta 4 personas, con roles diferenciados (planificación, nave, ciencia y comunicaciones).

## Autor

App creada por **Betito Bascuñan** para la **NASA Space Apps Challenge 2026**.
