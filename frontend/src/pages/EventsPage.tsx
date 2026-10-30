import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, FilterPill, PageHeader, Reveal, Skeleton, Stat } from "@/components/ui";
import { EventCard } from "@/components/cards";
import { useEvents } from "@/hooks/useContent";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const EventsPage = () => {
  const { data = [], isLoading } = useEvents();
  const [role, setRole] = useState("All");
  const events = useMemo(() => [...data].reverse(), [data]);
  const roles = useMemo(() => [...new Set(events.map((e) => e.role).filter(Boolean) as string[])], [events]);
  const shown = role === "All" ? events : events.filter((e) => e.role === role);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/events"].title}
        description={PAGE_SEO["/events"].description}
        url={`${BASE_URL}/events`}
      />
      <PageHeader
        label="Events & hosting"
        title="On stage,"
        soft="behind the mic"
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
          <Skeleton className="aspect-[3/2] w-full rounded-media" />
        ) : shown.length === 0 ? (
          <Empty>No events here yet.</Empty>
        ) : (
          <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((e) => (
              <Reveal key={e.id}>
                <EventCard event={e} />
              </Reveal>
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
