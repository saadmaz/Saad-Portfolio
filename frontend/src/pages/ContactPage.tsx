import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Field, FilterPill } from "@/components/ui";
import { useContactMutation } from "@/hooks/useContent";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const INTERESTS = ["Product build", "AI integration", "Speaking", "Hosting", "Something else"];
const BUDGETS = ["< $2k", "$2–10k", "$10k+", "Not sure"];
const EMPTY = { name: "", email: "", message: "", website: "" };

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY);
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [budget, setBudget] = useState(BUDGETS[3]);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const mutation = useContactMutation();

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Please add your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please add a valid email";
    if (form.message.trim().length < 10) next.message = "A sentence or two helps (10+ characters)";
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate({ ...form, subject: `${interest} · ${budget}` }, { onSuccess: () => setForm(EMPTY) });
  };

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/contact"].title}
        description={PAGE_SEO["/contact"].description}
        url={`${BASE_URL}/contact`}
      />
      <section className="relative -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[88px] lg:pt-[88px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_10%_20%,rgb(255_106_0/0.14),transparent_70%)]"
        />
        <div className="wrap relative grid gap-16 pb-32 pt-12 lg:grid-cols-[1fr_560px] lg:gap-24 lg:pt-24">
          <div className="flex flex-col gap-10">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="text-display-m font-medium xl:text-display-l">
              Let’s build <span className="soft">something good.</span>
            </h1>
            <p className="max-w-[520px] text-body-l text-fg-2">
              Product builds, startup collaborations, speaking and hosting. Tell me what you’re working on and
              I’ll reply within a day.
            </p>
            <dl className="border-b border-line-2">
              {[
                [
                  "Email",
                  <a key="e" href={`mailto:${CONTACT.email}`} className="hover:text-accent">
                    {CONTACT.email}
                  </a>,
                ],
                [
                  "Phone",
                  <a key="p" href={CONTACT.phoneHref} className="hover:text-accent">
                    {CONTACT.phone}
                  </a>,
                ],
                ["Based in", CONTACT.location],
                ["Elsewhere", <SocialLinks key="s" size="sm" />],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="flex flex-col gap-1.5 border-t border-line-2 py-5 sm:flex-row sm:items-center sm:gap-0"
                >
                  <dt className="label text-fg-3 sm:w-36">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="h-fit rounded-[28px] border border-line bg-surface p-6 md:p-10">
            {mutation.isSuccess ? (
              <div className="flex flex-col items-start gap-5 py-10">
                <CheckCircle2 aria-hidden className="size-10 text-live" />
                <h2 className="text-h2 font-medium">Message sent.</h2>
                <p className="text-fg-2">Thanks for reaching out. I’ll reply to your email within a day.</p>
                <Button variant="secondary" icon={false} onClick={() => mutation.reset()}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-6">
                <h2 className="text-h3 font-medium">Start a project</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Jane Perera"
                    autoComplete="name"
                    error={errors.name}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="jane@company.com"
                    autoComplete="email"
                    error={errors.email}
                  />
                </div>
                <fieldset className="flex flex-col gap-3">
                  <legend className="label mb-3 text-fg-3">I’m interested in</legend>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <FilterPill key={i} active={interest === i} onClick={() => setInterest(i)}>
                        {i}
                      </FilterPill>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="flex flex-col gap-3">
                  <legend className="label mb-3 text-fg-3">Budget</legend>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <FilterPill key={b} active={budget === b} onClick={() => setBudget(b)}>
                        {b}
                      </FilterPill>
                    ))}
                  </div>
                </fieldset>
                <Field
                  label="Project details"
                  name="message"
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell me about the project, timeline and budget"
                  multiline
                  error={errors.message}
                />
                {/* Honeypot: hidden from people, bots fill it in. */}
                <label className="absolute -left-[9999px]" aria-hidden>
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website")(e.target.value)}
                  />
                </label>
                {mutation.isError && (
                  <p role="alert" className="rounded-xl bg-danger/[0.12] px-4 py-3 text-sm text-danger">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Couldn’t send. Please try again."}
                  </p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send message"}
                </Button>
                <a
                  href={CONTACT.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-meta text-fg-2 hover:text-fg"
                >
                  Or book a 30-min call →
                </a>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
