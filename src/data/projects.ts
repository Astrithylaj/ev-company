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
  photos: string[];          // file names in /public/projects/
  year?: string;
  services: string[];        // service ids
  sq: { title: string; place: string; client: string; text: string };
  en: { title: string; place: string; client: string; text: string };
};

export const projects: Project[] = [
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
