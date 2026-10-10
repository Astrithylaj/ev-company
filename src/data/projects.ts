// Finished projects shown in the "Projektet" section.
// The section stays hidden on the live site until this list has at least one real project.
//
// To add a project:
//   1. Put its photos in /public/projects/ (JPG or WebP, about 1600 px wide, landscape 4:3 works best).
//   2. Copy the example below into `projects`, fill in the real details, list the photo file names.
//   3. `services` uses the service ids from content.ts: ndricim, instalime, solare, smart, mirembajtje, platforme, materiale.
//
// Only real, approved projects. If the client can't be named, describe it ("Shkollë fillore", "Hotel në Pejë").

export type Project = {
  id: string;
  photos: string[];          // file names in /public/projects/ (or a full path starting with /)
  video?: string;            // optional short muted clip shown as the first slide
  poster?: string;
  year?: string;
  services: string[];        // service ids
  sq: { title: string; place: string; client: string; text: string };
  en: { title: string; place: string; client: string; text: string };
};

export const projects: Project[] = [
  // PREVIEW ONLY — drone material from 11 Oct 2026. Titles/places/years are placeholders until Ermal confirms the facts.
  {
    id: 'bulevardi-2026',
    photos: ['/media/p0104.webp', '/media/p0107.webp', '/media/p0092.webp', '/media/p0095.webp'],
    year: '[PLACEHOLDER: viti]',
    services: ['ndricim'],
    sq: { title: '[PLACEHOLDER: Ndriçimi publik i bulevardit]', place: '[PLACEHOLDER: Komuna]', client: '[PLACEHOLDER: Klienti]', text: '[PLACEHOLDER: sa shtylla / km, çfarë u bë, me 1–2 fjali.]' },
    en: { title: '[PLACEHOLDER: Public lighting, boulevard]', place: '[PLACEHOLDER: Municipality]', client: '[PLACEHOLDER: Client]', text: '[PLACEHOLDER: how many poles / km, what was done.]' },
  },
  {
    id: 'parkingu-autobuseve',
    photos: [], video: '/media/park-0080.mp4', poster: '/media/park-0080.jpg',
    year: '[PLACEHOLDER: viti]',
    services: ['ndricim', 'instalime'],
    sq: { title: '[PLACEHOLDER: Ndriçimi i parkingut të autobusëve]', place: '[PLACEHOLDER: Qyteti]', client: '[PLACEHOLDER: Klienti]', text: '[PLACEHOLDER: çfarë u bë.]' },
    en: { title: '[PLACEHOLDER: Bus terminal car park lighting]', place: '[PLACEHOLDER: Town]', client: '[PLACEHOLDER: Client]', text: '[PLACEHOLDER: what was done.]' },
  },
  {
    id: 'rruga-2026',
    photos: [], video: '/media/street-0079.mp4', poster: '/media/street-0079.jpg',
    year: '[PLACEHOLDER: viti]',
    services: ['ndricim', 'platforme'],
    sq: { title: '[PLACEHOLDER: Ndriçimi i rrugës]', place: '[PLACEHOLDER: Qyteti]', client: '[PLACEHOLDER: Klienti]', text: '[PLACEHOLDER: çfarë u bë.]' },
    en: { title: '[PLACEHOLDER: Street lighting]', place: '[PLACEHOLDER: Town]', client: '[PLACEHOLDER: Client]', text: '[PLACEHOLDER: what was done.]' },
  },
  // {
  //   id: 'ndricimi-rruga-x',
  //   photos: ['rruga-x-1.jpg', 'rruga-x-2.jpg'],
  //   year: '2025',
  //   services: ['ndricim', 'platforme'],
  //   sq: { title: 'Ndriçimi i rrugës X', place: 'Prishtinë', client: 'Komuna e Prishtinës', text: 'Montim i 40 shtyllave LED dhe kabllimi nëntokësor.' },
  //   en: { title: 'Street lighting, X Street', place: 'Prishtina', client: 'Municipality of Prishtina', text: 'Installed 40 LED poles and underground cabling.' },
  // },
];

// Shown only in development (npm run dev) so the layout can be reviewed before real projects exist.
// These are placeholders, never published.
const ph = (what: string) => `[PLACEHOLDER: ${what}]`;
export const exampleProjects: Project[] = [
  { id: 'ex-1', photos: [], year: ph('viti'), services: ['ndricim', 'platforme'],
    sq: { title: ph('Projekt ndriçimi publik'), place: ph('Qyteti'), client: ph('Komuna / klienti'), text: ph('Çfarë u bë, me 1–2 fjali.') },
    en: { title: ph('Public lighting project'), place: ph('Town'), client: ph('Municipality / client'), text: ph('What was done, in 1–2 sentences.') } },
  { id: 'ex-2', photos: [], year: ph('viti'), services: ['instalime'],
    sq: { title: ph('Instalim elektrik, objekt afarist'), place: ph('Qyteti'), client: ph('Klienti'), text: ph('Çfarë u bë.') },
    en: { title: ph('Electrical installation, commercial building'), place: ph('Town'), client: ph('Client'), text: ph('What was done.') } },
  { id: 'ex-3', photos: [], year: ph('viti'), services: ['solare'],
    sq: { title: ph('Sistem solar'), place: ph('Qyteti'), client: ph('Klienti'), text: ph('Çfarë u bë.') },
    en: { title: ph('Solar system'), place: ph('Town'), client: ph('Client'), text: ph('What was done.') } },
  { id: 'ex-4', photos: [], year: ph('viti'), services: ['smart', 'instalime'],
    sq: { title: ph('Shtëpi me Smart Home'), place: ph('Qyteti'), client: ph('Klient privat'), text: ph('Çfarë u bë.') },
    en: { title: ph('Smart Home house'), place: ph('Town'), client: ph('Private client'), text: ph('What was done.') } },
];
