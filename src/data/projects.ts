// Finished projects shown in the "Projektet" section.
// The section stays hidden on the live site until this list has at least one real project.
//
// To add a project:
//   1. Put its photos in /public/projects/ (JPG or WebP, about 1600 px wide, landscape 4:3 works best).
//   2. Copy the example below into `projects`, fill in the real details, list the photo file names.
//   3. `services` uses the service ids from content.ts: ndricim, instalime, solare, smart, mirembajtje, platforme, materiale.
//
// Only real, approved projects. If the client can't be named, describe it ("Shkollë fillore", "Hotel në Pejë").

export type Photo = { src: string; w: number; h: number };

export type Project = {
  id: string;
  photos: (string | Photo)[]; // file names in /public/projects/ (or a full path starting with /); give w/h when known
  video?: string;            // optional short muted clip shown as the first slide
  poster?: string;
  year?: string;
  services: string[];        // service ids
  sq: { title: string; place: string; client: string; text: string };
  en: { title: string; place: string; client: string; text: string };
};

export const projects: Project[] = [
  // Drone material from October 2026. Place/client/year are left out on purpose until the client confirms them;
  // the texts only describe what the footage shows.
  {
    id: 'bulevardi-2026',
    photos: [
      { src: '/media/bulevardi-01.webp', w: 1672, h: 941 },
      { src: '/media/bulevardi-02.webp', w: 941, h: 1672 },
      { src: '/media/bulevardi-03.webp', w: 1672, h: 941 },
      { src: '/media/bulevardi-04.webp', w: 941, h: 1672 },
      { src: '/media/bulevardi-05.webp', w: 1672, h: 941 },
      { src: '/media/bulevardi-06.webp', w: 941, h: 1672 },
      { src: '/media/bulevardi-07.webp', w: 1672, h: 941 },
      { src: '/media/bulevardi-08.webp', w: 941, h: 1672 },
      { src: '/media/bulevardi-09.webp', w: 1672, h: 941 },
      { src: '/media/bulevardi-10.webp', w: 941, h: 1672 },
      { src: '/media/bulevardi-11.webp', w: 1672, h: 941 },
    ],
    video: '/media/web3.mp4', poster: '/media/web3.jpg',
    services: ['ndricim'],
    sq: { title: 'Ndriçimi publik i një bulevardi', place: 'Kosovë', client: '', text: 'Shtylla dhe ndriçues LED përgjatë gjithë bulevardit, me ndriçim të njëtrajtshëm nga njëri skaj në tjetrin, pamje nga droni natën.' },
    en: { title: 'Public lighting along a boulevard', place: 'Kosovo', client: '', text: 'LED poles and luminaires along the full length of the boulevard, with even light from one end to the other, filmed by drone at night.' },
  },
  {
    id: 'parkingu-autobuseve',
    photos: [], video: '/media/web1.mp4', poster: '/media/web1.jpg',
    services: ['ndricim', 'instalime'],
    sq: { title: 'Ndriçimi i një parkingu autobusësh', place: 'Kosovë', client: '', text: 'Ndriçim i parkingut dhe i rrugëve hyrëse, pa zona të errëta mes rreshtave të autobusëve.' },
    en: { title: 'Lighting for a bus terminal car park', place: 'Kosovo', client: '', text: 'Lighting for the car park and its access roads, with no dark spots between the bus rows.' },
  },
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
