// Laboratorio de sonidos: contrastes priorizados por carga funcional para una hispanohablante
// rioplatense (ver docs/INVESTIGACION.md §4). Cada par: [palabra con el sonido A, palabra con el sonido B].
window.App = window.App || {};
App.datos = App.datos || {};

App.datos.sonidos = [
  {
    id: 'i-I',
    titulo: 'sheep o ship',
    simbolos: ['/iː/', '/ɪ/'],
    ipa: ['i', 'ɪ'], // como los devuelve Azure
    nombres: ['i larga y tensa', 'i corta y relajada'],
    prioridad: 'alta',
    porQue: 'Es el contraste que más significados cambia en inglés (seat/sit, leave/live, feel/fill). En castellano hay una sola "i", así que las dos suelen salir iguales.',
    comoA: 'Como la "i" castellana, pero más larga y con una sonrisa: labios estirados y lengua alta y tensa. Seat, meet, leave.',
    comoB: 'Más corta y floja: la boca casi relajada, a mitad de camino entre "i" y "e". No es una "e", es una "i" perezosa. Sit, live, ship.',
    pares: [
      ['sheep', 'ship'], ['leave', 'live'], ['feel', 'fill'], ['seat', 'sit'], ['heat', 'hit'],
      ['eat', 'it'], ['peel', 'pill'], ['green', 'grin'], ['team', 'Tim'], ['steal', 'still'],
      ['reach', 'rich'], ['cheap', 'chip'], ['meal', 'mill'], ['least', 'list'], ['sleep', 'slip'],
    ],
    frases: [
      { en: 'Is this seat free? Can I sit here?', es: '¿Está libre este asiento? ¿Me puedo sentar?' },
      { en: 'I live in Buenos Aires, but I leave tomorrow.', es: 'Vivo en Buenos Aires, pero me voy mañana.' },
      { en: 'Is breakfast included in the price?', es: '¿El desayuno está incluido en el precio?' },
    ],
  },
  {
    id: 'ae-V',
    titulo: 'cat o cut',
    simbolos: ['/æ/', '/ʌ/'],
    ipa: ['æ', 'ʌ'],
    nombres: ['a abierta, entre a y e', 'a corta y central'],
    prioridad: 'alta',
    porQue: 'Las dos suelen salir como la "a" castellana, y entonces bag y bug, o cap y cup, suenan igual.',
    comoA: 'Abrí bien la boca, como para decir "a", pero con la lengua adelante, como si fueras a decir "e". Cat, bag, black.',
    comoB: 'Una "a" corta y floja, con la boca a medio abrir y la lengua en el medio. Es el sonido de "uh". Cut, bug, cup.',
    pares: [
      ['cat', 'cut'], ['bag', 'bug'], ['cap', 'cup'], ['hat', 'hut'], ['ran', 'run'],
      ['match', 'much'], ['fan', 'fun'], ['bat', 'but'], ['track', 'truck'], ['lack', 'luck'],
      ['staff', 'stuff'], ['ankle', 'uncle'], ['cash', 'crush'], ['carry', 'curry'],
    ],
    frases: [
      { en: 'Could I get a cup of black coffee?', es: '¿Me das una taza de café negro?' },
      { en: 'My bag is the black one.', es: 'Mi valija es la negra.' },
      { en: 'Can I pay in cash? Thanks so much.', es: '¿Puedo pagar en efectivo? Muchas gracias.' },
    ],
  },
  {
    id: 'b-v',
    titulo: 'berry o very',
    simbolos: ['/b/', '/v/'],
    ipa: ['b', 'v'],
    nombres: ['b con los dos labios', 'v con dientes y labio'],
    prioridad: 'media-alta',
    porQue: 'En castellano la b y la v suenan igual. En inglés son sonidos distintos y cambian el significado (best/vest, boat/vote).',
    comoA: 'Los dos labios se juntan y se abren de golpe. Best, boat, bag.',
    comoB: 'Los dientes de arriba apoyados en el labio de abajo, y que vibre. Se puede sostener: vvvvery. Vacation, visit, view.',
    pares: [
      ['berry', 'very'], ['best', 'vest'], ['ban', 'van'], ['boat', 'vote'], ['bet', 'vet'],
      ['base', 'vase'], ['bolt', 'volt'], ['curb', 'curve'], ['bent', 'vent'],
    ],
    frases: [
      { en: "I'm here on vacation. It's a very beautiful view.", es: 'Estoy de vacaciones. Es una vista muy linda.' },
      { en: 'This is my first visit. The best trip ever.', es: 'Es mi primera visita. El mejor viaje.' },
      { en: 'Do you have a room with a view?', es: '¿Tienen una habitación con vista?' },
    ],
  },
  {
    id: 'y-j',
    titulo: 'yes o Jess',
    simbolos: ['/j/', '/dʒ/'],
    ipa: ['j', 'dʒ'],
    nombres: ['y suave (como en "hielo")', 'y con golpe (como "ch" sonora)'],
    prioridad: 'media-alta',
    porQue: 'El "sh" porteño (yo = "sho") se cuela en el inglés: "yes" sale "shes" y "you" sale "shu". Además se mezcla con /dʒ/: yet y jet, yellow y jello.',
    comoA: 'Como la "i" de "hielo" o "tiene", pegada a la vocal que sigue. Sin "sh" y sin fricción. Yes, you, year.',
    comoB: 'Como una "ch" pero con la voz: la lengua toca arriba y se suelta con un pequeño golpe. Job, Jess, juice.',
    pares: [
      ['yes', 'Jess'], ['yet', 'jet'], ['yellow', 'jello'], ['year', 'jeer'], ['yam', 'jam'],
      ['yolk', 'joke'], ['Yale', 'jail'], ['use', 'juice'],
    ],
    frases: [
      { en: "Yes, I'd like an orange juice, please.", es: 'Sí, quiero un jugo de naranja.' },
      { en: "You're from New York? Me too, this year!", es: '¿Sos de Nueva York? ¡Yo también, este año!' },
      { en: "I haven't checked in yet. Is the jet on time?", es: 'Todavía no hice el check-in. ¿El avión está en horario?' },
    ],
  },
];
