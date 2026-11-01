/**
 * seed-education.mjs
 * ─────────────────────────────────────────────────────────────
 * Writes the education history into Firestore (`education` collection).
 *
 *   node scripts/seed-education.mjs           preview only, writes nothing
 *   node scripts/seed-education.mjs --write   back up, then upsert
 *
 * Entries are matched to existing docs by school name, so re-running it
 * updates in place instead of duplicating. Fields not listed here (logos,
 * media, website links added in the admin) are left untouched.
 * Needs ../serviceAccountKey.json (git-ignored).
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

const EDUCATION = [
  {
    match: "westminster",
    school_name: "University of Westminster",
    school_website_url: "https://www.westminster.ac.uk",
    field_of_study: "Computer Science",
    start_month: "September",
    start_year: 2023,
    end_month: "December",
    end_year: 2027,
    is_current: true,
    description:
      "Studying the theory behind the products I build: algorithms, software engineering, data and systems design, " +
      "put to work in Node.js and Python on real projects alongside the coursework.",
    skills: ["Node.js", "Python"],
    display_order: 1,
  },
  {
    match: "informatics institute",
    school_name: "Informatics Institute of Technology (IIT)",
    school_website_url: "https://www.iit.ac.lk",
    degree: "Foundation Certificate in Higher Education",
    field_of_study: "Computer Science",
    start_month: "January",
    start_year: 2023,
    end_month: "September",
    end_year: 2023,
    is_current: false,
    grade: "Merit",
    show_grade_publicly: true,
    description: "The foundation year that bridged school and university computing, completed with a Merit.",
    skills: ["Teamwork"],
    display_order: 2,
  },
  {
    match: "esoft",
    school_name: "ESOFT Metro Campus",
    school_website_url: "https://esoft.lk",
    degree: "Diploma in Information Technology (DiTEC)",
    start_month: "February",
    start_year: 2020,
    end_month: "September",
    end_year: 2020,
    is_current: false,
    description:
      "A practical IT diploma taken alongside school, and my first structured grounding in computing.",
    skills: ["Presentation Skills", "Team Leadership"],
    display_order: 3,
  },
  {
    match: "isipathana",
    school_name: "Isipathana College, Colombo 05",
    degree: "G.C.E. Advanced Level",
    field_of_study: "Physical Science",
    start_month: "February",
    start_year: 2009,
    end_month: "January",
    end_year: 2023,
    is_current: false,
    // "1 to 13" was a grade range, not a result, so it moves into the description.
    grade: FieldValue.delete(),
    show_grade_publicly: false,
    description: [
      "Thirteen years at Isipathana, from Grade 1 to Grade 13.",
      "",
      "G.C.E. Advanced Level (2022): Physics, Chemistry, Combined Mathematics and General English.",
      "G.C.E. Ordinary Level (2019): English Language, Mathematics, Sinhala Language & Literature, Science, " +
        "History, Arabic Literature, Religion, Business & Accounting Studies, and ICT.",
      "",
      "Outside the classroom I hosted the ground-breaking ceremony for the school's new five-storey building, " +
        "and held leadership roles in ten clubs and societies across debating, service, media and science.",
    ].join("\n"),
    activities_and_societies: [
      "President, Interact Club (2020–21)",
      "Captain, English Debate Team (2020–23)",
      "Vice President, Debating & Oratory Society (2020–21)",
      "Secretary, Media Unit (2020–21)",
      "Secretary, Model United Nations Club (2021–22)",
      "Secretary, Islamic Society (2021–22)",
      "Treasurer, Quiz Circle (2020–21)",
      "Main Organiser, English Literary Association (2020–21)",
      "Main Organiser, Science Society (2020–21)",
      "Organiser, Photography Society (2021–22)",
      "Member, Leo Club",
    ].join("\n"),
    honors_and_awards: [{ award_title: "Token of Appreciation", award_issuer: "LCIC Awards" }],
    skills: ["Event Planning", "Project Management"],
    display_order: 4,
  },
];

// Same limits as the admin form, so every entry stays editable there.
for (const e of EDUCATION) {
  if ((e.activities_and_societies ?? "").length > 500)
    throw new Error(`${e.school_name}: activities > 500 chars`);
  if ((e.description ?? "").length > 1000) throw new Error(`${e.school_name}: description > 1000 chars`);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(KEY, "utf8"))) });
const db = getFirestore();
const col = db.collection("education");

const snap = await col.get();
const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const nameOf = (d) => (d.school_name ?? d.institution ?? "").toLowerCase();

if (WRITE) {
  const backup = join(tmpdir(), `education-backup-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(existing, null, 2));
  console.log(`Backed up ${existing.length} existing doc(s) to ${backup}\n`);
}

for (const { match, ...data } of EDUCATION) {
  const found = existing.find((d) => nameOf(d).includes(match));
  const payload = { ...data, is_published: true, updated_at: FieldValue.serverTimestamp() };
  const label = `${found ? "UPDATE" : "CREATE"}  ${data.school_name}`;

  if (!WRITE) {
    console.log(label + (found ? `  (doc ${found.id})` : ""));
    continue;
  }
  if (found) {
    await col.doc(found.id).set(payload, { merge: true });
  } else {
    await col.add({ ...payload, is_featured: false, created_at: FieldValue.serverTimestamp() });
  }
  console.log(`${label}  done`);
}

if (!WRITE) console.log("\nPreview only. Re-run with --write to apply.");
