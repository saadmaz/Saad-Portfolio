import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, FilterPill, PageHeader, Reveal, Skeleton, Stat } from "@/components/ui";
import { EventCard } from "@/components/cards";
import { useEvents } from "@/hooks/useContent";
import { parseEventDate } from "@/lib/eventDates";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const EventsPage = () => {
  const { data = [], isLoading } = useEvents();
  const [role, setRole] = useState("All");
  // Already newest-first from the service.
  const events = data;
  const roles = useMemo(() => [...new Set(events.map((e) => e.role).filter(Boolean) as string[])], [events]);
  const groups = useMemo(() => {
    const shown = role === "All" ? events : events.filter((e) => e.role === role);
    const byYear = new Map<string, typeof events>();
    for (const e of shown) {
      const key = String(parseEventDate(e.date).year ?? "Undated");
      byYear.set(key, [...(byYear.get(key) ?? []), e]);
    }
    return [...byYear];
  }, [events, role]);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/events"].title}
        description={PAGE_SEO["/events"].description}
        url={`${BASE_URL}/events`}
      />
      <PageHeader
        label="Events & hosting"
        title="Holding the room,"
        soft="one stage at a time"
        aside={events.length > 0 && <Stat value={events.length} label="Events" />}
      >
        {roles.length > 1 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-line-2 pt-8">
            {["All", ...roles].map((r) => (
              <FilterPill key={r} active={role === r} onClick={() => setRole(r)}>
                {r === "All" ? `All · ${events.length}` : r}
              </FilterPill>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="wrap pb-24">
        {isLoading ? (
          <Skeleton className="aspect-video w-full rounded-media" />
        ) : groups.length === 0 ? (
          <Empty>No events here yet.</Empty>
        ) : (
          <div className="flex flex-col gap-20">
            {groups.map(([year, list]) => (
              <section key={year} aria-labelledby={`events-${year}`}>
                <div className="mb-10 flex items-center gap-4">
                  <h2 id={`events-${year}`} className="text-h2 font-medium tabular-nums">
                    {year}
                  </h2>
                  <span className="label text-fg-3">
                    {list.length} {list.length === 1 ? "event" : "events"}
                  </span>
                  <div className="h-px flex-1 bg-line-2" aria-hidden="true" />
                </div>
                <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((e) => (
                    <Reveal key={e.id}>
                      <EventCard event={e} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="text-display-m font-medium">
            Need a host or speaker <span className="soft">for your event?</span>
          </h2>
          <Button to="/contact" size="lg">
            Send an invite
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
