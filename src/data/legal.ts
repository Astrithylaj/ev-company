// Legal pages: privacy & cookies, terms of use. Albanian and English.
// Written for Kosovo Law No. 06/L-082 on the Protection of Personal Data (GDPR-based).
// Not legal advice: ideally a lawyer reads it before launch.
// {email}, {phone} and {address} are filled in from the live contact details.
// Keep the "Processors" list true: update it if the form service or hosting changes.


export type LegalDoc = {
  slug: string;              // URL segment
  other: string;             // slug of the same page in the other language
  title: string;
  updated: string;           // "last updated" line
  intro: string;
  sections: { h: string; p: string[] }[];
};

const company = 'EV COMPANY sh.p.k.';
const nui = '812083484';
const nuiEn = '812083484';

export const legal: Record<'sq' | 'en', { privacy: LegalDoc; terms: LegalDoc; labels: { privacy: string; terms: string; back: string } }> = {
  sq: {
    labels: { privacy: 'Privatësia dhe cookies', terms: 'Kushtet e përdorimit', back: 'Kthehu te faqja kryesore' },
    privacy: {
      slug: 'privatesia', other: 'privacy',
      title: 'Politika e privatësisë dhe cookies',
      updated: 'Përditësuar më 7 tetor 2026',
      intro: `Kjo faqe shpjegon cilat të dhëna personale mbledh ${company} përmes kësaj faqeje interneti, pse i mbledh dhe çfarë të drejtash keni. E zbatojmë Ligjin Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale.`,
      sections: [
        { h: 'Kush jemi', p: [
          `Kontrollues i të dhënave është ${company}, {address}, NUI ${nui}. Për çdo pyetje rreth të dhënave tuaja na shkruani në {email} ose na telefononi në {phone}.`,
        ] },
        { h: 'Çfarë të dhënash mbledhim', p: [
          'Vetëm atë që na jepni vetë në formularin “Kërkoni ofertë”: emrin, numrin e telefonit, qytetin ose lokacionin, nëse jeni klient privat, biznes apo institucion, shërbimin që ju intereson dhe mesazhin tuaj.',
          'Nëse na telefononi, na shkruani me email ose përmes WhatsApp, Viber apo rrjeteve sociale, ruajmë ato që na dërgoni, si numrin e telefonit dhe përmbajtjen e mesazhit. Këto aplikacione kanë politikat e tyre të privatësisë.',
          'Faqja nuk krijon profile të vizitorëve dhe nuk përdor reklama apo gjurmues të palëve të treta.',
        ] },
        { h: 'Pse i përdorim dhe mbi çfarë baze', p: [
          'I përdorim vetëm për t’ju kthyer përgjigje, për të përgatitur ofertën dhe, nëse vazhdoni me ne, për të realizuar punimet. Baza ligjore është kërkesa juaj para lidhjes së kontratës dhe interesi ynë i ligjshëm për t’u përgjigjur pyetjeve që na i drejtoni.',
          'Nuk i shesim të dhënat tuaja dhe nuk ju dërgojmë reklama pa pëlqimin tuaj.',
        ] },
        { h: 'Kush tjetër i përpunon', p: [
          'Për ta mbajtur faqen në punë përdorim disa ofrues shërbimesh që i përpunojnë të dhënat vetëm sipas udhëzimeve tona:',
          'Cloudflare, Inc. (hostimi i faqes, mbrojtja nga sulmet, hyrja e administratorit dhe statistika të vizitave pa cookies); Web3Forms (dërgimi i formularit në emailin tonë); ofruesi i emailit të kompanisë.',
          'Disa nga këta ofrues mund t’i përpunojnë të dhënat jashtë Kosovës, në BE ose SHBA. Kemi zgjedhur ofrues që zbatojnë masa mbrojtëse të pranuara ndërkombëtarisht.',
        ] },
        { h: 'Sa kohë i ruajmë', p: [
          'Kërkesat që nuk kthehen në punë i fshijmë brenda 24 muajve. Kur lidhim kontratë, të dhënat i ruajmë aq sa kërkojnë ligjet për dokumentet tatimore dhe kontabël.',
        ] },
        { h: 'Të drejtat tuaja', p: [
          'Keni të drejtë të kërkoni qasje në të dhënat tuaja, korrigjimin ose fshirjen e tyre, kufizimin e përpunimit dhe të kundërshtoni përpunimin. Na shkruani në {email} dhe do t’ju përgjigjemi brenda 30 ditëve.',
          'Nëse mendoni se nuk i kemi trajtuar mirë të dhënat tuaja, mund të paraqisni ankesë te Agjencia për Informim dhe Privatësi (AIP), aip.rks-gov.net.',
        ] },
        { h: 'Cookies dhe ruajtja në pajisje', p: [
          'Faqja nuk përdor cookies për vizitorët: as për reklama, as për statistika. Prandaj nuk shfaqim dritare për pëlqimin e cookies.',
          'Faqja ruan në shfletuesin tuaj vetëm një shënim teknik (“ev-intro”) që animacioni hyrës të mos përsëritet. Fshihet vetë kur mbyllni skedën dhe nuk përmban të dhëna personale.',
          'Cloudflare mund të vendosë një cookie teknike sigurie për të dalluar njerëzit nga botët (p.sh. “__cf_bm”). Kjo është e domosdoshme për mbrojtjen e faqes dhe nuk përdoret për t’ju ndjekur.',
          'Paneli i administrimit, që e përdor vetëm kompania, përdor një cookie hyrjeje (“CF_Authorization”) vetëm për personat e autorizuar.',
        ] },
        { h: 'Siguria', p: [
          'Faqja hapet vetëm përmes lidhjes së sigurt (HTTPS). Qasja në administrim është e mbrojtur me kod që dërgohet në emailin e personit të autorizuar.',
        ] },
        { h: 'Ndryshimet', p: [
          'Nëse e ndryshojmë këtë politikë, data në krye të faqes ndryshon. Ndryshimet e rëndësishme do t’i shënojmë qartë në këtë faqe.',
        ] },
      ],
    },
    terms: {
      slug: 'kushtet', other: 'terms',
      title: 'Kushtet e përdorimit',
      updated: 'Përditësuar më 7 tetor 2026',
      intro: `Këto kushte vlejnë për përdorimin e kësaj faqeje interneti të ${company}. Duke e përdorur faqen, i pranoni këto kushte.`,
      sections: [
        { h: 'Të dhënat e kompanisë', p: [
          `${company}, {address}. NUI ${nui}. Email {email}, telefon {phone}.`,
        ] },
        { h: 'Informacioni në faqe', p: [
          'Përmbajtja e faqes është informative dhe përshkruan shërbimet tona në përgjithësi. Përpiqemi ta mbajmë të saktë dhe të përditësuar, por nuk garantojmë që çdo informacion është i plotë në çdo kohë.',
          'Fotot dhe pamjet 3D janë ilustruese. Ato nuk tregojnë domosdoshmërisht një punë të caktuar, përveç kur kjo thuhet qartë te projektet.',
        ] },
        { h: 'Ofertat', p: [
          'Një kërkesë për ofertë nuk krijon detyrim për asnjërën palë. Çmimet, afatet dhe kushtet e punimeve vlejnë vetëm kur janë konfirmuar me shkrim në një ofertë ose kontratë të veçantë.',
        ] },
        { h: 'Pronësia intelektuale', p: [
          `Logoja, emri, tekstet, fotot dhe dizajni i faqes janë pronë e ${company} ose përdoren me leje. Nuk lejohet kopjimi ose përdorimi i tyre për qëllime tregtare pa pëlqimin tonë me shkrim.`,
        ] },
        { h: 'Lidhjet e jashtme', p: [
          'Faqja mund të ketë lidhje drejt faqeve të tjera, si Google Maps ose rrjetet sociale. Nuk përgjigjemi për përmbajtjen ose politikat e privatësisë së tyre.',
        ] },
        { h: 'Përgjegjësia', p: [
          'Nuk mbajmë përgjegjësi për dëme që vijnë nga përdorimi i informacionit të përgjithshëm në këtë faqe pa një konsultim ose ofertë konkrete nga ne, ose nga ndërprerjet e përkohshme të faqes. Kjo nuk e kufizon përgjegjësinë tonë aty ku ligji nuk e lejon kufizimin.',
        ] },
        { h: 'Ligji në fuqi', p: [
          'Për këto kushte zbatohet ligji i Republikës së Kosovës. Mosmarrëveshjet i zgjidh gjykata kompetente në Prishtinë.',
        ] },
      ],
    },
  },
  en: {
    labels: { privacy: 'Privacy & cookies', terms: 'Terms of use', back: 'Back to the home page' },
    privacy: {
      slug: 'privacy', other: 'privatesia',
      title: 'Privacy and cookie policy',
      updated: 'Last updated 7 October 2026',
      intro: `This page explains what personal data ${company} collects through this website, why, and what your rights are. We apply Kosovo Law No. 06/L-082 on the Protection of Personal Data.`,
      sections: [
        { h: 'Who we are', p: [
          `The data controller is ${company}, {address}, business number (NUI) ${nuiEn}. For any question about your data, write to {email} or call {phone}.`,
        ] },
        { h: 'What we collect', p: [
          'Only what you give us in the “Request a quote” form: your name, phone number, town or location, whether you are a private client, business or institution, the service you are interested in and your message.',
          'If you call us, email us, or write to us on WhatsApp, Viber or social media, we keep what you send us, such as your phone number and the content of your message. These apps have their own privacy policies.',
          'The website does not build visitor profiles and does not use advertising or third-party trackers.',
        ] },
        { h: 'Why we use it and on what basis', p: [
          'We use it only to answer you, prepare a quote and, if you go ahead, carry out the work. The legal basis is your request before entering into a contract and our legitimate interest in answering the questions you send us.',
          'We do not sell your data and we do not send you marketing without your consent.',
        ] },
        { h: 'Who else processes it', p: [
          'To run the website we use a few service providers that process data only on our instructions:',
          'Cloudflare, Inc. (hosting, protection against attacks, administrator sign-in and cookie-free visit statistics); Web3Forms (delivering the form to our email); the company’s email provider.',
          'Some of these providers may process data outside Kosovo, in the EU or the US. We chose providers that apply internationally recognised safeguards.',
        ] },
        { h: 'How long we keep it', p: [
          'Requests that do not lead to work are deleted within 24 months. When we sign a contract, we keep the data for as long as tax and accounting law requires.',
        ] },
        { h: 'Your rights', p: [
          'You can ask for access to your data, correction or deletion, restriction of processing, and you can object to processing. Write to {email} and we will reply within 30 days.',
          'If you think we have not handled your data properly, you can complain to the Information and Privacy Agency (AIP), aip.rks-gov.net.',
        ] },
        { h: 'Cookies and storage on your device', p: [
          'The website does not use cookies for visitors: not for advertising and not for statistics. That is why there is no cookie consent pop-up.',
          'It stores one technical note in your browser (“ev-intro”) so the opening animation does not repeat. It is deleted when you close the tab and contains no personal data.',
          'Cloudflare may set a technical security cookie to tell people from bots (for example “__cf_bm”). It is necessary to protect the site and is not used to track you.',
          'The administration panel, used only by the company, uses a sign-in cookie (“CF_Authorization”) for authorised people only.',
        ] },
        { h: 'Security', p: [
          'The website only opens over a secure connection (HTTPS). Access to administration is protected by a code sent to the authorised person’s email.',
        ] },
        { h: 'Changes', p: [
          'If we change this policy, the date at the top changes. Important changes will be clearly marked on this page.',
        ] },
      ],
    },
    terms: {
      slug: 'terms', other: 'kushtet',
      title: 'Terms of use',
      updated: 'Last updated 7 October 2026',
      intro: `These terms apply to the use of this website of ${company}. By using the website you accept them.`,
      sections: [
        { h: 'Company details', p: [
          `${company}, {address}. Business number (NUI) ${nuiEn}. Email {email}, phone {phone}.`,
        ] },
        { h: 'Information on the website', p: [
          'The content is for information and describes our services in general. We try to keep it accurate and up to date, but we do not guarantee that all information is complete at all times.',
          'Photos and 3D scenes are illustrative. They do not necessarily show a specific job, except where the projects section says so.',
        ] },
        { h: 'Quotes', p: [
          'A quote request does not create an obligation for either side. Prices, deadlines and terms of work apply only once confirmed in writing in a separate quote or contract.',
        ] },
        { h: 'Intellectual property', p: [
          `The logo, name, texts, photos and design of the website belong to ${company} or are used with permission. Copying or commercial use without our written consent is not allowed.`,
        ] },
        { h: 'External links', p: [
          'The website may link to other sites, such as Google Maps or social networks. We are not responsible for their content or privacy policies.',
        ] },
        { h: 'Liability', p: [
          'We are not liable for damage resulting from using the general information on this website without a specific consultation or quote from us, or from temporary interruptions of the website. This does not limit our liability where the law does not allow it.',
        ] },
        { h: 'Governing law', p: [
          'These terms are governed by the law of the Republic of Kosovo. Disputes are settled by the competent court in Prishtina.',
        ] },
      ],
    },
  },
};
