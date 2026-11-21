// Arrancar a hablar: preguntas típicas de viaje y charla. Para cada una, el eco (el comienzo de
// la respuesta que sale de la propia pregunta), qué tiene que aparecer para que cuente y un ejemplo
// completo con eco + dato + extra.
window.App = window.App || {};
App.datos = App.datos || {};

App.datos.arrancar = [
  { id: 'from', q: 'Where are you from?', tr: '¿De dónde sos?', eco: "I'm from…", como: 'are you → I am',
    eco_req: [["i'm from", 'i am from', 'from']], ejemplo: "I'm from Argentina. I live in Buenos Aires. And you?" },
  { id: 'live', q: 'Where do you live?', tr: '¿Dónde vivís?', eco: 'I live in…', como: 'do you live → I live',
    eco_req: [['i live', 'live in']], ejemplo: 'I live in Buenos Aires, in Palermo. It\'s a nice area.' },
  { id: 'do', q: 'What do you do?', tr: '¿A qué te dedicás?', eco: "I'm a… / I work as…", como: 'do you do → I work / I am',
    eco_req: [["i'm a", 'i am a', "i'm an", 'i am an', 'i work', 'i study']], ejemplo: "I'm a designer. I work from home, so I can travel a lot." },
  { id: 'first', q: 'Is this your first time here?', tr: '¿Es tu primera vez acá?', eco: "Yes, it is. / No, it isn't.", como: 'is this → it is',
    eco_req: [['yes', 'no', 'it is', "it's", "it isn't"]], ejemplo: "Yes, it's my first time. I love it!" },
  { id: 'long', q: 'How long are you staying?', tr: '¿Cuánto tiempo te quedás?', eco: "I'm staying for…", como: 'are you staying → I am staying',
    eco_req: [["i'm staying", 'i am staying', 'staying', 'for']], ejemplo: "I'm staying for two weeks. Then we're going to Rome." },
  { id: 'like', q: 'Do you like it here?', tr: '¿Te gusta estar acá?', eco: "Yes, I do. / No, I don't.", como: 'do you like → I do / I like',
    eco_req: [['i do', 'i like', 'i love', 'yes', 'no']], ejemplo: 'Yes, I do. The food is amazing and the people are very friendly.' },
  { id: 'tomorrow', q: 'What are you going to do tomorrow?', tr: '¿Qué vas a hacer mañana?', eco: "I'm going to…", como: 'are you going to → I am going to',
    eco_req: [["i'm going to", 'i am going to', 'going to', 'gonna']], ejemplo: "I'm going to visit the old town and maybe a museum." },
  { id: 'yesterday', q: 'What did you do yesterday?', tr: '¿Qué hiciste ayer?', eco: 'Yesterday I… (verbo en pasado)', como: 'did you do → I + pasado',
    eco_req: [['went', 'visited', 'walked', 'saw', 'had', 'ate', 'stayed', 'took', 'did', 'was']], ejemplo: 'Yesterday I went to the beach. It was beautiful, but very hot.' },
  { id: 'food', q: "What's your favorite food?", tr: '¿Cuál es tu comida favorita?', eco: 'My favorite food is…', como: 'your → my',
    eco_req: [['my favorite', 'my favourite', 'favorite', 'favourite', 'i love', 'i like']], ejemplo: 'My favorite food is pasta. I eat it every week!' },
  { id: 'travel', q: 'Who are you traveling with?', tr: '¿Con quién viajás?', eco: "I'm traveling with…", como: 'are you traveling → I am traveling',
    eco_req: [["i'm traveling", 'i am traveling', "i'm travelling", 'traveling with', 'travelling with', 'with']], ejemplo: "I'm traveling with my boyfriend. It's our first big trip together." },
  { id: 'weekend', q: 'What do you usually do on weekends?', tr: '¿Qué hacés normalmente los fines de semana?', eco: 'I usually…', como: 'do you usually do → I usually',
    eco_req: [['i usually', 'usually', 'i like', 'i go', 'i meet', 'i stay']], ejemplo: 'I usually meet my friends and cook at home. On Sundays I rest.' },
  { id: 'spanish', q: 'Do you speak any other languages?', tr: '¿Hablás otros idiomas?', eco: 'Yes, I do. I speak…', como: 'do you speak → I speak',
    eco_req: [['i speak', 'i do', 'yes', 'spanish', 'a little']], ejemplo: "Yes, I do. I speak Spanish, and a little English, as you can see!" },
];
