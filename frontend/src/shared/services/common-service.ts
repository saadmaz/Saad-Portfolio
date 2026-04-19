/**
 * shared/services/common-service.ts
 * ─────────────────────────────────────────────────────────────
 * CRUD operations for every entity that isn't a Project or BlogPost.
 * All calls now go directly to Firestore - no Express proxy.
 *
 * BEFORE: browser → axios → Express (/api/...) → Firebase Admin → Firestore
 * AFTER:  browser → Firebase SDK → Firestore
 *
 * The public class API (CommonService.*) is kept identical so every
 * admin page compiles without changes.
 *
 * Contact form is the ONE exception that still uses an HTTP call -
 * it hits /api/contact (a Vercel serverless function) because SendGrid
 * credentials must never be exposed to the browser.
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Experience,
  SkillSet,
  Certificate,
  Award,
  Language,
  Hackathon,
  Testimonial,
  VolunteerExperience,
  Education,
  ActivityLog,
  Message,
  Event,
  Newsletter,
} from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Generic "get all documents from a collection" helper.
 * Returns typed results or an empty array on error.
 */
async function fetchAll<T>(col: string, sortField?: string): Promise<T[]> {
  try {
    const q = sortField
      ? query(collection(db, col), orderBy(sortField, "asc"))
      : collection(db, col);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  } catch (error) {
    console.error(`[CommonService] fetchAll(${col}):`, error);
    return [];
  }
}

/** Generic add-document helper. Returns the new item with its generated ID. */
async function createDoc<T>(col: string, data: Partial<T>): Promise<T> {
  const ref = await addDoc(collection(db, col), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { id: ref.id, ...data } as T;
}

/** Generic merge-update helper. */
async function updateDoc_<T>(col: string, id: string | number, data: Partial<T>): Promise<T> {
  await updateDoc(doc(db, col, String(id)), {
    ...data,
    updated_at: serverTimestamp(),
  });
  return { id, ...data } as T;
}

/** Generic delete helper. */
async function deleteDoc_(col: string, id: string | number): Promise<void> {
  await deleteDoc(doc(db, col, String(id)));
}

// ─── Collection names (must match your Firestore database) ───────
const COLLECTIONS = {
  experience:   "work_experience",
  skills:       "skills",
  certificates: "certificates",
  awards:       "awards",
  languages:    "languages",
  hackathons:   "hackathons",
  testimonials: "testimonials",
  volunteer:    "volunteer_experience",
  education:    "education",
  logs:         "activity_logs",
  messages:     "contact_messages",
  events:       "events",
  newsletters:  "newsletters",
} as const;

// ─── Public class API ─────────────────────────────────────────────
export class CommonService {

  // ── Work Experience ──────────────────────────────────────────────

  static async getWorkExperience(): Promise<Experience[]> {
    return fetchAll<Experience>(COLLECTIONS.experience, "order_index");
  }

  static async createExperience(data: Partial<Experience>): Promise<Experience> {
    return createDoc<Experience>(COLLECTIONS.experience, data);
  }

  static async updateExperience(id: string | number, data: Partial<Experience>): Promise<Experience> {
    return updateDoc_<Experience>(COLLECTIONS.experience, id, data);
  }

  static async deleteExperience(id: string | number): Promise<void> {
    return deleteDoc_(COLLECTIONS.experience, id);
  }

  // ── Skills ───────────────────────────────────────────────────────
  // Each Firestore document is a skill category (SkillSet: { category, skills[] })

  static async getSkills(): Promise<SkillSet[]> {
    return fetchAll<SkillSet>(COLLECTIONS.skills);
  }

  /**
   * Bulk-replace the entire skills dataset.
   * Reads all existing docs, deletes them, then writes the new set.
   * Used by the admin Skills page which manages skills as a group.
   */
  static async updateSkills(data: SkillSet[]): Promise<SkillSet[]> {
    // 1. Delete every existing skill-set document
    const existing = await getDocs(collection(db, COLLECTIONS.skills));
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));

    // 2. Write each new skill-set as its own document
    const created = await Promise.all(
      data.map((skillSet) =>
        addDoc(collection(db, COLLECTIONS.skills), {
          ...skillSet,
          updated_at: serverTimestamp(),
        })
      )
    );
    return data.map((s, i) => ({ id: created[i].id, ...s })) as SkillSet[];
  }

  // ── Certificates ─────────────────────────────────────────────────

  static async getCertificates(): Promise<Certificate[]> {
    return fetchAll<Certificate>(COLLECTIONS.certificates);
  }

  static async createCertificate(data: Partial<Certificate>): Promise<Certificate> {
    return createDoc<Certificate>(COLLECTIONS.certificates, data);
  }

  static async updateCertificate(id: string | number, data: Partial<Certificate>): Promise<Certificate> {
    return updateDoc_<Certificate>(COLLECTIONS.certificates, id, data);
  }

  static async deleteCertificate(id: string | number): Promise<void> {
    return deleteDoc_(COLLECTIONS.certificates, id);
  }

  // ── Awards ───────────────────────────────────────────────────────

  static async getAwards(): Promise<Award[]> {
    return fetchAll<Award>(COLLECTIONS.awards);
  }

  static async createAward(data: Partial<Award>): Promise<Award> {
    return createDoc<Award>(COLLECTIONS.awards, data);
  }

  static async updateAward(id: string, data: Partial<Award>): Promise<Award> {
    return updateDoc_<Award>(COLLECTIONS.awards, id, data);
  }

  static async deleteAward(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.awards, id);
  }

  // ── Languages ────────────────────────────────────────────────────

  static async getLanguages(): Promise<Language[]> {
    return fetchAll<Language>(COLLECTIONS.languages);
  }

  static async createLanguage(data: Partial<Language>): Promise<Language> {
    return createDoc<Language>(COLLECTIONS.languages, data);
  }

  static async updateLanguage(id: string, data: Partial<Language>): Promise<Language> {
    return updateDoc_<Language>(COLLECTIONS.languages, id, data);
  }

  static async deleteLanguage(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.languages, id);
  }

  // ── Hackathons ───────────────────────────────────────────────────

  static async getHackathons(): Promise<Hackathon[]> {
    return fetchAll<Hackathon>(COLLECTIONS.hackathons);
  }

  static async createHackathon(data: Partial<Hackathon>): Promise<Hackathon> {
    return createDoc<Hackathon>(COLLECTIONS.hackathons, data);
  }

  static async updateHackathon(id: string, data: Partial<Hackathon>): Promise<Hackathon> {
    return updateDoc_<Hackathon>(COLLECTIONS.hackathons, id, data);
  }

  static async deleteHackathon(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.hackathons, id);
  }

  // ── Testimonials ─────────────────────────────────────────────────

  static async getTestimonials(): Promise<Testimonial[]> {
    return fetchAll<Testimonial>(COLLECTIONS.testimonials);
  }

  static async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    return createDoc<Testimonial>(COLLECTIONS.testimonials, data);
  }

  static async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
    return updateDoc_<Testimonial>(COLLECTIONS.testimonials, id, data);
  }

  static async deleteTestimonial(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.testimonials, id);
  }

  // ── Volunteer Experience ─────────────────────────────────────────

  static async getVolunteerExperience(): Promise<VolunteerExperience[]> {
    return fetchAll<VolunteerExperience>(COLLECTIONS.volunteer);
  }

  static async createVolunteerExperience(data: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
    return createDoc<VolunteerExperience>(COLLECTIONS.volunteer, data);
  }

  static async updateVolunteerExperience(id: string, data: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
    return updateDoc_<VolunteerExperience>(COLLECTIONS.volunteer, id, data);
  }

  static async deleteVolunteerExperience(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.volunteer, id);
  }

  // ── Education ────────────────────────────────────────────────────

  static async getEducation(): Promise<Education[]> {
    return fetchAll<Education>(COLLECTIONS.education);
  }

  static async createEducation(data: Partial<Education>): Promise<Education> {
    return createDoc<Education>(COLLECTIONS.education, data);
  }

  static async updateEducation(id: string, data: Partial<Education>): Promise<Education> {
    return updateDoc_<Education>(COLLECTIONS.education, id, data);
  }

  static async deleteEducation(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.education, id);
  }

  // ── Activity Logs (read-only from the frontend) ──────────────────

  static async getActivityLogs(): Promise<ActivityLog[]> {
    return fetchAll<ActivityLog>(COLLECTIONS.logs, "timestamp");
  }

  // ── Contact Form ─────────────────────────────────────────────────
  /**
   * Submits a contact form message.
   *
   * This is the ONE remaining HTTP call - it POSTs to the Vercel
   * serverless function at /api/contact which:
   *   1. Saves the message to Firestore via Firebase Admin SDK
   *   2. Sends the email notification via SendGrid
   *
   * We can't do the email from the browser because the SendGrid API
   * key must stay server-side.
   */
  static async submitContact(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    // Save directly to Firestore so messages are always captured
    await addDoc(collection(db, COLLECTIONS.messages), {
      name:       data.name.trim(),
      email:      data.email.trim(),
      subject:    data.subject?.trim() ?? "",
      message:    data.message.trim(),
      created_at: serverTimestamp(),
      read:       false,
    });

    // Fire-and-forget to /api/contact for email notification
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {/* email notification optional */});
  }

  // ── Admin Messages (contact submissions) ────────────────────────

  static async getMessages(): Promise<Message[]> {
    return fetchAll<Message>(COLLECTIONS.messages, "created_at");
  }

  static async updateMessage(id: string, data: Partial<Message>): Promise<void> {
    await updateDoc_<Message>(COLLECTIONS.messages, id, data);
  }

  static async deleteMessage(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.messages, id);
  }

  // ── Events ───────────────────────────────────────────────────────

  static async getEvents(): Promise<Event[]> {
    return fetchAll<Event>(COLLECTIONS.events, "date");
  }

  static async createEvent(data: Partial<Event>): Promise<Event> {
    return createDoc<Event>(COLLECTIONS.events, data);
  }

  static async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return updateDoc_<Event>(COLLECTIONS.events, id, data);
  }

  static async deleteEvent(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.events, id);
  }

  // ── Newsletters ──────────────────────────────────────────────────

  static async getNewsletters(): Promise<Newsletter[]> {
    return fetchAll<Newsletter>(COLLECTIONS.newsletters, "date");
  }

  static async createNewsletter(data: Partial<Newsletter>): Promise<Newsletter> {
    return createDoc<Newsletter>(COLLECTIONS.newsletters, data);
  }

  static async updateNewsletter(id: string, data: Partial<Newsletter>): Promise<Newsletter> {
    return updateDoc_<Newsletter>(COLLECTIONS.newsletters, id, data);
  }

  static async deleteNewsletter(id: string): Promise<void> {
    return deleteDoc_(COLLECTIONS.newsletters, id);
  }
}
