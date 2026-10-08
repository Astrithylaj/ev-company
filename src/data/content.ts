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
  points?: string[]; // short bullet lines under the text
};

const sq = {
  htmlLang: 'sq',
  meta: {
    title: 'EV COMPANY sh.p.k. | Ndriçim publik dhe instalime elektrike në Kosovë',
    description:
      'EV COMPANY sh.p.k. nga Prishtina realizon ndriçim publik dhe të brendshëm, instalime elektrike, sisteme solare dhe Smart Home, mirëmbajtje dhe intervenime në gjithë Kosovën.',
  },
  nav: { services: 'Shërbimet', projects: 'Projektet', process: 'Si punojmë', company: 'Kompania', contact: 'Kontakti' },
  skip: 'Kalo te përmbajtja',
  callShort: 'Kontakti',
  callAria: 'Kontakti: na telefononi në',
  menu: 'Menyja',
  close: 'Mbyll',
  hero: {
    title: ['Kur ndizen dritat,', 'duket puna jonë.'],
    lead: 'Zgjidhje për ndriçim publik dhe të brendshëm, instalime elektrike dhe mirëmbajtje për institucione, biznese dhe objekte banimi, oborre dhe parqe në gjithë Kosovën.',
    primary: 'Kontakti',
    secondary: 'Shihni shërbimet',
    canvasLabel: 'Animacion 3D: një rrugë natën ku dritat e ndriçimit publik ndizen njëra pas tjetrës.',
  },
  services: {
    title: 'Shërbimet',
    lead: 'Nga furnizimi me materiale dhe pajisje, te instalimi, testimi dhe mirëmbajtja.',
    hint: 'Zgjidhni një shërbim për të mësuar më shumë.',
    all: { id: 'all', short: 'Të gjitha', title: 'Të gjitha shërbimet', text: 'Nga furnizimi me materiale dhe instalimi, deri te testimi, mirëmbajtja dhe intervenimet në terren, për sektorin publik dhe atë privat.' } as Service,
    cityLabel: 'Model 3D i një qyteti të vogël natën. Siguresa e zgjedhur ndez pjesën e qytetit që lidhet me atë shërbim.',
    panelLabel: 'Tabloja e shërbimeve',
    forLabel: 'Për',
    ask: 'Kërkoni ofertë për këtë shërbim',
    list: [
      { id: 'ndricim', short: 'Ndriçim publik', title: 'Ndriçimi publik', text: 'Instalim dhe mirëmbajtje e ndriçimit publik, me montim të shtyllave dhe të pajisjeve të ndriçimit për rrugë, parqe dhe hapësira publike.', for: 'Komuna dhe institucione publike' },
      { id: 'instalime', short: 'Instalime', title: 'Instalime elektrike dhe ndriçim i brendshëm', text: 'Realizojmë instalime elektrike dhe ndriçim të brendshëm e të jashtëm për objekte banimi dhe afariste, përfshirë shtëpi, banesa, zyra, lokale, oborre dhe hapësira të tjera.', points: ['Ndriçim LED dhe dekorativ.', 'Ndriçim për ambiente pune dhe banimi.'], for: 'Shtëpi, biznese dhe objekte publike' },
      { id: 'solare', short: 'Solare', title: 'Sisteme solare dhe fotovoltaike', text: 'Instalim i sistemeve solare dhe fotovoltaike, sipas kërkesave të projektit dhe objektit.' },
      { id: 'smart', short: 'Smart Home', title: 'Sisteme Smart Home', text: 'Instalim i sistemeve Smart Home për shtëpi dhe banesa.', for: 'Shtëpi dhe banesa' },
      { id: 'mirembajtje', short: 'Mirëmbajtje', title: 'Mirëmbajtje dhe intervenime', text: 'Mirëmbajtje e instalimeve elektrike dhe intervenime në terren, për objekte publike, komerciale dhe private.' },
      { id: 'platforme', short: 'Auto-platformë', title: 'Punime me auto-platformë', text: 'Punime në lartësi me auto-platformë (cherry picker): montim dhe mirëmbajtje e shtyllave, ndriçimit dhe pajisjeve.' },
      { id: 'materiale', short: 'Materiale', title: 'Materiale elektrike', text: 'Furnizim dhe shitje e materialeve elektrike, për projekte të madhësive të ndryshme.' },
    ] as Service[],
  },
  process: {
    title: 'Si punojmë',
    lead: 'Një ekip për çdo fazë të projektit.',
    steps: [
      ['Furnizimi', 'Sigurojmë materialet dhe pajisjet sipas kërkesave të projektit.'],
      ['Instalimi', 'Realizojmë instalimet në terren, me ekip teknik dhe pajisje të përshtatshme për punën.'],
      ['Testimi', 'Kontrollojmë dhe testojmë instalimet për funksionim të sigurt.'],
      ['Mirëmbajtja', 'Ofrojmë mirëmbajtje dhe intervenime për vazhdimësinë e funksionimit.'],
    ],
  },
  projects: { title: 'Projektet tona', lead: 'Disa nga punët e realizuara.', photos: 'foto' },
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
    mapLabel: 'Harta e Kosovës, me Prishtinën si bazë të kompanisë dhe qytetet kryesore të shënuara: punojmë në gjithë Kosovën.',
  },
  contact: {
    title: 'Le ta ndezim.',
    lead: 'Na tregoni për projektin tuaj. Na kontaktoni me telefon, WhatsApp ose plotësoni formularin për të kërkuar ofertë.',
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
      email: 'Email (opsional)',
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
      failed: 'Kërkesa nuk u dërgua. Provoni përsëri ose na telefononi në {phone}.',
      sending: 'Duke dërguar…',
      required: 'Plotësoni këtë fushë.',
      phoneInvalid: 'Shkruani një numër telefoni të vlefshëm.',
      emailInvalid: 'Shkruani një adresë emaili të vlefshme.',
      mailOpened: 'Po hapet aplikacioni i emailit. Nëse nuk hapet, na shkruani në {email} ose na telefononi në {phone}.',
      submitDirect: 'Dërgojeni kërkesën',
      noteDirect: 'Kërkesa vjen direkt te ne dhe ju kontaktojmë në numrin që shënuat.',
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
      'EV COMPANY sh.p.k., based in Prishtina, delivers public and indoor lighting, electrical installations, solar and Smart Home systems, maintenance and repairs across Kosovo.',
  },
  nav: { services: 'Services', projects: 'Projects', process: 'How we work', company: 'Company', contact: 'Contact' },
  skip: 'Skip to content',
  callShort: 'Contact',
  callAria: 'Contact: call us on',
  menu: 'Menu',
  close: 'Close',
  hero: {
    title: ['When the lights come on,', 'our work shows.'],
    lead: 'Solutions for public and indoor lighting, electrical installations and maintenance for institutions, businesses, homes, yards and parks across Kosovo.',
    primary: 'Contact',
    secondary: 'See our services',
    canvasLabel: '3D animation: a street at night where the street lights switch on one after another.',
  },
  services: {
    title: 'Services',
    lead: 'From supplying materials and equipment to installation, testing and maintenance.',
    hint: 'Choose a service to learn more.',
    all: { id: 'all', short: 'All', title: 'All services', text: 'From supplying materials and installation to testing, maintenance and on-site repairs, for the public and private sector.' },
    cityLabel: '3D model of a small town at night. The selected breaker lights up the part of town that service covers.',
    panelLabel: 'Services panel',
    forLabel: 'For',
    ask: 'Request a quote for this service',
    list: [
      { id: 'ndricim', short: 'Public lighting', title: 'Public lighting', text: 'Installation and maintenance of public lighting, including mounting light poles and fixtures for roads, parks and public spaces.', for: 'Municipalities and public institutions' },
      { id: 'instalime', short: 'Installations', title: 'Electrical installations and indoor lighting', text: 'We carry out electrical installations and indoor and outdoor lighting for homes and commercial buildings, including houses, apartments, offices, shops and venues, yards and other spaces.', points: ['LED and decorative lighting.', 'Lighting for workplaces and homes.'], for: 'Homes, businesses and public buildings' },
      { id: 'solare', short: 'Solar', title: 'Solar and photovoltaic systems', text: 'Installation of solar and photovoltaic systems, to the requirements of each project and building.' },
      { id: 'smart', short: 'Smart Home', title: 'Smart Home systems', text: 'Installation of Smart Home systems for houses and apartments.', for: 'Houses and apartments' },
      { id: 'mirembajtje', short: 'Maintenance', title: 'Maintenance and repairs', text: 'Maintenance of electrical installations and on-site repairs for public, commercial and private buildings.' },
      { id: 'platforme', short: 'Cherry picker', title: 'Cherry picker work', text: 'Work at height with a cherry picker: mounting and maintaining poles, lighting and equipment.' },
      { id: 'materiale', short: 'Materials', title: 'Electrical materials', text: 'Supply and sale of electrical materials for projects of every size.' },
    ],
  },
  process: {
    title: 'How we work',
    lead: 'One team for every stage of the project.',
    steps: [
      ['Supply', 'We source the materials and equipment the project requires.'],
      ['Installation', 'We carry out the installation on site, with a technical team and the right equipment for the job.'],
      ['Testing', 'We check and test every installation so it works safely.'],
      ['Maintenance', 'We provide maintenance and repairs to keep everything running.'],
    ],
  },
  projects: { title: 'Our projects', lead: 'Some of the work we have delivered.', photos: 'photos' },
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
    mapLabel: 'Map of Kosovo with Prishtina as the company’s base and the main towns marked: we work across Kosovo.',
  },
  contact: {
    title: 'Let’s switch it on.',
    lead: 'Tell us about your project. Contact us by phone or WhatsApp, or fill in the form to request a quote.',
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
      email: 'Email (optional)',
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
      failed: 'The request was not sent. Try again or call us on {phone}.',
      sending: 'Sending…',
      required: 'Please fill in this field.',
      phoneInvalid: 'Please enter a valid phone number.',
      emailInvalid: 'Please enter a valid email address.',
      mailOpened: 'Your email app is opening. If it doesn’t, write to us at {email} or call us on {phone}.',
      submitDirect: 'Send request',
      noteDirect: 'Your request comes straight to us and we call you back on the number you gave.',
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
