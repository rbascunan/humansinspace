import type { Mission, SimContext } from './types'

function add(ctx: SimContext, key: keyof SimContext['res'], delta: number) {
  const spec = ctx.specs.find((s) => s.key === key)
  const next = Math.round(ctx.res[key] + delta)
  ctx.res[key] = spec && !spec.limitIsCeiling && key !== 'budget' ? Math.min(next, spec.max) : next
}

export const moonbase: Mission = {
  id: 'moonbase',
  code: 'MISIÓN 02',
  title: 'Construir una base lunar',
  org: 'Inspirada en NASA · Programa Artemis',
  logo: '/logos/nasa.png',
  vehicle: 'Módulos habitables',
  location: 'Polo sur de la Luna',
  image: '/missions/moonbase.png',
  summary:
    'Diseñá una base de investigación: módulos, materiales, energía, alimentos y protección para los astronautas.',
  objective: 'Diseñar una base que permita investigar y mantener a sus habitantes durante 6 meses.',
  problem: 'El presupuesto y la capacidad de transporte (40 t por alunizaje) son limitados, y la noche lunar dura 14 días.',
  expected: 'Una base habitable, con energía y comida suficientes para la tripulación y un laboratorio activo.',
  interests: ['construccion', 'arte', 'campo', 'naturaleza', 'negocios'],
  difficulty: 'Intermedia',
  playable: true,
  resources: [
    { key: 'budget', start: 500, max: 500, unit: 'M USD' },
    { key: 'mass', start: 0, max: 40, unit: 't', limitIsCeiling: true },
    { key: 'energy', start: 0, max: 100, unit: '%' },
    { key: 'survival', start: 40, max: 100, unit: '%' },
  ],
  decisions: [
    {
      id: 'habitat',
      question: '¿Qué tipo de módulo habitable construís?',
      hint: 'Cada tonelada que llevás a la Luna cuesta mucho. El regolito (suelo lunar) protege de la radiación.',
      conceptId: 'masa',
      options: [
        {
          id: 'rigid',
          label: 'Módulo rígido de aluminio',
          description: 'Como los módulos de la Estación Espacial.',
          pros: 'Probado y resistente.',
          cons: 'Muy pesado (18 t).',
          effects: { budget: -150, mass: 18, survival: 20 },
        },
        {
          id: 'inflatable',
          label: 'Módulo inflable',
          description: 'Se despliega una vez en la Luna.',
          pros: 'Liviano (8 t) y barato.',
          cons: 'Protege menos de la radiación.',
          effects: { budget: -90, mass: 8, survival: 10 },
        },
        {
          id: 'regolith',
          label: 'Impreso en 3D con regolito',
          description: 'Robots imprimen muros con suelo lunar.',
          pros: 'Gran escudo contra radiación.',
          cons: 'Requiere llevar impresoras (12 t).',
          effects: { budget: -120, mass: 12, survival: 25 },
          flags: ['shielded'],
        },
      ],
    },
    {
      id: 'power',
      question: '¿Cómo genera energía la base?',
      hint: 'En el polo sur hay crestas con sol casi permanente, pero la noche lunar existe.',
      conceptId: 'energia',
      options: [
        {
          id: 'solar_ridge',
          label: 'Paneles en la cresta',
          description: 'Paneles solares verticales en zonas iluminadas.',
          pros: 'Barato y liviano.',
          cons: 'Sin almacenamiento para la noche.',
          effects: { budget: -60, energy: 70, mass: 4 },
          flags: ['solar'],
        },
        {
          id: 'solar_battery',
          label: 'Paneles + baterías',
          description: 'Energía solar con banco de baterías.',
          pros: 'Resiste la noche lunar.',
          cons: 'Más masa y costo.',
          effects: { budget: -90, energy: 90, mass: 7 },
          flags: ['solar', 'storage'],
        },
        {
          id: 'fission',
          label: 'Reactor de fisión pequeño',
          description: 'Como el proyecto Kilopower de NASA.',
          pros: 'Energía constante día y noche.',
          cons: 'La opción más cara.',
          effects: { budget: -140, energy: 100, mass: 9 },
          flags: ['nuclear'],
        },
      ],
    },
    {
      id: 'food',
      question: '¿Cómo obtienen agua y comida?',
      hint: 'Traer todo desde la Tierra es caro; producir en la Luna consume energía.',
      conceptId: 'datos',
      options: [
        {
          id: 'shipped',
          label: 'Traer suministros',
          description: 'Comida y agua envasadas desde la Tierra.',
          pros: 'No consume energía.',
          cons: 'Pesado (10 t) y se agota.',
          effects: { budget: -50, mass: 10 },
          flags: ['food_ship'],
        },
        {
          id: 'greenhouse',
          label: 'Invernadero hidropónico',
          description: 'Cultivos con luz LED.',
          pros: 'Comida fresca y continua.',
          cons: 'Gasta energía y necesita agua.',
          effects: { budget: -80, mass: 6, energy: -15 },
          flags: ['greenhouse'],
        },
        {
          id: 'ice',
          label: 'Invernadero + hielo polar',
          description: 'Extraer agua del hielo de los cráteres.',
          pros: 'Agua y comida propias.',
          cons: 'El sistema más caro y que más energía usa.',
          effects: { budget: -110, mass: 8, energy: -20 },
          flags: ['greenhouse', 'ice'],
        },
      ],
    },
    {
      id: 'protection',
      question: '¿Qué protección extra tiene la tripulación?',
      hint: 'Las tormentas solares pueden ser muy peligrosas en la superficie.',
      conceptId: 'traje',
      options: [
        {
          id: 'shelter',
          label: 'Refugio para tormentas solares',
          description: 'Cuarto blindado para emergencias.',
          pros: 'Máxima seguridad.',
          cons: 'Suma costo y 5 t.',
          effects: { budget: -60, mass: 5, survival: 20 },
          flags: ['shelter'],
        },
        {
          id: 'suits',
          label: 'Trajes reforzados',
          description: 'Mejores trajes para salir de la base.',
          pros: 'Liviano y barato.',
          cons: 'Protección limitada.',
          effects: { budget: -20, mass: 1, survival: 8 },
        },
        {
          id: 'none',
          label: 'Sin protección extra',
          description: 'Confiar en el módulo habitable.',
          pros: 'No cuesta nada.',
          cons: 'Riesgo alto si hay tormenta solar.',
          effects: {},
        },
      ],
    },
    {
      id: 'science',
      question: '¿Qué laboratorio instalás?',
      hint: 'La ciencia es la razón de la base, pero cada equipo consume energía.',
      conceptId: 'satelite',
      options: [
        {
          id: 'lab_full',
          label: 'Laboratorio completo',
          description: 'Geología, biología y telescopio.',
          pros: 'Máxima ciencia.',
          cons: 'Pesa 7 t y usa energía.',
          effects: { budget: -90, mass: 7, energy: -10 },
          flags: ['sci_full'],
        },
        {
          id: 'lab_basic',
          label: 'Laboratorio básico',
          description: 'Análisis de muestras de suelo.',
          pros: 'Liviano y barato.',
          cons: 'Ciencia limitada.',
          effects: { budget: -40, mass: 3, energy: -5 },
          flags: ['sci_basic'],
        },
        {
          id: 'lab_none',
          label: 'Sin laboratorio',
          description: 'Solo vivienda por ahora.',
          pros: 'Ahorra todo.',
          cons: 'La base no investiga.',
          effects: {},
        },
      ],
    },
  ],
  phases: [
    {
      id: 'transport',
      label: 'Transporte a la Luna',
      run: (ctx) => {
        if (ctx.res.mass > 40) {
          const extra = ctx.res.mass - 40
          const cost = extra * 8
          add(ctx, 'budget', -cost)
          ctx.log.push({
            tone: 'danger',
            text: `La carga supera las 40 t del alunizador por ${extra} t: hace falta un vuelo extra (-${cost} M USD).`,
          })
          if (ctx.res.budget < 0) {
            ctx.fatal = 'No hay presupuesto para el vuelo extra: la base no puede completarse.'
            ctx.log.push({ tone: 'danger', text: ctx.fatal })
            return
          }
        }
        ctx.log.push({ tone: 'success', text: `Alunizaje en el polo sur con ${ctx.res.mass} t de módulos y equipos.` })
      },
    },
    {
      id: 'construction',
      label: 'Construcción',
      run: (ctx) => {
        add(ctx, 'energy', -10)
        ctx.log.push({ tone: 'info', text: 'Robots y astronautas arman la base (-10% energía).' })
        if (ctx.flags.has('shielded')) {
          ctx.log.push({ tone: 'success', text: 'Muros de regolito impresos: excelente escudo contra la radiación.' })
        }
        if (ctx.res.energy <= 0) {
          ctx.res.energy = 0
          ctx.fatal = 'Sin energía para terminar la construcción: la tripulación debe evacuar.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
          return
        }
        ctx.flags.add('built')
        ctx.log.push({ tone: 'success', text: '¡Base lunar construida y presurizada!' })
      },
    },
    {
      id: 'night',
      label: 'Noche lunar (14 días)',
      run: (ctx) => {
        const drain = ctx.flags.has('nuclear') ? 10 : ctx.flags.has('storage') ? 20 : 45
        add(ctx, 'energy', -drain)
        ctx.log.push({
          tone: drain > 30 ? 'danger' : 'info',
          text:
            drain > 30
              ? `Sin baterías, la noche lunar deja la base casi a oscuras (-${drain}% energía).`
              : `La base atraviesa la noche lunar (-${drain}% energía).`,
        })
        if (ctx.res.energy < 20) {
          add(ctx, 'survival', -20)
          ctx.log.push({ tone: 'warning', text: 'Calefacción al mínimo: hace mucho frío en la base (-20% supervivencia).' })
        } else {
          ctx.flags.add('night_ok')
        }
        if (ctx.res.energy < 0) ctx.res.energy = 0
      },
    },
    {
      id: 'operation',
      label: 'Operación (6 meses)',
      run: (ctx) => {
        const energyAtStart = ctx.res.energy
        if (ctx.flags.has('food_ship')) {
          add(ctx, 'survival', -15)
          ctx.log.push({ tone: 'warning', text: 'Los suministros envasados se agotan antes de tiempo (-15% supervivencia).' })
        } else if (energyAtStart < 25) {
          add(ctx, 'survival', -20)
          ctx.log.push({ tone: 'danger', text: 'El invernadero no tiene energía suficiente: las plantas mueren (-20%).' })
        } else {
          ctx.log.push({ tone: 'success', text: 'El invernadero produce verduras frescas.' })
          if (ctx.flags.has('ice')) {
            add(ctx, 'survival', 5)
            ctx.log.push({ tone: 'success', text: 'El hielo polar se convierte en agua potable y oxígeno (+5%).' })
          }
        }
        if (!ctx.flags.has('shielded') && !ctx.flags.has('shelter')) {
          add(ctx, 'survival', -20)
          ctx.log.push({ tone: 'danger', text: 'Tormenta solar sin refugio: la tripulación recibe mucha radiación (-20%).' })
        } else {
          ctx.log.push({ tone: 'info', text: 'Una tormenta solar pasa sin daños: la tripulación estaba protegida.' })
        }
        if (ctx.flags.has('sci_full') && energyAtStart >= 25) {
          ctx.flags.add('science_full')
          ctx.log.push({ tone: 'success', text: '¡El laboratorio completo analiza muestras y observa el universo!' })
        } else if (ctx.flags.has('sci_full') || ctx.flags.has('sci_basic')) {
          ctx.log.push({ tone: 'warning', text: 'El laboratorio funciona a medias: falta equipamiento o energía.' })
        } else {
          ctx.log.push({ tone: 'warning', text: 'Sin laboratorio, la base no produce ciencia.' })
        }
        add(ctx, 'energy', -10)
        if (ctx.res.energy < 0) ctx.res.energy = 0
        if (ctx.res.survival <= 0) {
          ctx.res.survival = 0
          ctx.fatal = 'La tripulación no pudo permanecer en la base y fue evacuada.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
        }
      },
    },
  ],
  objectives: [
    {
      id: 'built',
      label: 'Construir la base',
      check: (c) => c.flags.has('built'),
      tip: 'Respetá el límite de 40 t del alunizador o guardá presupuesto para un vuelo extra.',
    },
    {
      id: 'night',
      label: 'Sobrevivir la noche lunar con energía',
      check: (c) => c.flags.has('night_ok'),
      tip: 'Sumá baterías o un reactor: los paneles solos no alcanzan de noche.',
    },
    {
      id: 'crew',
      label: 'Tripulación saludable (supervivencia 50% o más)',
      check: (c) => c.res.survival >= 50,
      tip: 'Protegé contra la radiación y producí tu propia comida.',
    },
    {
      id: 'science',
      label: 'Laboratorio completo funcionando',
      check: (c) => c.flags.has('science_full'),
      tip: 'Instalá el laboratorio completo y llegá con al menos 25% de energía a la operación.',
    },
  ],
}

const CUBESAT_2U_LIMIT = 2660

export const mendosat: Mission = {
  id: 'mendosat',
  code: 'MISIÓN 04',
  title: 'Lanzar MendoSat',
  org: 'Universidad de Mendoza, Argentina',
  logo: '/logos/um.png',
  vehicle: 'CubeSat MendoSat (prototipo)',
  location: 'Mendoza → Órbita baja sobre los Andes',
  image: '/missions/mendosat.png',
  summary:
    'MendoSat se construyó como prototipo pero nunca se lanzó. Llevalo del laboratorio al espacio: pruebas, lanzador, energía, antena y carga útil.',
  objective: 'Convertir el prototipo en un satélite de vuelo, ponerlo en órbita y obtener datos ambientales de los Andes.',
  problem: 'El presupuesto universitario es chico y el CubeSat 2U no puede superar 2,66 kg.',
  expected: 'Satélite en órbita, primer contacto desde Mendoza y mediciones ambientales descargadas.',
  interests: ['campo', 'naturaleza', 'montana', 'ciencia', 'tecnologia'],
  difficulty: 'Avanzada',
  playable: true,
  resources: [
    { key: 'budget', start: 120, max: 120, unit: 'mil USD' },
    { key: 'mass', start: 1300, max: CUBESAT_2U_LIMIT, unit: 'g', limitIsCeiling: true },
    { key: 'energy', start: 0, max: 100, unit: '%' },
    { key: 'comms', start: 0, max: 100, unit: '%' },
  ],
  decisions: [
    {
      id: 'tests',
      question: '¿Qué pruebas hacés antes del lanzamiento?',
      hint: 'Un prototipo de laboratorio no es un satélite de vuelo: debe sobrevivir vibraciones y el vacío.',
      conceptId: 'satelite',
      options: [
        {
          id: 'full',
          label: 'Vibración + termovacío',
          description: 'Campaña completa de calificación.',
          pros: 'El satélite queda listo para el espacio.',
          cons: 'La opción más cara.',
          effects: { budget: -35 },
          flags: ['tested_full'],
        },
        {
          id: 'basic',
          label: 'Solo vibración',
          description: 'Se simula el lanzamiento en una mesa vibradora.',
          pros: 'Costo moderado.',
          cons: 'No se prueba el frío y el vacío.',
          effects: { budget: -15 },
          flags: ['tested_basic'],
        },
        {
          id: 'none',
          label: 'Lanzar el prototipo tal cual',
          description: 'Confiar en el diseño del laboratorio.',
          pros: 'No cuesta nada.',
          cons: 'Riesgo muy alto de fallas.',
          effects: {},
        },
      ],
    },
    {
      id: 'launch',
      question: '¿Cómo llega MendoSat al espacio?',
      hint: 'Los CubeSats viajan como pasajeros en cohetes más grandes.',
      conceptId: 'orbita',
      options: [
        {
          id: 'rideshare',
          label: 'Viaje compartido (Falcon 9)',
          description: 'Órbita heliosincrónica a 550 km junto a otros satélites.',
          pros: 'Cohete muy confiable.',
          cons: 'Costo medio.',
          effects: { budget: -40 },
          flags: ['orbit_sso'],
        },
        {
          id: 'small',
          label: 'Lanzador pequeño dedicado',
          description: 'Un cohete chico solo para tu órbita.',
          pros: 'Elegís la órbita exacta.',
          cons: 'Caro y vibra más fuerte.',
          effects: { budget: -60 },
          flags: ['orbit_sso', 'launch_rough'],
        },
        {
          id: 'iss',
          label: 'Despliegue desde la ISS',
          description: 'Viaja en una nave de carga y se suelta a 400 km.',
          pros: 'La opción más barata.',
          cons: 'Órbita baja: pases cortos y vida útil menor.',
          effects: { budget: -25 },
          flags: ['orbit_iss'],
        },
      ],
    },
    {
      id: 'power',
      question: '¿Qué sistema de energía lleva?',
      hint: 'En órbita, MendoSat pasa 35 minutos de cada vuelta en la sombra de la Tierra.',
      conceptId: 'energia',
      options: [
        {
          id: 'deployable',
          label: 'Paneles desplegables',
          description: 'Alas solares que se abren en órbita.',
          pros: 'Máxima energía.',
          cons: 'El mecanismo debe abrirse bien.',
          effects: { budget: -20, mass: 300, energy: 85 },
          flags: ['deploy_mech'],
        },
        {
          id: 'body',
          label: 'Paneles en el cuerpo',
          description: 'Celdas pegadas a las caras del satélite.',
          pros: 'Simple y seguro.',
          cons: 'Menos energía.',
          effects: { budget: -10, mass: 150, energy: 55 },
        },
        {
          id: 'battery',
          label: 'Solo batería del prototipo',
          description: 'Sin paneles solares.',
          pros: 'Barato.',
          cons: 'Se agota en pocos días.',
          effects: { budget: -5, mass: 200, energy: 30 },
          flags: ['battery_only'],
        },
      ],
    },
    {
      id: 'radio',
      question: '¿Cómo se comunica con Mendoza?',
      hint: 'Más velocidad de datos requiere más energía. Una red de estaciones da más contactos.',
      conceptId: 'comunicacion',
      options: [
        {
          id: 'uhf',
          label: 'Radio UHF',
          description: 'Banda de radioaficionados, una estación en Mendoza.',
          pros: 'Barato y liviano.',
          cons: 'Pocos datos por pase.',
          effects: { budget: -5, mass: 80, comms: 50 },
        },
        {
          id: 'uhf_net',
          label: 'UHF + red mundial de estaciones',
          description: 'Estaciones voluntarias tipo SatNOGS en todo el mundo.',
          pros: 'Muchos más contactos.',
          cons: 'Requiere coordinación.',
          effects: { budget: -10, mass: 80, comms: 70 },
        },
        {
          id: 'sband',
          label: 'Transmisor banda S',
          description: 'Enlace rápido para imágenes.',
          pros: 'Mucha velocidad.',
          cons: 'Caro, pesado y gasta energía.',
          effects: { budget: -25, mass: 200, comms: 85, energy: -15 },
        },
      ],
    },
    {
      id: 'payload',
      question: '¿Qué instrumentos lleva?',
      hint: 'MendoSat quiere medir el ambiente de los Andes: nieve, glaciares y agua.',
      conceptId: 'datos',
      options: [
        {
          id: 'cam_env',
          label: 'Cámara multiespectral + sensores',
          description: 'Imágenes de nieve y glaciares y datos ambientales.',
          pros: 'Máxima ciencia.',
          cons: 'Pesada (600 g) y gasta energía.',
          effects: { budget: -15, mass: 600, energy: -20 },
          flags: ['sci_full'],
        },
        {
          id: 'sensors',
          label: 'Sensores ambientales',
          description: 'Temperatura, radiación y campo magnético.',
          pros: 'Liviano.',
          cons: 'Sin imágenes.',
          effects: { budget: -8, mass: 300, energy: -10 },
          flags: ['sci_mid'],
        },
        {
          id: 'beacon',
          label: 'Solo baliza de telemetría',
          description: 'Transmite el estado del satélite.',
          pros: 'Mínimo riesgo.',
          cons: 'No hay ciencia.',
          effects: { mass: 50 },
        },
      ],
    },
  ],
  phases: [
    {
      id: 'integration',
      label: 'Integración y pruebas',
      run: (ctx) => {
        if (ctx.res.mass > CUBESAT_2U_LIMIT) {
          ctx.fatal = `MendoSat pesa ${ctx.res.mass} g y el dispensador acepta hasta ${CUBESAT_2U_LIMIT} g: el satélite queda en tierra.`
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
          return
        }
        ctx.log.push({ tone: 'info', text: `Prototipo convertido en satélite de vuelo: ${ctx.res.mass} g dentro del límite 2U.` })
        if (ctx.flags.has('tested_full')) {
          ctx.log.push({ tone: 'success', text: 'Superó vibración y termovacío: listo para volar.' })
        } else if (ctx.flags.has('tested_basic')) {
          ctx.log.push({ tone: 'warning', text: 'Pasó la vibración, pero nadie probó cómo se comporta en el frío del vacío.' })
        } else {
          ctx.log.push({ tone: 'danger', text: 'El prototipo viaja sin pruebas: cualquier falla aparecerá en el espacio.' })
        }
      },
    },
    {
      id: 'launch',
      label: 'Lanzamiento',
      run: (ctx) => {
        const untested = !ctx.flags.has('tested_full') && !ctx.flags.has('tested_basic')
        if (ctx.flags.has('launch_rough') && untested) {
          ctx.fatal = 'Las vibraciones del cohete pequeño rompieron una soldadura: MendoSat no responde nunca.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
          return
        }
        ctx.log.push({
          tone: 'info',
          text: ctx.flags.has('orbit_iss')
            ? 'Viaje en nave de carga y despliegue desde la Estación Espacial a 400 km.'
            : 'Despegue y separación del dispensador en órbita a 550 km.',
        })
        if (untested) {
          add(ctx, 'comms', -30)
          add(ctx, 'energy', -20)
          ctx.log.push({ tone: 'danger', text: 'Un conector se aflojó en el ascenso: radio y energía dañadas.' })
        } else if (ctx.flags.has('tested_basic') && ctx.flags.has('launch_rough')) {
          add(ctx, 'comms', -10)
          ctx.log.push({ tone: 'warning', text: 'El lanzador vibró fuerte: la antena quedó algo desalineada (-10%).' })
        }
        ctx.flags.add('in_orbit')
        ctx.log.push({ tone: 'success', text: '¡MendoSat está en órbita!' })
      },
    },
    {
      id: 'deploy',
      label: 'Despliegue y encendido',
      run: (ctx) => {
        if (ctx.flags.has('deploy_mech')) {
          if (ctx.flags.has('tested_full')) {
            ctx.log.push({ tone: 'success', text: 'Los paneles solares se abrieron correctamente.' })
          } else {
            add(ctx, 'energy', -35)
            ctx.log.push({ tone: 'danger', text: 'El frío trabó una bisagra: un panel no se abrió (-35% energía).' })
          }
        }
        if (ctx.flags.has('battery_only')) {
          add(ctx, 'energy', -15)
          ctx.log.push({ tone: 'warning', text: 'Sin paneles, la batería empieza a descargarse en cada vuelta.' })
        }
        if (!ctx.flags.has('tested_full') && !ctx.flags.has('deploy_mech')) {
          add(ctx, 'energy', -5)
          ctx.log.push({ tone: 'warning', text: 'Ciclos de frío y calor afectan la batería (-5%).' })
        }
        if (ctx.res.energy <= 0) {
          ctx.res.energy = 0
          ctx.fatal = 'La batería se agotó antes del primer contacto.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
        }
      },
    },
    {
      id: 'contact',
      label: 'Primer contacto',
      run: (ctx) => {
        if (ctx.flags.has('orbit_iss')) {
          add(ctx, 'comms', -10)
          ctx.log.push({ tone: 'warning', text: 'Órbita baja: los pases sobre Mendoza duran pocos minutos (-10%).' })
        }
        if (ctx.res.comms >= 40) {
          ctx.flags.add('contact')
          ctx.log.push({ tone: 'success', text: '¡Primera señal recibida en la estación de la Universidad de Mendoza!' })
        } else {
          ctx.log.push({ tone: 'danger', text: `Señal muy débil (${ctx.res.comms}%): no se logra un enlace estable.` })
        }
      },
    },
    {
      id: 'science',
      label: 'Mediciones sobre los Andes',
      run: (ctx) => {
        if (!ctx.flags.has('contact')) {
          ctx.log.push({ tone: 'warning', text: 'Sin enlace no se pueden descargar mediciones.' })
          return
        }
        if (ctx.res.energy < 30) {
          ctx.log.push({ tone: 'warning', text: `Energía en ${ctx.res.energy}%: los instrumentos no pueden encenderse.` })
          return
        }
        if (ctx.flags.has('sci_full')) {
          if (ctx.res.comms >= 60) {
            ctx.flags.add('science_full')
            ctx.log.push({ tone: 'success', text: '¡Imágenes de nieve y glaciares de los Andes descargadas!' })
          } else {
            ctx.flags.add('science_mid')
            ctx.log.push({ tone: 'warning', text: 'La cámara funciona, pero el enlace es lento: solo bajan datos de sensores.' })
          }
        } else if (ctx.flags.has('sci_mid')) {
          ctx.flags.add('science_mid')
          ctx.log.push({ tone: 'success', text: 'Datos ambientales de temperatura y radiación recibidos.' })
        } else {
          ctx.log.push({ tone: 'warning', text: 'La baliza confirma que el satélite vive, pero no hay ciencia.' })
        }
        add(ctx, 'energy', -10)
      },
    },
  ],
  objectives: [
    {
      id: 'orbit',
      label: 'Poner MendoSat en órbita',
      check: (c) => c.flags.has('in_orbit'),
      tip: 'Respetá el límite de 2,66 kg y probá el satélite antes de un lanzador que vibra fuerte.',
    },
    {
      id: 'contact',
      label: 'Primer contacto desde Mendoza',
      check: (c) => c.flags.has('contact'),
      tip: 'Elegí una radio más potente o una red de estaciones, y hacé pruebas antes de lanzar.',
    },
    {
      id: 'power',
      label: 'Energía estable (25% o más)',
      check: (c) => c.res.energy >= 25,
      tip: 'Los paneles desplegables dan más energía si hiciste la prueba de termovacío.',
    },
    {
      id: 'science',
      label: 'Imágenes ambientales de los Andes',
      check: (c) => c.flags.has('science_full'),
      tip: 'Llevá la cámara multiespectral y un enlace de al menos 60%.',
    },
  ],
}
