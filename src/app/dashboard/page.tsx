import Link from "next/link";
import { db } from "@/lib/db";
import {
  CHART_NOMINAL_COLOR,
  SOURCE_LABELS,
  SOURCES,
  STAGE_CHART_COLORS,
  STAGE_LABELS,
  STAGES,
} from "@/lib/constants";
import BarChart from "@/components/charts/BarChart";
import StackedBarChart from "@/components/charts/StackedBarChart";
import {
  AlertIcon,
  ClockIcon,
  HourglassIcon,
  LayersIcon,
  TrendIcon,
  UsersIcon,
} from "@/components/icons";

function fmtPct(n: number, d: number): string {
  if (d === 0) return "—";
  return `${((n / d) * 100).toFixed(0)}%`;
}

const INDIGO = "#4338ca";
const SKY = "#0284c7";
const VIOLET = "#7c3aed";

export default async function DashboardPage() {
  const leads = await db.lead.findMany();

  const total = leads.length;
  const won = leads.filter((l) => l.stage === "WON");
  const lost = leads.filter((l) => l.stage === "LOST");
  const open = leads.filter((l) => l.stage !== "WON" && l.stage !== "LOST");
  const closed = won.length + lost.length;

  const wonValue = won.reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0);

  const avgDaysToClose =
    won.length > 0
      ? won.reduce((sum, l) => {
          const days =
            (new Date(l.updatedAt).getTime() -
              new Date(l.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / won.length
      : null;

  const now = new Date();
  const overdue = leads
    .filter(
      (l) =>
        l.nextFollowUp &&
        new Date(l.nextFollowUp) < now &&
        l.stage !== "WON" &&
        l.stage !== "LOST"
    )
    .sort(
      (a, b) =>
        new Date(a.nextFollowUp!).getTime() -
        new Date(b.nextFollowUp!).getTime()
    );

  // Leads by stage — ordinal funnel ramp for the pipeline stages, fixed
  // status colors for the terminal Won/Lost outcomes.
  const stageChartData = STAGES.map((stage) => ({
    key: stage,
    label: STAGE_LABELS[stage],
    value: leads.filter((l) => l.stage === stage).length,
    color: STAGE_CHART_COLORS[stage],
  }));

  // Leads by source — one series split by dimension, so every bar shares
  // the same nominal hue rather than being colored per-source.
  const sourceChartData = SOURCES.map((source) => ({
    key: source,
    label: SOURCE_LABELS[source],
    value: leads.filter((l) => l.source === source).length,
  })).filter((d) => d.value > 0);

  // Leads by person, broken down by stage — the owner rows are sorted by
  // total lead count so the busiest reps read top to bottom.
  const owners = Array.from(
    new Set(leads.map((l) => l.owner?.trim() || "Unassigned"))
  );
  const ownerStageRows = owners
    .map((owner) => {
      const ownerLeads = leads.filter(
        (l) => (l.owner?.trim() || "Unassigned") === owner
      );
      return {
        key: owner,
        label: owner,
        segments: STAGES.map((stage) => ({
          key: stage,
          label: STAGE_LABELS[stage],
          value: ownerLeads.filter((l) => l.stage === stage).length,
          color: STAGE_CHART_COLORS[stage],
        })),
        total: ownerLeads.length,
      };
    })
    .sort((a, b) => b.total - a.total);

  const stageLegend = STAGES.map((stage) => ({
    key: stage,
    label: STAGE_LABELS[stage],
    color: STAGE_CHART_COLORS[stage],
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={total.toString()}
          delay={0}
          color={INDIGO}
          icon={LayersIcon}
          href="/pipeline"
        />
        <StatCard
          label="Open"
          value={open.length.toString()}
          delay={60}
          color={SKY}
          icon={ClockIcon}
          href="/pipeline"
        />
        <StatCard
          label="Win Rate (closed)"
          value={fmtPct(won.length, closed)}
          delay={120}
          color={STAGE_CHART_COLORS.WON}
          icon={TrendIcon}
          href="/pipeline?stage=WON"
        />
        <StatCard
          label="Avg. Days to Close"
          value={avgDaysToClose != null ? avgDaysToClose.toFixed(1) : "—"}
          delay={180}
          color={VIOLET}
          icon={HourglassIcon}
          href="/pipeline?stage=WON"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartPanel
          title="Leads by Stage"
          color={INDIGO}
          icon={LayersIcon}
          delay="240ms"
        >
          <BarChart data={stageChartData} hrefPrefix="/pipeline?stage=" />
          <div className="mt-4 border-t border-stone-100 pt-3 text-sm text-stone-600">
            Won value:{" "}
            <span className="font-medium text-emerald-700">
              ${wonValue.toLocaleString()}
            </span>
          </div>
        </ChartPanel>

        <ChartPanel
          title="Leads by Source"
          color={CHART_NOMINAL_COLOR}
          icon={TrendIcon}
          delay="300ms"
        >
          <BarChart
            data={sourceChartData}
            color={CHART_NOMINAL_COLOR}
            hrefPrefix="/pipeline?source="
          />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Leads by Person, by Stage"
        subtitle="Each bar is one owner's leads, segmented by pipeline stage. Click a segment to drill in."
        color={VIOLET}
        icon={UsersIcon}
        delay="360ms"
      >
        <StackedBarChart
          rows={ownerStageRows}
          legend={stageLegend}
          segmentHrefPrefix="/pipeline?stage="
        />
      </ChartPanel>

      <ChartPanel
        title={`Overdue Follow-ups (${overdue.length})`}
        color={STAGE_CHART_COLORS.LOST}
        icon={AlertIcon}
        delay="420ms"
      >
        {overdue.length === 0 && (
          <p className="text-sm text-stone-400">Nothing overdue. Nice.</p>
        )}
        <ul className="space-y-2">
          {overdue.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between text-sm"
            >
              <Link
                href={`/leads/${lead.id}`}
                className="text-stone-700 transition-colors hover:text-indigo-700"
              >
                {lead.name}
              </Link>
              <span className="text-red-500">
                due {new Date(lead.nextFollowUp!).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </ChartPanel>
    </div>
  );
}

type IconComponent = (props: { className?: string }) => React.ReactElement;

function StatCard({
  label,
  value,
  delay,
  color,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  delay: number;
  color: string;
  icon: IconComponent;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group animate-fade-in-up rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_var(--card-glow)]"
      style={
        {
          background: `linear-gradient(150deg, ${color}14 0%, #ffffff 60%)`,
          border: `1px solid ${color}2a`,
          animationDelay: `${delay}ms`,
          "--card-glow": `${color}4d`,
        } as React.CSSProperties
      }
    >
      <div
        className="flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{
          width: "2.25rem",
          height: "2.25rem",
          backgroundColor: `${color}1a`,
          color,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs font-medium text-stone-500">{label}</div>
      <div className="mt-0.5 text-3xl font-semibold text-stone-900">
        {value}
      </div>
    </Link>
  );
}

function ChartPanel({
  title,
  subtitle,
  color,
  icon: Icon,
  delay,
  children,
}: {
  title: string;
  subtitle?: string;
  color: string;
  icon: IconComponent;
  delay: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="animate-fade-in-up rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]"
      style={{
        background: `linear-gradient(150deg, ${color}0d 0%, #ffffff 42%)`,
        border: `1px solid ${color}22`,
        animationDelay: delay,
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: "1.75rem",
            height: "1.75rem",
            backgroundColor: `${color}1a`,
            color,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-stone-700">{title}</h2>
      </div>
      {subtitle && (
        <p className="mb-4 ml-9 text-xs text-stone-400">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}
