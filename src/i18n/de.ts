import type es from "./es";

const de: typeof es = {
  meta: {
    title: "Alisios DW · Downwind-Foil-Community auf Gran Canaria",
    description:
      "Downwind-Foil-Community auf Gran Canaria. Offene SUP-Foil-, Parawing- und Wing-Foil-Runs entlang der Küste der Insel, in der Gruppe und mit geregelter Logistik.",
    ogAlt: "Logo von Alisios DW, Downwind-Foil-Community auf Gran Canaria",
    skip: "Zum Inhalt springen",
  },
  nav: {
    label: "Hauptmenü",
    home: "Alisios DW, zur Startseite",
    items: {
      "por-que": "Warum",
      modalidades: "Disziplinen",
      "como-funciona": "So läuft's",
      merch: "Merch",
      faq: "Fragen",
    },
    join: "Mitmachen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    language: "Sprache",
  },
  hero: {
    sticker: "Gran Canaria · Downwind Foil",
    title: ["Mach Downwind", "mit dem Passat."],
    titleAccent: "Nie allein.",
    lead: "Wir sind eine Community aus SUP-Foil-, Parawing- und Wing-Foil-Ridern und organisieren offene Runs entlang der Küste von Gran Canaria. Wir sagen Bescheid, wenn der Wind kommt, regeln die Autos zwischen Start und Ziel und fahren den Downwind gemeinsam.",
    cta: "Sei beim nächsten Downwind dabei",
    free: "Kostenlos, ohne Beitrag",
    proof: "Iballa Ruano, Foil Only, Moritz Mauch und Miguel Chapuis sind schon mit der Community Downwind gefahren. Alles zum Mitverfolgen auf",
    logoAlt: "Logo von Alisios DW: ein Fisch mit Kamm, der auf einem Foil fliegt, in einer blau-gelben Explosion",
    alertLabel: "So sieht eine Ansage in der Gruppe aus",
    alert:
      "Morgen kommt der Passat. Treffpunkt 10:30 am Ziel, Autos abstellen, dann fahren wir gemeinsam zum Start. Mittleres Niveau, noch 3 Plätze frei.",
  },
  marquee: {
    top: ["SUP Foil", "Parawing", "Wing Foil", "Gran Canaria", "Offene Runs"],
    bottom: ["Komm in die Gruppe", "Kostenlose Runs", "Nie allein", "Nordostpassat"],
  },
  why: {
    sticker: "Warum in der Gruppe",
    title: "Allein Downwind fahren hat drei Probleme. In der Gruppe keines.",
    alone: "Allein",
    group: "In der Gruppe",
    items: [
      {
        title: "Logistik",
        problem: "Ein Downwind startet an einem Ort und endet an einem anderen. Ohne zweites Auto am Ziel gibt es keinen Run.",
        solution: "Wir regeln die Autos in der Gruppe: ein paar bleiben am Ziel, und wir fahren gemeinsam zum Start.",
      },
      {
        title: "Sicherheit",
        problem: "Brichst du dir den Foil oder gehen dir auf halber Strecke die Beine aus, bist du allein vor Kilometern Küste.",
        solution: "Wir fahren zusammen raus, mit gemeinsamer Route und Ridern, die jeden Ein- und Ausstieg an der Küste kennen.",
      },
      {
        title: "Fortschritt",
        problem: "Den Swell allein durch Ausprobieren lesen zu lernen, dauert ganze Saisons.",
        solution: "Du fährst neben Ridern mit mehr Erfahrung, siehst ihre Linie und übernimmst, was funktioniert.",
      },
    ],
  },
  tagline: {
    label: "Was uns antreibt",
    lines: [
      { text: "Auf Gran Canaria", accent: false },
      { text: "fehlt es nie an Wind.", accent: false },
      { text: "Was gefehlt hat,", accent: false },
      { text: "waren Leute zum Mitfahren.", accent: true },
    ],
  },
  modes: {
    sticker: "Disziplinen",
    title: "Drei Arten, denselben Wind downwind zu fahren",
    lead: "In jeder Ansage steht, für welche Disziplinen die Route passt. Viele Runs mischen Rider aus allen dreien.",
    needs: "Was du brauchst",
    items: [
      {
        name: "SUP Foil",
        text: "Die pure Form. Du paddelst dich im Kabbelwasser hoch und reihst Bumps aneinander, nur mit der Kraft des Meeres.",
        needs: ["Downwind-Board, Foil und Paddel", "Im Kabbelwasser hochpaddeln"],
      },
      {
        name: "Parawing",
        text: "Ein Flügel ohne Gabelbaum, der dir den Schub zum Abheben gibt und den du wegpackst, um den Swell zu surfen.",
        needs: ["Board, Foil und Parawing", "Sicher mit Flügel unterwegs"],
      },
      {
        name: "Wing Foil",
        text: "Konstanter Zug, um Swells zu verbinden und wieder abzuheben, wenn du unterwegs stürzt.",
        needs: ["Board, Foil und Wing", "Raumschots fahren können"],
      },
    ],
  },
  how: {
    sticker: "So läuft's",
    title: "Vom Sofa ins Ziel in drei Schritten",
    steps: [
      { title: "Werde Teil der Community", text: "Hinterlass uns deine Email und komm in die WhatsApp-Gruppe. Dort passiert alles." },
      {
        title: "Hol dir die Ansage",
        text: "Wenn die Vorhersage Wind bestätigt, posten wir Route, Uhrzeit, Treffpunkt und Niveau, meist ein bis zwei Tage vorher.",
      },
      {
        title: "Fahr den Run in der Gruppe",
        text: "Wir stellen Autos am Ziel ab, fahren gemeinsam zum Start und fahren den Run mit dem Passat im Rücken.",
      },
    ],
  },
  community: {
    sticker: "Die Community",
    title: "Angefangen haben ein paar Freunde. Jetzt kommen sogar die Profis.",
    lead: "Alisios ist entstanden, damit niemand mehr allein Downwind fahren muss. Heute ist es eine offene Gruppe von Ridern von der ganzen Insel, und jeden Run teilen wir auf Instagram.",
    instagram: "Zu",
    ridersLabel: "Mit uns Downwind gefahren",
    roles: {
      "Iballa Ruano": "Profi-Riderin aus Gran Canaria",
      "Foil Only": "Foil-Schule und Community aus Teneriffa",
    } as Record<string, string>,
    photos: [
      {
        caption: "Auf dem Wasser",
        alt: "Zwei SUP-Foil-Rider mitten im Downwind auf blauem Meer, einer in pinker Weste paddelt, der andere winkt",
      },
      { caption: "Vor dem Run", alt: "Gruppenselfie am Van mit Boards und Foils, bereit zum Rausfahren" },
      { caption: "Nach dem Run", alt: "Die Gruppe feiert am Ziel mit einem lila Downwind-Board und Bier in der Hand" },
    ],
  },
  team: {
    sticker: "Hinter dem Projekt",
    title: "Vier Freunde, süchtig nach Downwind",
    lead: "Alisios haben vier Freunde gestartet, die einfach nicht mehr mit dem Downwind aufhören konnten. Wir wollten mit mehr Leuten Spaß haben und diesen Adrenalinkick teilen, wenn man Bumps verbindet und der Passat von hinten schiebt.",
    role: "Alisios Crew",
    profile: "Profil ansehen von",
  },
  merch: {
    sticker: "Kollektion 2026",
    title: "Merch der Community",
    lead: "Erste limitierte Auflage im Vorverkauf: produziert wird nur, was reserviert wird.",
    cta: "Sag mir Bescheid zum Vorverkauf",
    tag: "Vorverkauf bald",
    sketchOf: "Skizze von",
    note: "Vorläufige Skizzen. Endgültige Farben und Teile im Vorverkauf.",
    items: [
      { name: "T-Shirt Fliegender Fisch", detail: "Das ganze Logo auf der Brust" },
      { name: "Cap Nordeste", detail: "Trucker mit gesticktem Fisch-Patch" },
      { name: "Hoodie Bump", detail: "Für das Warten am Ziel, wenn es kühl wird" },
    ],
  },
  coming: {
    sticker: "Was kommt",
    title: "Kurse, Pro Runs und Filmen",
    lead: "Wir bauen das als Verein auf, mit Versicherung und ausgebildeten Lehrern. Kreuz beim Anmelden an, was dich interessiert, und du erfährst es vor allen anderen.",
    soon: "Demnächst",
    items: [
      { title: "Rettung und Sicherheit", text: "Selbstrettung, Abschleppen, Signale und Routenplanung. Theorie und Praxis an einem Vormittag." },
      {
        title: "SUP-Foil-Einstieg",
        text: "Im Kabbelwasser hochpaddeln und deine ersten Bumps verbinden, mit einem Coach für zwei Rider.",
      },
      { title: "Parawing-Kurse", text: "Vom Wing zum Parawing, mit jemandem an deiner Seite, der den Weg schon gegangen ist." },
      { title: "Runs mit Stopps", text: "Kurze Abschnitte in der Gruppe, mit Stopps, um die Technik direkt zu korrigieren." },
      { title: "Pro Run", text: "Ein Profi fährt den Downwind mit dir von Anfang bis Ende und zeigt dir seine Linie." },
      { title: "Video von deinem Run", text: "Wir filmen dich vom Wasser oder vom Jetski aus, damit du siehst, was du verbessern kannst." },
    ],
  },
  faq: {
    sticker: "Häufige Fragen",
    title: "Was uns vor dem ersten Downwind gefragt wird",
    items: [
      {
        q: "Was kostet ein Downwind?",
        a: "Die Runs der Community sind kostenlos. Jeder bringt sein eigenes Material mit, und wenn wir Autos teilen, wird das Benzin unter den Mitfahrern aufgeteilt.",
      },
      {
        q: "Welches Niveau brauche ich?",
        a: "Für offene Runs musst du ohne Hilfe abheben und lange Sessions auf dem Wasser durchhalten. Wenn du im Kabbelwasser noch nicht hochkommst, melde dich trotzdem an: wir sagen Bescheid, wenn die Einsteiger-Sessions starten.",
      },
      {
        q: "Welches Material brauche ich?",
        a: "Dein Board und dein Foil, eine Weste oder Impact-Vest, eine Leash und dein Handy in einer wasserdichten Hülle. Wir empfehlen einen Helm. Für Parawing und Wing Foil deinen Flügel.",
      },
      {
        q: "Wo finden die Runs statt?",
        a: "Wir wählen die Route nach Richtung und Stärke des Passats und dem Zustand des Meeres. Route, Treffpunkt und Niveau werden vor jedem Run in der Gruppe angekündigt.",
      },
      {
        q: "Wie erfahre ich vom nächsten Run?",
        a: "Über die WhatsApp-Gruppe und auf Instagram. Wir sagen Bescheid, sobald die Vorhersage Wind bestätigt, meist ein bis zwei Tage vorher.",
      },
      {
        q: "Kann ich mitmachen, wenn ich nur auf der Insel zu Besuch bin?",
        a: "Ja. Schreib uns ein paar Tage vorher, und wir sagen dir, welche Runs zu deinem Niveau passen und ob noch ein Platz im Auto frei ist.",
      },
      {
        q: "Verleiht ihr Material?",
        a: "Noch nicht. Wenn du etwas brauchst, empfehlen wir dir Shops auf der Insel, mit denen wir in Kontakt sind.",
      },
      {
        q: "Wer ist auf dem Wasser verantwortlich?",
        a: "Bei offenen Runs fährt jeder auf eigene Verantwortung und entscheidet nach seinem Niveau und dem Zustand des Meeres. Die Kurse und geführten Sessions, die wir starten, werden versichert und von ausgebildeten Lehrern geleitet.",
      },
      {
        q: "Wann starten die Kurse?",
        a: "Wir arbeiten daran. Kreuz beim Anmelden Kurse an, und wir sagen dir Bescheid, bevor die Plätze freigeschaltet werden.",
      },
      {
        q: "Was macht ihr mit meinen Daten?",
        a: "Wir nutzen sie nur, um dich über Runs und Neuigkeiten der Community zu informieren. Wir geben sie an niemanden weiter, und du kannst dich jederzeit abmelden.",
      },
    ],
  },
  join: {
    title: "Sei beim nächsten Downwind dabei",
    lead: "Wir schreiben dir zu jedem Downwind eine Email und nehmen dich in die WhatsApp-Gruppe auf, in der alles organisiert wird.",
    perks: ["Kostenlos, ohne Beitrag", "Mit einem Klick abmelden", "Kein Spam: nur Runs und Neuigkeiten"],
    name: "Vorname",
    namePlaceholder: "Nayra",
    email: "Email",
    emailPlaceholder: "nayra@email.com",
    modes: "Was fährst du",
    level: "Dein Niveau",
    levelPlaceholder: "Wähle eine Option",
    levels: {
      aprendiendo: "Ich lerne gerade abzuheben",
      choppy: "Ich hebe ab und fahre im Kabbelwasser",
      soltura: "Ich fahre sicher Downwind",
    },
    interests: "Was interessiert dich",
    interestLabels: {
      runs: "Offene Runs",
      cursos: "Kurse und Clinics",
      "pro-run-filmacion": "Pro Runs und Filmen",
      merch: "Merch",
    },
    honeypot: "Dieses Feld nicht ausfüllen",
    consentBefore: "Ich habe die",
    consentLink: "Datenschutzerklärung",
    consentAfter: "gelesen und bin einverstanden, Emails über die Community zu bekommen.",
    successTitle: "Du bist dabei.",
    successText: "Wir schreiben dir, sobald ein Downwind ansteht. Komm in der Zwischenzeit in die Gruppe, dort wird alles organisiert.",
    whatsapp: "Zur WhatsApp-Gruppe",
    follow: "Folge",
  },
  client: {
    nameRequired: "Gib deinen Vornamen ein.",
    emailRequired: "Gib deine Email ein.",
    emailInvalid: "Diese Email sieht nicht gültig aus. Prüf, ob ein @ und eine Domain drin sind.",
    levelRequired: "Wähl dein Niveau, damit wir wissen, welche Runs zu dir passen.",
    consentRequired: "Wir brauchen dein Einverständnis, um dir zu schreiben.",
    review: "Prüf die markierten Felder.",
    sending: "Wird gesendet…",
    submit: "Sei beim nächsten Downwind dabei",
    sendError: "Das Formular konnte nicht gesendet werden. Versuch es nochmal oder schreib uns an",
    mailtoTitle: "Fast geschafft.",
    mailtoText: "Wir haben dein Mailprogramm mit deinen Angaben geöffnet. Schick die Mail ab, und wir nehmen dich in die Liste auf.",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  footer: {
    blurb: "Downwind-Foil-Community auf Gran Canaria. Offene SUP-Foil-, Parawing- und Wing-Foil-Runs.",
    contact: "Fragen? Schreib uns, wir antworten, sobald wir aus dem Wasser sind.",
    community: "Community",
    whatsapp: "WhatsApp-Gruppe",
    legal: "Rechtliches",
    privacy: "Datenschutz",
    legalNotice: "Impressum und Cookies",
    legalLangNote: "(auf Spanisch)",
    madeIn: "Gemacht auf Gran Canaria, mit dem Passat im Rücken",
  },
};

export default de;
