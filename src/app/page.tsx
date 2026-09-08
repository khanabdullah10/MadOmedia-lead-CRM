import Link from "next/link";
import { db } from "@/lib/db";
import SearchBox from "@/components/SearchBox";
import { STAGE_CHART_COLORS } from "@/lib/constants";
import { AlertIcon, CheckIcon, ClockIcon, LayersIcon } from "@/components/icons";

export default async function HomePage() {
  const [total, open, overdue, won] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    db.lead.count({
      where: {
        nextFollowUp: { lt: new Date() },
        stage: { notIn: ["WON", "LOST"] },
      },
    }),
    db.lead.count({ where: { stage: "WON" } }),
  ]);

  const stats = [
    {
      label: "Total Leads",
      value: total,
      href: "/pipeline",
      color: "#4338ca",
      icon: LayersIcon,
    },
    {
      label: "Open",
      value: open,
      href: "/dashboard",
      color: "#0284c7",
      icon: ClockIcon,
    },
    {
      label: "Overdue Follow-ups",
      value: overdue,
      href: "/dashboard",
      color: STAGE_CHART_COLORS.LOST,
      icon: AlertIcon,
    },
    {
      label: "Won",
      value: won,
      href: "/dashboard",
      color: STAGE_CHART_COLORS.WON,
      icon: CheckIcon,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-indigo-50 via-white to-amber-50 px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Lead CRM
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Find any lead in seconds
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-stone-500">
            Search by name, phone, email, or campaign — then jump straight
            into their pipeline stage.
          </p>

          <div className="mt-8 flex justify-center">
            <SearchBox />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pipeline"
              className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-700/25 transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md"
            >
              Go to Pipeline →
            </Link>
            <Link
              href="/leads/new"
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-sm"
            >
              + Add Lead
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Link
            href={s.href}
            key={s.label}
            className="group animate-fade-in-up rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_var(--card-glow)]"
            style={
              {
                background: `linear-gradient(150deg, ${s.color}14 0%, #ffffff 60%)`,
                border: `1px solid ${s.color}2a`,
                animationDelay: `${i * 60}ms`,
                "--card-glow": `${s.color}4d`,
              } as React.CSSProperties
            }
          >
            <div
              className="flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                backgroundColor: `${s.color}1a`,
                color: s.color,
              }}
            >
              <s.icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-xs font-medium text-stone-500">
              {s.label}
            </div>
            <div className="mt-0.5 text-3xl font-semibold text-stone-900">
              {s.value}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
