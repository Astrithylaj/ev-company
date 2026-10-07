// All copy for the site, Albanian (sq) and English (en).
// Facts come only from the client's answers (see CLIENT-BRIEF.md in the parent folder).
// Anything not confirmed by the client is marked [PLACEHOLDER: ...].

export const contact = {
  phoneDisplay: '+383 49 116 167',
  phoneHref: 'tel:+38349116167',
  email: 'info@evcompanyks.com',
  street: 'Rr. Ferid Curri',
  city: 'Prishtinë',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Rr.+Ferid+Curri+Prishtin%C3%AB',
};

export type Lang = 'sq' | 'en';

export type Service = {
  id: string;
  short: string; // printed on the breaker label strip
  title: string;
  text: string;
  for?: string;
};

const sq = {
  htmlLang: 'sq',
  meta: {
    title: 'EV COMPANY sh.p.k. | Ndriçim publik dhe instalime elektrike në Kosovë',
    description:
      'EV COMPANY sh.p.k. nga Prishtina realizon ndriçim publik, instalime elektrike, sisteme solare dhe Smart Home, mirëmbajtje dhe intervenime në gjithë Kosovën.',
  },
  nav: { services: 'Shërbimet', projects: 'Projektet', process: 'Si punojmë', company: 'Kompania', contact: 'Kontakti' },
  skip: 'Kalo te përmbajtja',
  callShort: 'Na telefononi',
  menu: 'Menyja',
  close: 'Mbyll',
  hero: {
    title: ['Kur ndizen dritat,', 'duket puna jonë.'],
    lead: 'Ndriçim publik, instalime elektrike dhe mirëmbajtje për institucione, biznese dhe shtëpi, në gjithë Kosovën.',
    primary: 'Na telefononi',
    secondary: 'Shihni shërbimet',
    canvasLabel: 'Animacion 3D: një rrugë natën ku dritat e ndriçimit publik ndizen njëra pas tjetrës.',
  },
  services: {
    title: 'Shërbimet',
    lead: 'Zgjidhje të plota, nga furnizimi me materiale deri te intervenimet në terren.',
    hint: 'Ngrini një siguresë dhe shikoni çfarë ndizet.',
    all: { id: 'all', short: 'Të gjitha', title: 'Të gjitha shërbimet', text: 'Nga furnizimi me materiale dhe instalimi, deri te testimi, mirëmbajtja dhe intervenimet në terren, për sektorin publik dhe atë privat.' } as Service,
    cityLabel: 'Model 3D i një qyteti të vogël natën. Siguresa e zgjedhur ndez pjesën e qytetit që lidhet me atë shërbim.',
    panelLabel: 'Tabloja e shërbimeve',
    forLabel: 'Për',
    ask: 'Kërkoni ofertë për këtë shërbim',
    list: [
      { id: 'ndricim', short: 'Ndriçim publik', title: 'Ndriçimi publik', text: 'Instalim dhe mirëmbajtje e ndriçimit publik, me montim të shtyllave dhe të pajisjeve të ndriçimit për rrugë, parqe dhe hapësira publike.', for: 'Komuna dhe institucione publike' },
      { id: 'instalime', short: 'Instalime', title: 'Instalime elektrike', text: 'Instalime elektrike për shtëpi, banesa, restorante, hotele, parqe dhe objekte afariste, si dhe realizim i projekteve elektrike për sektorin publik dhe privat.', for: 'Shtëpi, biznese dhe objekte publike' },
      { id: 'solare', short: 'Solare', title: 'Sisteme solare dhe fotovoltaike', text: 'Instalim i sistemeve solare dhe fotovoltaike, sipas kërkesave të projektit dhe objektit.' },
      { id: 'smart', short: 'Smart Home', title: 'Sisteme Smart Home', text: 'Instalim i sistemeve Smart Home për shtëpi dhe banesa.', for: 'Shtëpi dhe banesa' },
      { id: 'mirembajtje', short: 'Mirëmbajtje', title: 'Mirëmbajtje dhe intervenime', text: 'Mirëmbajtje e instalimeve elektrike dhe intervenime në terren, për objekte publike, komerciale dhe private.' },
      { id: 'platforme', short: 'Auto-platformë', title: 'Punime me auto-platformë', text: 'Punime në lartësi me auto-platformë (cherry picker): montim dhe mirëmbajtje e shtyllave, ndriçimit dhe pajisjeve.' },
      { id: 'materiale', short: 'Materiale', title: 'Materiale elektrike', text: 'Furnizim dhe shitje e materialeve elektrike, për projekte të madhësive të ndryshme.' },
    ] as Service[],
  },
  process: {
    title: 'Si punojmë',
    lead: 'Një ekip, nga fillimi deri në fund.',
    steps: [
      ['Furnizimi', 'Sigurojmë materialet elektrike dhe pajisjet që i kërkon projekti.'],
      ['Instalimi', 'Ekipi teknik e realizon punën në terren, me pajisjet e duhura për çdo kusht.'],
      ['Testimi', 'Instalimi testohet, që të funksionojë siç duhet dhe të jetë i sigurt.'],
      ['Mirëmbajtja', 'Mbetemi pranë me mirëmbajtje dhe intervenime kur ka nevojë.'],
    ],
  },
  projects: { title: 'Projektet', lead: 'Disa nga punët e realizuara.', photos: 'foto' },
  company: {
    title: 'Kompania',
    p1: 'EV COMPANY sh.p.k. është ndërtuar mbi punën praktike në sektorin elektrik. Me vite kemi zgjeruar ekipin teknik dhe pajisjet, dhe sot realizojmë projekte të çdo madhësie, nga intervenimet e përditshme deri te ndriçimi publik.',
    p2: '',
    quote: 'Për ne nuk mjafton që puna të përfundojë. Çdo instalim duhet të jetë i sigurt, funksional dhe i qëndrueshëm.',
    whoTitle: 'Me kë punojmë',
    who: [
      ['Institucione dhe komuna', 'Projekte publike dhe komunale, sidomos ndriçim publik dhe infrastrukturë.'],
      ['Biznese', 'Kompani, restorante, hotele dhe objekte afariste.'],
      ['Klientë privatë', 'Shtëpi, banesa dhe prona private.'],
    ],
  },
  coverage: {
    title: 'Ku punojmë',
    text: 'Me bazë në Prishtinë, realizojmë projekte në gjithë Kosovën, varësisht nga projekti dhe kërkesat e klientit.',
    base: 'Prishtinë',
    mapLabel: 'Harta e Kosovës, me Prishtinën të shënuar si bazë e kompanisë.',
  },
  contact: {
    title: 'Le ta ndezim.',
    lead: 'Keni një projekt? Na telefononi ose na shkruani. Na tregoni çfarë keni në plan dhe ku ndodhet objekti.',
    phoneLabel: 'Telefoni',
    emailLabel: 'Email',
    addressLabel: 'Adresa',
    hoursLabel: 'Orari',
    hours: 'E hënë – e premte, 08:00–17:00',
    maps: 'Hapeni në Google Maps',
    form: {
      title: 'Kërkoni ofertë',
      name: 'Emri',
      phone: 'Telefoni',
      service: 'Shërbimi',
      servicePick: 'Zgjidhni shërbimin',
      other: 'Tjetër',
      location: 'Qyteti / lokacioni',
      locationPh: 'P.sh. Prishtinë',
      who: 'Jeni',
      whoOptions: ['Klient privat', 'Biznes', 'Institucion'],
      message: 'Mesazhi (opsional)',
      messagePh: 'P.sh. lloji i objektit dhe çfarë ju duhet.',
      sent: 'Faleminderit! Kërkesa u dërgua. Do t’ju kontaktojmë së shpejti.',
      failed: 'Kërkesa nuk u dërgua. Na telefononi në +383 49 116 167 ose provoni përsëri.',
      submit: 'Dërgojeni me email',
      note: 'Butoni e hap aplikacionin tuaj të emailit me kërkesën të plotësuar.',
      privacyNote: 'Të dhënat i përdorim vetëm për t’ju kthyer përgjigje. Më shumë te',
      subject: 'Kërkesë për ofertë',
    },
  },
  footer: {
    line: 'Nga lidhja e parë, te drita e fundit.',
    rights: 'Të gjitha të drejtat e rezervuara.',
    preview: 'Parapamje për shqyrtim',
    top: 'Kthehu lart',
  },
};

const en: typeof sq = {
  htmlLang: 'en',
  meta: {
    title: 'EV COMPANY sh.p.k. | Public lighting and electrical installations in Kosovo',
    description:
      'EV COMPANY sh.p.k., based in Prishtina, delivers public lighting, electrical installations, solar and Smart Home systems, maintenance and repairs across Kosovo.',
  },
  nav: { services: 'Services', projects: 'Projects', process: 'How we work', company: 'Company', contact: 'Contact' },
  skip: 'Skip to content',
  callShort: 'Call us',
  menu: 'Menu',
  close: 'Close',
  hero: {
    title: ['When the lights come on,', 'our work shows.'],
    lead: 'Public lighting, electrical installations and maintenance for institutions, businesses and homes across Kosovo.',
    primary: 'Call us',
    secondary: 'See our services',
    canvasLabel: '3D animation: a street at night where the street lights switch on one after another.',
  },
  services: {
    title: 'Services',
    lead: 'Complete solutions, from supplying materials to on-site repairs.',
    hint: 'Switch a breaker on and see what lights up.',
    all: { id: 'all', short: 'All', title: 'All services', text: 'From supplying materials and installation to testing, maintenance and on-site repairs, for the public and private sector.' },
    cityLabel: '3D model of a small town at night. The selected breaker lights up the part of town that service covers.',
    panelLabel: 'Services panel',
    forLabel: 'For',
    ask: 'Request a quote for this service',
    list: [
      { id: 'ndricim', short: 'Public lighting', title: 'Public lighting', text: 'Installation and maintenance of public lighting, including mounting light poles and fixtures for roads, parks and public spaces.', for: 'Municipalities and public institutions' },
      { id: 'instalime', short: 'Installations', title: 'Electrical installations', text: 'Electrical installations for houses, apartments, restaurants, hotels, parks and commercial buildings, plus electrical projects for the public and private sector.', for: 'Homes, businesses and public buildings' },
      { id: 'solare', short: 'Solar', title: 'Solar and photovoltaic systems', text: 'Installation of solar and photovoltaic systems, to the requirements of each project and building.' },
      { id: 'smart', short: 'Smart Home', title: 'Smart Home systems', text: 'Installation of Smart Home systems for houses and apartments.', for: 'Houses and apartments' },
      { id: 'mirembajtje', short: 'Maintenance', title: 'Maintenance and repairs', text: 'Maintenance of electrical installations and on-site repairs for public, commercial and private buildings.' },
      { id: 'platforme', short: 'Cherry picker', title: 'Cherry picker work', text: 'Work at height with a cherry picker: mounting and maintaining poles, lighting and equipment.' },
      { id: 'materiale', short: 'Materials', title: 'Electrical materials', text: 'Supply and sale of electrical materials for projects of every size.' },
    ],
  },
  process: {
    title: 'How we work',
    lead: 'One team, from start to finish.',
    steps: [
      ['Supply', 'We source the electrical materials and equipment the project needs.'],
      ['Installation', 'Our technical team carries out the work on site, with the right equipment for the conditions.'],
      ['Testing', 'The installation is tested so it works as it should and is safe.'],
      ['Maintenance', 'We stay on hand for maintenance and repairs whenever they are needed.'],
    ],
  },
  projects: { title: 'Projects', lead: 'Some of the work we have delivered.', photos: 'photos' },
  company: {
    title: 'The company',
    p1: 'EV COMPANY sh.p.k. is built on hands-on work in the electrical sector. Over the years we have grown our technical team and equipment, and today we deliver projects of every size, from everyday repairs to public lighting.',
    p2: '',
    quote: 'Finishing the job is not enough for us. Every installation has to be safe, functional and built to last.',
    whoTitle: 'Who we work with',
    who: [
      ['Institutions and municipalities', 'Public and municipal projects, especially public lighting and infrastructure.'],
      ['Businesses', 'Companies, restaurants, hotels and commercial buildings.'],
      ['Private clients', 'Houses, apartments and private property.'],
    ],
  },
  coverage: {
    title: 'Where we work',
    text: 'Based in Prishtina, we carry out projects across Kosovo, depending on the project and what the client needs.',
    base: 'Prishtina',
    mapLabel: 'Map of Kosovo with Prishtina marked as the company’s base.',
  },
  contact: {
    title: 'Let’s switch it on.',
    lead: 'Got a project? Call or write to us. Tell us what you are planning and where the building is.',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    addressLabel: 'Address',
    hoursLabel: 'Working hours',
    hours: 'Monday – Friday, 08:00–17:00',
    maps: 'Open in Google Maps',
    form: {
      title: 'Request a quote',
      name: 'Name',
      phone: 'Phone',
      service: 'Service',
      servicePick: 'Choose a service',
      other: 'Other',
      location: 'Town / location',
      locationPh: 'E.g. Prishtina',
      who: 'You are',
      whoOptions: ['Private client', 'Business', 'Institution'],
      message: 'Message (optional)',
      messagePh: 'E.g. type of building and what you need.',
      sent: 'Thank you! Your request has been sent. We will contact you soon.',
      failed: 'The request was not sent. Call us on +383 49 116 167 or try again.',
      submit: 'Send by email',
      note: 'The button opens your email app with the request filled in.',
      privacyNote: 'We use your details only to reply to you. More in',
      subject: 'Quote request',
    },
  },
  footer: {
    line: 'From the first connection to the final light.',
    rights: 'All rights reserved.',
    preview: 'Preview for review',
    top: 'Back to top',
  },
};

export const content = { sq, en };
