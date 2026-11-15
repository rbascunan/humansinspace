import type { Mission, SimContext } from './types'
import { mendosat, moonbase } from './missions-extra'

function add(ctx: SimContext, key: keyof SimContext['res'], delta: number) {
  ctx.res[key] = Math.round(ctx.res[key] + delta)
}

const usat1: Mission = {
  id: 'usat1',
  code: 'MISIÓN 03',
  title: 'Recuperar el satélite USAT-1',
  org: 'Universidad Nacional de La Plata (UNLP)',
  logo: '/logos/unlp.png',
  vehicle: 'Satélite USAT-1',
  location: 'Órbita baja terrestre',
  image: '/missions/usat1.png',
  summary:
    'El USAT-1 dejó de responder (falla simulada). Diagnosticá el problema, administrá su batería y recuperá sus datos científicos.',
  objective: 'Recuperar la comunicación con el satélite y descargar su información científica.',
  problem: 'La energía disponible es limitada: cada operación gasta batería y hay que priorizar.',
  expected: 'Restablecer el contacto, encontrar la causa y descargar los datos sin apagar el satélite.',
  interests: ['tecnologia', 'ciencia', 'construccion', 'musica'],
  difficulty: 'Inicial',
  playable: true,
  resources: [
    { key: 'budget', start: 50, max: 50, unit: 'k USD' },
    { key: 'energy', start: 100, max: 100, unit: '%' },
    { key: 'comms', start: 15, max: 100, unit: '%' },
  ],
  decisions: [
    {
      id: 'diagnose',
      question: '¿Qué sistema revisás primero?',
      hint: 'Un buen diagnóstico ahorra energía después.',
      conceptId: 'satelite',
      options: [
        {
          id: 'power',
          label: 'Telemetría de energía',
          description: 'Leer el estado de paneles solares y batería.',
          pros: 'Consume poco y apunta a la causa más común.',
          cons: 'Cuesta algo de presupuesto de análisis.',
          effects: { budget: -5, energy: -5 },
          flags: ['diag_power'],
        },
        {
          id: 'radio',
          label: 'Transmisor de radio',
          description: 'Probar si la radio del satélite responde.',
          pros: 'Descarta problemas de antena.',
          cons: 'Gasta más energía y puede no ser la causa.',
          effects: { budget: -5, energy: -10 },
          flags: ['diag_radio'],
        },
        {
          id: 'reboot',
          label: 'Reiniciar la computadora',
          description: 'Enviar una orden de reinicio completo.',
          pros: 'Barato y limpia errores de software.',
          cons: 'Consume mucha batería y no encuentra la causa.',
          effects: { budget: -2, energy: -25, comms: 5 },
          flags: ['reboot'],
        },
      ],
    },
    {
      id: 'tx',
      question: '¿Cuánta energía le das al transmisor?',
      hint: 'Más potencia = señal más fuerte, pero menos batería.',
      conceptId: 'comunicacion',
      options: [
        {
          id: 'low',
          label: 'Baja (10%)',
          description: 'Transmitir con potencia mínima.',
          pros: 'Cuida la batería.',
          cons: 'Señal débil: puede no llegar a Tierra.',
          effects: { energy: -10, comms: 10 },
          flags: ['tx_low'],
        },
        {
          id: 'mid',
          label: 'Media (25%)',
          description: 'Potencia equilibrada.',
          pros: 'Buena señal sin vaciar la batería.',
          cons: 'Consumo moderado.',
          effects: { energy: -25, comms: 25 },
          flags: ['tx_mid'],
        },
        {
          id: 'high',
          label: 'Máxima (50%)',
          description: 'Toda la potencia a la radio.',
          pros: 'La señal más fuerte posible.',
          cons: 'Gasta media batería y recalienta el equipo.',
          effects: { energy: -50, comms: 40 },
          flags: ['tx_high'],
        },
      ],
    },
    {
      id: 'attitude',
      question: '¿Cómo orientás el satélite y su antena?',
      hint: 'La orientación afecta la señal Y la carga solar.',
      conceptId: 'orbita',
      options: [
        {
          id: 'point',
          label: 'Apuntar a la estación terrena',
          description: 'Girar el satélite para mirar a Tierra y al Sol entre contactos.',
          pros: 'Mejor señal y los paneles vuelven a cargar.',
          cons: 'La maniobra consume energía.',
          effects: { energy: -10, comms: 25 },
          flags: ['att_point'],
        },
        {
          id: 'spin',
          label: 'Giro lento de barrido',
          description: 'Rotar despacio para que la antena pase por la Tierra.',
          pros: 'Consume poco.',
          cons: 'Señal intermitente y carga solar parcial.',
          effects: { energy: -5, comms: 10 },
          flags: ['att_spin'],
        },
        {
          id: 'none',
          label: 'No mover nada',
          description: 'Dejar el satélite como está.',
          pros: 'No gasta energía ahora.',
          cons: 'Sigue girando sin control: la batería no se recupera.',
          effects: {},
          flags: ['att_none'],
        },
      ],
    },
    {
      id: 'station',
      question: '¿Qué estación terrena usás para escuchar?',
      hint: 'Más pases de contacto = más oportunidades.',
      conceptId: 'estacion-terrena',
      options: [
        {
          id: 'own',
          label: 'Estación propia (UNLP)',
          description: 'Una antena universitaria, 1 pase de contacto.',
          pros: 'Gratis.',
          cons: 'Una sola oportunidad de contacto.',
          effects: { comms: 5 },
          flags: ['gs_own'],
        },
        {
          id: 'network',
          label: 'Red de radioaficionados',
          description: 'Estaciones de voluntarios en todo el mundo, 3 pases.',
          pros: 'Muchas oportunidades de contacto.',
          cons: 'Cuesta coordinar la red.',
          effects: { budget: -10, comms: 15 },
          flags: ['gs_network'],
        },
        {
          id: 'big',
          label: 'Antena de gran ganancia',
          description: 'Alquilar una antena profesional, 2 pases.',
          pros: 'La mejor recepción.',
          cons: 'Muy cara.',
          effects: { budget: -35, comms: 30 },
          flags: ['gs_big'],
        },
      ],
    },
    {
      id: 'data',
      question: '¿Qué información recuperás primero?',
      hint: 'Los archivos grandes necesitan más energía y mejor señal.',
      conceptId: 'datos',
      options: [
        {
          id: 'health',
          label: 'Salud del satélite primero',
          description: 'Datos pequeños de estado; luego ciencia si sobra energía.',
          pros: 'Seguro y permite planificar.',
          cons: 'Los datos científicos quedan para después.',
          effects: {},
          flags: ['data_health'],
        },
        {
          id: 'compressed',
          label: 'Ciencia comprimida',
          description: 'Un paquete científico reducido.',
          pros: 'Balance entre valor y consumo.',
          cons: 'Se pierde algo de detalle.',
          effects: {},
          flags: ['data_compressed'],
        },
        {
          id: 'full',
          label: 'Todos los datos científicos',
          description: 'El archivo completo, sin compresión.',
          pros: 'Máximo valor científico.',
          cons: 'Necesita mucha energía y una señal muy fuerte.',
          effects: {},
          flags: ['data_full'],
        },
      ],
    },
  ],
  phases: [
    {
      id: 'contact',
      label: 'Ventana de contacto',
      run: (ctx) => {
        const passes = ctx.flags.has('gs_own') ? 1 : ctx.flags.has('gs_network') ? 3 : 2
        for (let i = 1; i <= passes; i++) {
          if (ctx.res.comms >= 50) {
            ctx.flags.add('contact')
            ctx.log.push({
              tone: 'success',
              text: `Pase ${i}: ¡señal recibida! Enlace al ${ctx.res.comms}%.`,
            })
            return
          }
          add(ctx, 'energy', -8)
          add(ctx, 'comms', 8)
          ctx.log.push({
            tone: 'warning',
            text: `Pase ${i}: señal demasiado débil (${ctx.res.comms - 8}%). El satélite gastó energía intentando transmitir.`,
          })
        }
        if (ctx.res.comms >= 50) {
          ctx.flags.add('contact')
          ctx.log.push({ tone: 'success', text: 'Último intento: ¡contacto establecido!' })
          return
        }
        ctx.fatal = `No se logró contacto: la señal llegó al ${ctx.res.comms}% y se necesita al menos 50%.`
        ctx.log.push({ tone: 'danger', text: ctx.fatal })
      },
    },
    {
      id: 'diagnosis',
      label: 'Diagnóstico remoto',
      run: (ctx) => {
        if (ctx.flags.has('diag_power')) {
          ctx.flags.add('fault_found')
          ctx.log.push({
            tone: 'success',
            text: 'Causa encontrada: el satélite gira sin control y sus paneles no reciben sol. La batería entró en modo seguro.',
          })
        } else if (ctx.flags.has('diag_radio')) {
          add(ctx, 'energy', -10)
          ctx.log.push({
            tone: 'warning',
            text: 'La radio funciona bien. La causa estaba en la energía: se perdió tiempo y batería buscando en el lugar equivocado.',
          })
        } else {
          if (ctx.res.energy < 40) {
            add(ctx, 'energy', -15)
            ctx.log.push({
              tone: 'danger',
              text: 'El reinicio con batería baja provocó un pico de consumo. La causa real sigue sin conocerse.',
            })
          } else {
            ctx.log.push({
              tone: 'warning',
              text: 'El reinicio limpió errores de software, pero no explica por qué se perdió el contacto.',
            })
          }
        }
      },
    },
    {
      id: 'power',
      label: 'Estabilizar energía',
      run: (ctx) => {
        if (ctx.flags.has('att_point')) {
          const gain = ctx.flags.has('fault_found') ? 35 : 20
          add(ctx, 'energy', gain)
          ctx.log.push({
            tone: 'success',
            text: `Los paneles vuelven a mirar al Sol: la batería recupera +${gain}%.`,
          })
        } else if (ctx.flags.has('att_spin')) {
          add(ctx, 'energy', 12)
          ctx.log.push({ tone: 'info', text: 'El giro lento da sol a ratos: la batería recupera +12%.' })
        } else {
          add(ctx, 'energy', -12)
          ctx.log.push({
            tone: 'danger',
            text: 'El satélite sigue girando sin control: la batería baja otro 12%.',
          })
        }
        if (ctx.flags.has('tx_high')) {
          add(ctx, 'energy', -10)
          ctx.log.push({ tone: 'warning', text: 'El transmisor a máxima potencia se recalienta: -10% de batería.' })
        }
        if (ctx.res.energy <= 0) {
          ctx.res.energy = 0
          ctx.fatal = 'Batería agotada: el satélite se apagó antes de descargar los datos.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
        }
      },
    },
    {
      id: 'download',
      label: 'Descarga de datos',
      run: (ctx) => {
        if (ctx.flags.has('data_health')) {
          add(ctx, 'energy', -10)
          ctx.log.push({ tone: 'success', text: 'Telemetría de salud descargada (-10% batería).' })
          if (ctx.res.energy >= 35) {
            add(ctx, 'energy', -20)
            ctx.flags.add('got_science')
            ctx.log.push({
              tone: 'success',
              text: 'Con la energía que sobraba descargaste un paquete científico comprimido (-20%).',
            })
          } else {
            ctx.log.push({ tone: 'warning', text: 'No alcanzó la energía para bajar datos científicos.' })
          }
        } else if (ctx.flags.has('data_compressed')) {
          if (ctx.res.energy >= 25) {
            add(ctx, 'energy', -25)
            ctx.flags.add('got_science')
            ctx.log.push({ tone: 'success', text: 'Paquete científico comprimido descargado (-25%).' })
          } else {
            add(ctx, 'energy', -ctx.res.energy)
            ctx.log.push({ tone: 'danger', text: 'La descarga se cortó: no había energía suficiente.' })
          }
        } else {
          if (ctx.res.comms < 75) {
            add(ctx, 'energy', -30)
            ctx.log.push({
              tone: 'danger',
              text: `El enlace (${ctx.res.comms}%) no soporta un archivo tan grande: la descarga se cortó a la mitad (-30%).`,
            })
          } else if (ctx.res.energy >= 45) {
            add(ctx, 'energy', -45)
            ctx.flags.add('got_science')
            ctx.log.push({ tone: 'success', text: '¡Archivo científico completo descargado! (-45%).' })
          } else {
            add(ctx, 'energy', -ctx.res.energy)
            ctx.log.push({ tone: 'danger', text: 'La batería se agotó durante la descarga completa.' })
          }
        }
        if (ctx.res.energy <= 0) {
          ctx.res.energy = 0
          ctx.log.push({ tone: 'danger', text: 'El satélite quedó sin batería.' })
        }
      },
    },
    {
      id: 'status',
      label: 'Estado final',
      run: (ctx) => {
        if (ctx.res.energy >= 20) {
          ctx.flags.add('sat_alive')
          ctx.log.push({
            tone: 'success',
            text: `El USAT-1 queda operativo con ${ctx.res.energy}% de batería para futuros contactos.`,
          })
        } else {
          ctx.log.push({
            tone: 'warning',
            text: `Batería en ${ctx.res.energy}%: el satélite vuelve a modo seguro.`,
          })
        }
      },
    },
  ],
  objectives: [
    {
      id: 'contact',
      label: 'Restablecer la comunicación',
      check: (c) => c.flags.has('contact'),
      tip: 'Sumá señal: más potencia, apuntar la antena o una estación terrena con más pases.',
    },
    {
      id: 'fault',
      label: 'Identificar la causa de la falla',
      check: (c) => c.flags.has('fault_found'),
      tip: 'La causa más común en satélites pequeños es la energía: revisá esa telemetría primero.',
    },
    {
      id: 'science',
      label: 'Recuperar datos científicos',
      check: (c) => c.flags.has('got_science'),
      tip: 'Los archivos grandes necesitan energía y una señal muy fuerte. Probá datos comprimidos.',
    },
    {
      id: 'alive',
      label: 'Dejar el satélite operativo (batería 20% o más)',
      check: (c) => c.flags.has('sat_alive'),
      tip: 'Orientá los paneles hacia el Sol y evitá la potencia máxima si no la necesitás.',
    },
  ],
}

const mars: Mission = {
  id: 'mars',
  code: 'MISIÓN 01',
  title: 'Llegar a Marte',
  org: 'Inspirada en SpaceX',
  logo: '/logos/spacex.png',
  vehicle: 'Starship',
  location: 'Tierra → Marte',
  image: '/missions/mars.png',
  summary:
    'Prepará una nave para el viaje a Marte: combustible, carga, energía, trayectoria y protección de la tripulación.',
  objective: 'Llegar a Marte, aterrizar y dejar instalados los instrumentos científicos.',
  problem: 'El combustible es limitado y el exceso de carga puede comprometer toda la misión.',
  expected: 'Aterrizar en Marte con la tripulación a salvo y los instrumentos funcionando.',
  interests: ['montana', 'negocios', 'deportes', 'tecnologia', 'ciencia'],
  difficulty: 'Intermedia',
  playable: true,
  resources: [
    { key: 'budget', start: 600, max: 600, unit: 'M USD' },
    { key: 'fuel', start: 0, max: 1200, unit: 't' },
    { key: 'mass', start: 0, max: 100, unit: 't', limitIsCeiling: true },
    { key: 'energy', start: 0, max: 100, unit: '%' },
    { key: 'survival', start: 50, max: 100, unit: '%' },
  ],
  decisions: [
    {
      id: 'fuel',
      question: '¿Cuánto combustible cargás?',
      hint: 'Más combustible cuesta más, pero da margen para aterrizar.',
      conceptId: 'combustible',
      options: [
        {
          id: 'f900',
          label: '900 toneladas',
          description: 'Carga económica.',
          pros: 'Ahorra presupuesto.',
          cons: 'Poco margen para imprevistos.',
          effects: { budget: -120, fuel: 900 },
        },
        {
          id: 'f1050',
          label: '1050 toneladas',
          description: 'Carga equilibrada.',
          pros: 'Margen razonable.',
          cons: 'Costo medio.',
          effects: { budget: -150, fuel: 1050 },
        },
        {
          id: 'f1200',
          label: '1200 toneladas (tanque lleno)',
          description: 'Máxima capacidad.',
          pros: 'El mayor margen posible.',
          cons: 'La opción más cara.',
          effects: { budget: -180, fuel: 1200 },
        },
      ],
    },
    {
      id: 'payload',
      question: '¿Cuánta carga científica llevás?',
      hint: 'El límite de la nave es 100 toneladas en total.',
      conceptId: 'masa',
      options: [
        {
          id: 'light',
          label: 'Ligera (40 t)',
          description: 'Instrumentos básicos.',
          pros: 'Ahorra combustible.',
          cons: 'Poca ciencia en Marte.',
          effects: { budget: -60, mass: 40 },
          flags: ['sci_low'],
        },
        {
          id: 'mid',
          label: 'Completa (75 t)',
          description: 'Laboratorio y vehículo explorador.',
          pros: 'Ciencia completa.',
          cons: 'Más combustible necesario.',
          effects: { budget: -110, mass: 75 },
          flags: ['sci_mid'],
        },
        {
          id: 'heavy',
          label: 'Máxima (115 t)',
          description: 'Todo lo posible, incluso repuestos.',
          pros: 'Máximo equipamiento.',
          cons: 'Supera el límite de la nave.',
          effects: { budget: -160, mass: 115 },
          flags: ['sci_high'],
        },
      ],
    },
    {
      id: 'trajectory',
      question: '¿Qué trayectoria elegís?',
      hint: 'Rápido gasta más combustible; lento expone más a la tripulación.',
      conceptId: 'orbita',
      options: [
        {
          id: 'hohmann',
          label: 'Eficiente (9 meses)',
          description: 'Órbita de transferencia clásica.',
          pros: 'Usa menos combustible.',
          cons: 'Más tiempo expuestos a la radiación.',
          effects: {},
          flags: ['traj_slow'],
        },
        {
          id: 'fast',
          label: 'Rápida (6 meses)',
          description: 'Ruta directa con más impulso.',
          pros: 'La tripulación sufre menos.',
          cons: 'Consume mucho más combustible.',
          effects: { budget: -40 },
          flags: ['traj_fast'],
        },
      ],
    },
    {
      id: 'power',
      question: '¿Qué sistema de energía usás?',
      hint: 'La energía mantiene vivos a la tripulación y a los instrumentos.',
      conceptId: 'energia',
      options: [
        {
          id: 'solar',
          label: 'Paneles solares',
          description: 'Energía del Sol.',
          pros: 'Costo moderado.',
          cons: 'Rinden menos lejos del Sol.',
          effects: { budget: -50, energy: 70, mass: 5 },
        },
        {
          id: 'nuclear',
          label: 'Generador nuclear (RTG)',
          description: 'Energía constante por años.',
          pros: 'Máxima energía.',
          cons: 'Muy caro y pesado.',
          effects: { budget: -120, energy: 100, mass: 8 },
        },
        {
          id: 'battery',
          label: 'Solo baterías',
          description: 'Baterías cargadas en la Tierra.',
          pros: 'Barato y liviano.',
          cons: 'Se agotan en el viaje.',
          effects: { budget: -15, energy: 35, mass: 3 },
        },
      ],
    },
    {
      id: 'protection',
      question: '¿Qué protección tiene la tripulación?',
      hint: 'Sin protección, la radiación espacial es peligrosa.',
      conceptId: 'traje',
      options: [
        {
          id: 'shield',
          label: 'Refugio anti-radiación',
          description: 'Escudo de agua alrededor de la cabina.',
          pros: 'Máxima seguridad.',
          cons: 'Caro y suma 10 t.',
          effects: { budget: -80, mass: 10, survival: 35 },
        },
        {
          id: 'basic',
          label: 'Trajes y blindaje básico',
          description: 'Protección estándar.',
          pros: 'Liviano y barato.',
          cons: 'Protección media.',
          effects: { budget: -25, mass: 3, survival: 15 },
        },
        {
          id: 'none',
          label: 'Sin protección extra',
          description: 'Confiar en la estructura de la nave.',
          pros: 'No cuesta nada.',
          cons: 'Riesgo alto para la tripulación.',
          effects: {},
        },
      ],
    },
  ],
  phases: [
    {
      id: 'launch',
      label: 'Lanzamiento',
      run: (ctx) => {
        if (ctx.res.mass > 100) {
          const extra = (ctx.res.mass - 100) * 4
          add(ctx, 'fuel', -extra)
          ctx.log.push({
            tone: 'danger',
            text: `¡Exceso de carga! ${ctx.res.mass - 100} t sobre el límite: los motores queman ${extra} t de combustible extra.`,
          })
        }
        add(ctx, 'fuel', -150)
        ctx.log.push({ tone: 'info', text: 'Despegue exitoso. El ascenso a órbita consumió 150 t de combustible.' })
      },
    },
    {
      id: 'cruise',
      label: 'Viaje interplanetario',
      run: (ctx) => {
        const fast = ctx.flags.has('traj_fast')
        const needed = (fast ? 700 : 500) + ctx.res.mass * 2
        add(ctx, 'fuel', -needed)
        ctx.log.push({
          tone: 'info',
          text: `Encendido de transferencia hacia Marte: ${needed} t de combustible (depende de la ruta y la masa).`,
        })
        const radiation = fast ? 10 : 30
        add(ctx, 'survival', -radiation)
        ctx.log.push({
          tone: radiation > 20 ? 'warning' : 'info',
          text: `${fast ? '6' : '9'} meses de viaje: la radiación reduce la supervivencia ${radiation}%.`,
        })
        if (ctx.res.energy < 50) {
          add(ctx, 'survival', -15)
          ctx.log.push({ tone: 'warning', text: 'Energía baja: el soporte vital funciona al mínimo (-15% supervivencia).' })
        }
        add(ctx, 'energy', fast ? -20 : -35)
        if (ctx.res.fuel < 0) {
          ctx.res.fuel = 0
          ctx.fatal = 'Combustible agotado en el espacio profundo: la nave no alcanzó Marte.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
          return
        }
        ctx.flags.add('reached')
        ctx.log.push({ tone: 'success', text: '¡Marte a la vista! La nave entra en órbita marciana.' })
      },
    },
    {
      id: 'landing',
      label: 'Aterrizaje',
      run: (ctx) => {
        if (ctx.res.fuel >= 120) {
          add(ctx, 'fuel', -120)
          ctx.flags.add('landed')
          ctx.log.push({ tone: 'success', text: 'Frenado y aterrizaje suave (-120 t). ¡Tocaste suelo marciano!' })
        } else {
          ctx.log.push({
            tone: 'danger',
            text: `Solo quedan ${ctx.res.fuel} t y se necesitan 120 t para aterrizar: la nave queda en órbita.`,
          })
        }
        if (ctx.res.survival <= 0) {
          ctx.res.survival = 0
          ctx.fatal = 'La tripulación no sobrevivió al viaje: faltó protección y energía.'
          ctx.log.push({ tone: 'danger', text: ctx.fatal })
        }
        if (ctx.res.energy < 0) ctx.res.energy = 0
      },
    },
    {
      id: 'science',
      label: 'Instalar instrumentos',
      run: (ctx) => {
        if (!ctx.flags.has('landed')) {
          ctx.log.push({ tone: 'warning', text: 'Sin aterrizaje no se pueden instalar los instrumentos.' })
          return
        }
        if (ctx.res.energy < 30) {
          ctx.log.push({ tone: 'warning', text: `Energía en ${ctx.res.energy}%: no alcanza para encender los instrumentos.` })
          return
        }
        if (ctx.flags.has('sci_low')) {
          ctx.log.push({ tone: 'warning', text: 'Instrumentos básicos instalados, pero falta el laboratorio completo.' })
          return
        }
        ctx.flags.add('science_full')
        ctx.log.push({ tone: 'success', text: '¡Laboratorio y vehículo explorador funcionando en Marte!' })
      },
    },
  ],
  objectives: [
    {
      id: 'reached',
      label: 'Llegar a Marte',
      check: (c) => c.flags.has('reached'),
      tip: 'Más combustible o menos carga. La ruta eficiente consume menos.',
    },
    {
      id: 'landed',
      label: 'Aterrizar de forma segura',
      check: (c) => c.flags.has('landed'),
      tip: 'Guardá al menos 120 t de combustible para el aterrizaje.',
    },
    {
      id: 'crew',
      label: 'Tripulación a salvo (supervivencia 40% o más)',
      check: (c) => c.res.survival >= 40,
      tip: 'Sumá protección anti-radiación o elegí la ruta rápida.',
    },
    {
      id: 'science',
      label: 'Instrumentos científicos completos',
      check: (c) => c.flags.has('science_full'),
      tip: 'Llevá la carga completa y una fuente de energía que dure el viaje.',
    },
  ],
}

export const MISSIONS: Mission[] = [usat1, mars, moonbase, mendosat]

export function getMission(id: string) {
  return MISSIONS.find((m) => m.id === id)
}
