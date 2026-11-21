// Arsenal para defenderse: frases armadas por situación. Cada una se escucha, se traduce, se practica en voz
// alta y se puede sumar al repaso. "…" marca el hueco que se completa con lo propio.
window.App = window.App || {};
App.datos = App.datos || {};

App.datos.arsenal = [
  {
    id: 'no-entiendo', titulo: 'Cuando no entendés', emoji: '🤔',
    frases: [
      { en: 'Sorry, could you repeat that?', es: 'Perdón, ¿podés repetir?' },
      { en: 'Could you speak a bit more slowly?', es: '¿Podés hablar un poco más despacio?' },
      { en: "Sorry, I don't understand.", es: 'Perdón, no entiendo.' },
      { en: 'What does … mean?', es: '¿Qué significa…?' },
      { en: 'Could you write it down, please?', es: '¿Me lo podés escribir, por favor?' },
      { en: 'Do you mean…?', es: '¿Querés decir…?' },
    ],
  },
  {
    id: 'ganar-tiempo', titulo: 'Para ganar tiempo', emoji: '⏳',
    frases: [
      { en: 'Let me think…', es: 'Dejame pensar…' },
      { en: 'Just a moment, please.', es: 'Un momento, por favor.' },
      { en: "How do you say … in English?", es: '¿Cómo se dice … en inglés?' },
      { en: "I'm not sure, but I think…", es: 'No estoy segura, pero creo que…' },
      { en: "It's like a…", es: 'Es como un…' },
    ],
  },
  {
    id: 'orientarse', titulo: 'Preguntar dónde y cómo llegar', emoji: '🧭',
    frases: [
      { en: 'Excuse me, where is…?', es: 'Disculpe, ¿dónde está…?' },
      { en: 'How do I get to…?', es: '¿Cómo llego a…?' },
      { en: 'Is there a … near here?', es: '¿Hay un/a … cerca?' },
      { en: 'Is it far from here?', es: '¿Queda lejos de acá?' },
      { en: 'Can I walk there?', es: '¿Se puede ir caminando?' },
      { en: 'Which bus goes to…?', es: '¿Qué colectivo va a…?' },
    ],
  },
  {
    id: 'pedir', titulo: 'Pedir y comprar', emoji: '🛍️',
    frases: [
      { en: 'Could I have…, please?', es: '¿Me da…, por favor?' },
      { en: "I'd like…", es: 'Quisiera…' },
      { en: 'Do you have…?', es: '¿Tienen…?' },
      { en: 'How much is it?', es: '¿Cuánto sale?' },
      { en: 'Can I pay by card?', es: '¿Puedo pagar con tarjeta?' },
      { en: "I'm just looking, thanks.", es: 'Solo estoy mirando, gracias.' },
      { en: 'Could we have the bill, please?', es: '¿Nos trae la cuenta, por favor?' },
    ],
  },
  {
    id: 'problemas', titulo: 'Problemas y reclamos', emoji: '🛠️',
    frases: [
      { en: "There's a problem with…", es: 'Hay un problema con…' },
      { en: "The … doesn't work.", es: 'El/la … no funciona.' },
      { en: "I think there's a mistake.", es: 'Creo que hay un error.' },
      { en: 'I ordered…, but I got…', es: 'Pedí…, pero me trajeron…' },
      { en: 'Could you help me, please?', es: '¿Me podría ayudar, por favor?' },
      { en: 'I lost my…', es: 'Perdí mi…' },
      { en: 'Is it possible to…?', es: '¿Se puede…?' },
    ],
  },
  {
    id: 'charla', titulo: 'Charlar y opinar', emoji: '💬',
    frases: [
      { en: 'I think…', es: 'Creo que…' },
      { en: 'I agree.', es: 'Estoy de acuerdo.' },
      { en: "I'm not sure.", es: 'No estoy segura.' },
      { en: 'That sounds great!', es: '¡Suena genial!' },
      { en: 'Me too.', es: 'Yo también.' },
      { en: 'Me neither.', es: 'Yo tampoco.' },
      { en: 'What about you?', es: '¿Y vos?' },
      { en: 'Really? Tell me more.', es: '¿En serio? Contame más.' },
    ],
  },
  {
    id: 'salud', titulo: 'Salud y emergencias', emoji: '🩺',
    frases: [
      { en: "I don't feel well.", es: 'No me siento bien.' },
      { en: "Where's the nearest pharmacy?", es: '¿Dónde está la farmacia más cercana?' },
      { en: "I'm allergic to…", es: 'Soy alérgica a…' },
      { en: 'It hurts here.', es: 'Me duele acá.' },
      { en: 'Could you call a doctor, please?', es: '¿Podría llamar a un médico, por favor?' },
      { en: 'I need help.', es: 'Necesito ayuda.' },
    ],
  },
  {
    id: 'cortesia', titulo: 'Agradecer y despedirse', emoji: '🙌',
    frases: [
      { en: 'Thank you so much for your help.', es: 'Muchísimas gracias por tu ayuda.' },
      { en: "That's very kind of you.", es: 'Muy amable de tu parte.' },
      { en: 'Nice talking to you.', es: 'Fue un gusto charlar.' },
      { en: 'Have a nice day!', es: '¡Que tengas un lindo día!' },
      { en: 'See you later!', es: '¡Nos vemos!' },
    ],
  },
];
