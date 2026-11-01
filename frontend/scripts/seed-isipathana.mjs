/**
 * seed-isipathana.mjs
 * ─────────────────────────────────────────────────────────────
 * Isipathana-era highlights, sorted into the collections the site already
 * renders:
 *   events                → Events & Hosting page (stage roles: hosting, debating, organising)
 *   awards                → About page, "Recognition & honours"
 *   volunteer_experience  → About page, volunteering
 *
 *   node scripts/seed-isipathana.mjs           preview only, writes nothing
 *   node scripts/seed-isipathana.mjs --write   back up, then upsert
 *
 * Every doc is tagged `seed: "isipathana"` and matched on its key field, so
 * re-running updates in place. Images aren't set here: add photos in the admin.
 * Needs ../serviceAccountKey.json (git-ignored).
 *
 * Dates: "YYYY-MM-DD" / "YYYY-MM" where the post gave one, "YYYY" otherwise.
 * Entries marked `approx` had no date in the source and are placed by context.
 */

import { readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY = join(__dirname, "..", "..", "serviceAccountKey.json");
const WRITE = process.argv.includes("--write");

const SCHOOL = "Isipathana College";
const ISIPATHANA = "Isipathana College, Colombo";
const BIG_MATCH = "Isipathana College & Thurstan College";

/* ── Events: on stage ──────────────────────────────────────────────────── */

const EVENTS = [
  {
    title: "60th Battle of the Brothers: Limited-Overs Encounter",
    organizer: BIG_MATCH,
    role: "Host",
    type: "Other",
    date: "2023",
    location: "R. Premadasa Stadium, Colombo",
    description:
      "Hosted the post-match presentation of the limited-overs encounter of the 60th Battle of the Brothers, " +
      "the annual cricket rivalry between Isipathana and Thurstan.",
    tags: ["Cricket", "Big Match"],
  },
  {
    title: "60th Battle of the Brothers",
    organizer: BIG_MATCH,
    role: "Host",
    type: "Other",
    date: "2023",
    location: "SSC, Colombo",
    description:
      "Hosted the post-match presentation of the 60th Battle of the Brothers at the SSC, congratulating both sides " +
      "on a hard-fought encounter.",
    tags: ["Cricket", "Big Match"],
  },
  {
    title: "58th Battle of the Brothers",
    organizer: BIG_MATCH,
    role: "Host",
    type: "Other",
    date: "2021", // approx
    location: "SSC, Colombo",
    description: "Hosted the post-match presentation of the 58th Battle of the Brothers at the SSC.",
    tags: ["Cricket", "Big Match"],
  },
  {
    title: "49th Big Debate",
    organizer: BIG_MATCH,
    role: "Speaker",
    type: "Other",
    date: "2023", // approx
    location: "Colombo",
    description:
      "My final speech as Captain of the English Debate Team, which I had led since 2020, against Thurstan " +
      "College in the 49th Big Debate. We won.",
    highlights: ["Won the 49th Big Debate", "Final debate as team captain (2020–2023)"],
    tags: ["Debating"],
  },
  {
    title: "48th Big Debate",
    organizer: BIG_MATCH,
    role: "Speaker",
    type: "Other",
    date: "2020-02-24",
    location: "Thurstan College Main Hall, Colombo",
    description:
      "My first debate as Captain of the English Debate Team, and the opening speech of the 48th Big Debate " +
      "against Thurstan College.",
    highlights: ["First debate as team captain", "Opening speaker"],
    tags: ["Debating"],
  },
  {
    title: "Leelananda Memorial Debate 2022",
    organizer: "Isipathana College & Anula Vidyalaya",
    role: "Speaker",
    type: "Other",
    date: "2022",
    location: "Anula Vidyalaya Main Hall, Colombo",
    description:
      "Captained the English Debate Team to victory against Anula Vidyalaya, on a day Isipathana won both the " +
      "English and Sinhala debates. I was named Best Speaker.",
    highlights: ["Best Speaker award", "Won as team captain", "Double victory: English and Sinhala debates"],
    tags: ["Debating"],
  },
  {
    title: "Voice It Debate Tournament",
    organizer: "Chkolaate",
    role: "Speaker",
    type: "Other",
    date: "2020", // approx
    location: "Colombo",
    description:
      'Captained Isipathana College at "Voice It", debating the motion "This House would legalise marijuana".',
    tags: ["Debating"],
  },
  {
    title: "LCIC Awards Ceremony",
    organizer: "Leo Club of Isipathana College",
    role: "Host",
    type: "Other",
    date: "2022", // approx
    location: ISIPATHANA,
    description:
      "Co-hosted the Leo Club's annual awards with Sasindu Nilmantha, celebrating members' service to the " +
      "community. I also received a token of appreciation on the night.",
    tags: ["Leo Club", "Awards"],
  },
  {
    title: "Ground-Breaking Ceremony: New Five-Storey Building",
    organizer: SCHOOL,
    role: "Host",
    type: "Other",
    date: "2022", // approx
    location: ISIPATHANA,
    description: "Hosted the ground-breaking ceremony for the school's new five-storey building.",
    tags: ["School"],
  },
  {
    title: "Prefects' Investiture 2022",
    organizer: "Prefects' Guild of Isipathana College",
    role: "Host",
    type: "Other",
    date: "2022",
    location: ISIPATHANA,
    description: "Hosted the investiture of the 2022 Prefects' Guild.",
    tags: ["School", "Leadership"],
  },
  {
    title: "Prefects' Investiture 2021",
    organizer: "Prefects' Guild of Isipathana College",
    role: "Host",
    type: "Other",
    date: "2021",
    location: ISIPATHANA,
    description: "Hosted the investiture of the 2021 Prefects' Guild.",
    tags: ["School", "Leadership"],
  },
  {
    title: "Prefects' Induction Ceremony 2021",
    organizer: SCHOOL,
    role: "Host",
    type: "Other",
    date: "2021",
    location: ISIPATHANA,
    description: "Hosted the ceremony welcoming the newly appointed prefects.",
    tags: ["School", "Leadership"],
  },
  {
    title: "Students' Induction Ceremony 2021",
    organizer: SCHOOL,
    role: "Host",
    type: "Other",
    date: "2021",
    location: ISIPATHANA,
    description: "Co-hosted the ceremony welcoming new students to Isipathana, alongside Sasindu Nilmantha.",
    tags: ["School"],
  },
  {
    title: "Youth Leadership Programme 2021",
    organizer: "Serendib Toastmasters Club & Old Boys' Association of Isipathana College",
    role: "Host",
    type: "Workshop",
    date: "2021",
    location: ISIPATHANA,
    description:
      'Co-hosted the programme with Abdurrahman Fuwaiz and spoke to participants on "You can do it", ' +
      "a session on self-belief and taking on challenges.",
    highlights: ["Co-host", 'Speaker: "You can do it"'],
    tags: ["Leadership", "Public Speaking"],
  },
  {
    title: "Opening of the A/L Science Laboratories",
    organizer: SCHOOL,
    role: "Host",
    type: "Other",
    date: "2021", // approx
    location: ISIPATHANA,
    description: "Hosted the opening ceremony of the school's new Advanced Level science laboratories.",
    tags: ["School", "Science"],
  },
  {
    title: "Science Society Website Launch",
    organizer: "Science Society of Isipathana College",
    role: "Host",
    type: "Other",
    date: "2020", // approx
    location: ISIPATHANA,
    description: "Hosted the official launch of the Science Society's website.",
    tags: ["Science", "Launch"],
  },
  {
    title: "Enigma '20",
    organizer: "Science Society of Isipathana College",
    role: "Host",
    type: "Seminar",
    date: "2020",
    location: ISIPATHANA,
    description: "Hosted the Science Society's motivational event on curiosity, determination and learning.",
    tags: ["Science"],
  },
  {
    title: "Cinnamon Career Day",
    organizer: "Rotary Club of Cinnamon Gardens",
    role: "Host",
    type: "Seminar",
    date: "2020", // approx
    location: "Colombo",
    description:
      "Moderated a career day for students run by the Rotary Club of Cinnamon Gardens with its family " +
      "Interact and Rotaract Clubs, leading discussions with working professionals.",
    highlights: ["Moderator"],
    tags: ["Rotary", "Careers"],
  },
  {
    title: "Knowledge Centre Technology Handover",
    organizer: SCHOOL,
    role: "Host",
    type: "Other",
    date: "2020-03-29",
    location: ISIPATHANA,
    description:
      "Hosted the handover of 30 MacBook Pros and 2 iMacs to the Isipathana College Knowledge Centre.",
    tags: ["School", "Technology"],
  },
  {
    title: "Interact District Assembly 2022",
    organizer: "Interact District 3220",
    role: "Speaker",
    type: "Conference",
    date: "2022",
    location: "Colombo",
    description:
      "Presented the Governor's Shield for the Most Outstanding Interact Club of 2021/22 to the Interact Club " +
      "of Colombo North, and the Best President awards for the year.",
    highlights: ["Presented the Governor's Shield", "Presented Best President awards"],
    tags: ["Interact", "Rotary"],
  },
  {
    title: "31st Interact District Assembly",
    organizer: "Interact District 3220",
    role: "Organizer",
    type: "Conference",
    date: "2021",
    location: "Colombo",
    description:
      "Organised the assembly with the Presidents of the Interact Clubs of D. S. Senanayake College and Asian " +
      "Grammar School. As President, I also led Isipathana's club to the Governor's Shield and 13 awards.",
    highlights: [
      "Co-organiser",
      "Governor's Shield and 13 awards for the Interact Club of Isipathana College",
    ],
    tags: ["Interact", "Rotary"],
  },
  {
    title: "District Christmas Celebrations",
    organizer: "Interact District 3220",
    role: "Organizer",
    type: "Other",
    date: "2020-12",
    location: "Colombo",
    description:
      "Won the district Christmas bid alongside the Interact Clubs of St. Paul's Girls' School, Milagiriya, and " +
      "Stafford International School, then delivered the celebrations despite pandemic restrictions.",
    highlights: ["Won the district bid", "Delivered during the pandemic"],
    tags: ["Interact", "Community"],
  },
  {
    title: "Interaction 2021",
    organizer: "Interact District 3220",
    role: "Organizer",
    type: "Other",
    date: "2021",
    location: "Colombo",
    description:
      "Served on the organising committee for Interaction 2021, a series of district Interact events.",
    tags: ["Interact"],
  },
  {
    title: "Livelight '21",
    organizer: "Interflash Committee 2021",
    role: "Organizer",
    type: "Other",
    date: "2021",
    location: "Colombo",
    description: "Part of the Interflash Committee that planned and delivered Livelight '21.",
    tags: ["Events"],
  },
  {
    title: "Atheethawarjanaya",
    organizer: "Media Unit of Isipathana College",
    role: "Organizer",
    type: "Other",
    date: "2020", // approx
    location: ISIPATHANA,
    description: "Part of the organising crew for the school anniversary event run by the Media Unit.",
    tags: ["Media", "School"],
  },
];

/* ── Awards ────────────────────────────────────────────────────────────── */

const AWARDS = [
  {
    title: "Best Speaker, Leelananda Memorial Debate 2022",
    issuer: "Isipathana College & Anula Vidyalaya",
    date: "2022",
    description: "Named Best Speaker while captaining Isipathana's winning English team.",
  },
  {
    title: "Winners, 49th Big Debate",
    issuer: BIG_MATCH,
    date: "2023", // approx
    description:
      "Captained the English Debate Team to victory over Thurstan College in my final debate for the school.",
  },
  {
    title: "Winners, Leelananda Memorial Debate 2022",
    issuer: "Isipathana College & Anula Vidyalaya",
    date: "2022",
    description: "Led the English team to victory; Isipathana won both the English and Sinhala debates.",
  },
  {
    title: "Governor's Shield, 31st Interact District Assembly",
    issuer: "Interact District 3220",
    date: "2021",
    description:
      "As President, led the Interact Club of Isipathana College to the Governor's Shield and 13 awards in total.",
  },
  {
    title: "Token of Appreciation, LCIC Awards",
    issuer: "Leo Club of Isipathana College",
    date: "2022", // approx
    description: "Recognised for contribution to the Leo Club's community work.",
  },
  {
    title: "Champions, Under-14 Inter-Class Rugby Tournament",
    issuer: SCHOOL,
    date: "2018", // approx
    description: "Won the Under-14 inter-class rugby tournament, played at the Royal College Sports Complex.",
  },
];

/* ── Volunteering ──────────────────────────────────────────────────────── */

const VOLUNTEER = [
  {
    role: "President (31st)",
    organization: "Interact Club of Isipathana College",
    startDate: "2020-06",
    endDate: "2021-06",
    isCurrent: false,
    description: [
      "Appointed the club's 31st President on 30 June 2020 and led the 2020/21 board through the pandemic year.",
      "Won the Governor's Shield and 13 awards at the 31st Interact District Assembly, which I co-organised.",
      "Projects: a beach clean-up at Mount Lavinia with the Interact Club of Thurstan College; 40 dictionaries " +
        "for the school library with the Rotary Club of Cinnamon Gardens and the Interact Club of Burhani " +
        "Serendib School; and the district Christmas celebrations.",
    ].join("\n\n"),
  },
  {
    role: "Secretary",
    organization: "Islamic Society of Isipathana College",
    startDate: "2021",
    endDate: "2022",
    isCurrent: false,
    description:
      "Helped run Rise for Humanity with the Islamic Society of St. Peter's College, collecting and delivering " +
      "donations to orphanages.",
  },
  {
    role: "Secretary",
    organization: "Media Unit of Isipathana College",
    startDate: "2020",
    endDate: "2021",
    isCurrent: false,
    description:
      "Received a donation of media equipment for the unit from the 93/94 group of the Old Boys' Association, " +
      "helped organise the Atheethawarjanaya anniversary event, and handed over to the next board.",
  },
];

/* ── Write ─────────────────────────────────────────────────────────────── */

initializeApp({ credential: cert(JSON.parse(readFileSync(KEY, "utf8"))) });
const db = getFirestore();

const PLAN = [
  { name: "events", items: EVENTS, key: (d) => d.title },
  { name: "awards", items: AWARDS, key: (d) => d.title },
  { name: "volunteer_experience", items: VOLUNTEER, key: (d) => `${d.role} @ ${d.organization}` },
];

const backup = {};
for (const { name, items, key } of PLAN) {
  const snap = await db.collection(name).get();
  const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  backup[name] = existing;
  const byKey = new Map(existing.map((d) => [key(d).toLowerCase(), d]));

  console.log(`\n${name}  (${existing.length} existing)`);
  for (const item of items) {
    const found = byKey.get(key(item).toLowerCase());
    console.log(`  ${found ? "UPDATE" : "CREATE"}  ${key(item)}`);
    if (!WRITE) continue;
    const payload = { ...item, seed: "isipathana", updated_at: FieldValue.serverTimestamp() };
    if (found) await db.collection(name).doc(found.id).set(payload, { merge: true });
    else await db.collection(name).add({ ...payload, created_at: FieldValue.serverTimestamp() });
  }
}

// The Isipathana education card shows its own honours list; only that field is touched.
const HONOURS = [
  {
    award_title: "Best Speaker, Leelananda Memorial Debate",
    award_issuer: "Isipathana College & Anula Vidyalaya",
    award_date_year: 2022,
  },
  { award_title: "Winners, 49th Big Debate (as captain)", award_issuer: BIG_MATCH },
  {
    award_title: "Governor's Shield and 13 awards (as Interact President)",
    award_issuer: "Interact District 3220",
    award_date_year: 2021,
  },
  { award_title: "Token of Appreciation", award_issuer: "LCIC Awards" },
];
const edu = (await db.collection("education").get()).docs.find((d) =>
  String(d.data().school_name ?? "")
    .toLowerCase()
    .includes("isipathana"),
);
backup.education = edu ? [{ id: edu.id, ...edu.data() }] : [];
console.log(`\neducation\n  ${edu ? "UPDATE" : "SKIP (not found)"}  Isipathana honours (${HONOURS.length})`);
if (WRITE && edu) {
  await edu.ref.set(
    { honors_and_awards: HONOURS, updated_at: FieldValue.serverTimestamp() },
    { merge: true },
  );
}

if (WRITE) {
  const file = join(tmpdir(), `isipathana-backup-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nDone. Pre-write snapshot saved to ${file}`);
} else {
  console.log("\nPreview only. Re-run with --write to apply.");
}
