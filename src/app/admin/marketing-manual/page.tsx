import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  Presentation,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  PhoneCall,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import ManualPdfButton from "@/components/admin/ManualPdfButton";

type SectionLink = {
  id: string;
  label: string;
};

type RoleCard = {
  title: string;
  modules: string;
  mission: string;
  sla: string;
};

type ModuleCard = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  purpose: string;
  useWhen: string;
};

const sectionLinks: SectionLink[] = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "roles", label: "Role Guide" },
  { id: "modules", label: "Module Guide" },
  { id: "review-sop", label: "Review SOP" },
  { id: "rhythm", label: "Daily Rhythm" },
  { id: "screenshots", label: "Screenshots" },
  { id: "standards", label: "Input Standards" },
  { id: "faq", label: "FAQ" },
];

const roleCards: RoleCard[] = [
  {
    title: "CEO / CRM Ops Admin",
    modules: "CEO Command, Analytics, Content Intelligence, Workboard, Spend, Team, Settings",
    mission: "See what is moving, what is blocked, who owns the fix, and what should scale next.",
    sla: "Daily review by 7:30 PM. Weekly growth review every Monday.",
  },
  {
    title: "Agency Ops",
    modules: "Spend, Analytics, Content Intelligence, Ops Inputs (Agency), Reviews, Workboard",
    mission: "Keep campaign, spend, UTM discipline, optimization notes, and trust signals current.",
    sla: "Spend updated by 11:00 AM. Every active campaign tagged correctly.",
  },
  {
    title: "Content Writer / Social Media",
    modules: "Content Intelligence, Reviews, Analytics, Daily Command, Workboard",
    mission: "Turn search demand, patient objections, review themes, and campaign feedback into the next asset plan.",
    sla: "Every new asset registered same day. High-priority feedback triaged before 2:00 PM.",
  },
  {
    title: "Field Executive",
    modules: "Ops Inputs (Field Activities), Workboard",
    mission: "Capture doctor visits, camps, hoardings, and offline activity with traceable handles.",
    sla: "Every activity logged same day with center, location, owner, and tracking handle.",
  },
  {
    title: "IVR Lead / Telecalling",
    modules: "All Contacts, Hot Leads, Workboard",
    mission: "Move leads fast from new to contacted to qualified, with zero ambiguity.",
    sla: "Hot leads in 10 minutes. New leads in 2 hours. No lead without next action.",
  },
  {
    title: "Counselor",
    modules: "All Contacts, Hot Leads, Reviews, Workboard",
    mission: "Close qualified leads into consults, registrations, or clear next follow-up, and surface patient trust issues from reviews.",
    sla: "Qualified leads actioned same day. Lost leads always need a reason code. Low-rated reviews need owner assignment.",
  },
];

const moduleCards: ModuleCard[] = [
  {
    title: "Daily Command",
    icon: Target,
    purpose: "Start-of-day role view with the most important operational work.",
    useWhen: "Use this first if you want to know what to do right now.",
  },
  {
    title: "Workboard",
    icon: ListChecks,
    purpose: "Role-wise execution checklist with notes, status, and accountability trail.",
    useWhen: "Update after completing each major task block.",
  },
  {
    title: "Contacts / Hot Leads",
    icon: PhoneCall,
    purpose: "Lead progression, follow-up discipline, qualification, and closure tracking.",
    useWhen: "Telecallers and counselors work here all day.",
  },
  {
    title: "Spend",
    icon: TrendingUp,
    purpose: "Channel spend logging and API sync for Meta and Google.",
    useWhen: "Agency updates this daily before leadership review.",
  },
  {
    title: "Ops Inputs",
    icon: Megaphone,
    purpose: "Structured forms for agency reports, field activities, and TV logs.",
    useWhen: "Use whenever offline or campaign execution happens outside lead calls.",
  },
  {
    title: "CEO Command",
    icon: LayoutDashboard,
    purpose: "Executive view of lead volume, follow-up risk, spend, attribution, and action queue.",
    useWhen: "Use for daily review and weekly scale/pause/fix decisions.",
  },
  {
    title: "Reviews",
    icon: MessageSquareQuote,
    purpose: "Track Google-first review intelligence for local SEO, trust signals, featured testimonials, and unresolved low-rated feedback.",
    useWhen: "Use when adding reviews, importing review CSVs, assigning response owners, or selecting featured proof for pages and campaigns.",
  },
  {
    title: "Content Intelligence",
    icon: ScanSearch,
    purpose: "Convert blogs, reels, reviews, telecaller objections, and campaign feedback into a ranked content backlog with clear next actions.",
    useWhen: "Use when registering new assets, logging patient questions, or deciding which topics, keywords, FAQs, reels, or landing pages should be created next.",
  },
];

const firstDaySteps = [
  "Log in, confirm your role tabs, and open Daily Command.",
  "Read your role card and daily SLA before updating any data.",
  "Complete one real task in your assigned module.",
  "Update Workboard note with what was done, what is blocked, and next owner.",
  "Ask CEO/Admin only if the system blocks your flow or role access is wrong.",
];

const dailyRhythm = [
  { time: "09:00 AM", owner: "IVR Lead", action: "Review fresh leads, assign queues, check SLA-sensitive hot leads." },
  { time: "11:00 AM", owner: "Agency Ops", action: "Update spend, campaign status, and optimization notes." },
  { time: "03:00 PM", owner: "Field + IVR + Counselors", action: "Mid-day correction round and missing data closure." },
  { time: "07:00 PM", owner: "All role owners", action: "Update Workboard with done, blocked, and next-step notes." },
  { time: "07:30 PM", owner: "CEO/Admin", action: "Run action queue, assign owners, and close critical red items." },
];

const reviewSop = [
  "Ask for Google reviews after a positive consult, milestone, or discharge outcome. Do not ask during unresolved service issues.",
  "Log or sync reviews into the Reviews tab. Google is the primary trust and local SEO signal.",
  "If rating is 1 to 3, assign a response owner the same day and add the operational issue in notes.",
  "Only mark reviews as Featured if they are genuine, center-relevant, and safe to reuse in website and ad creatives.",
  "Recurring review themes should be fed into blogs, FAQs, ad copy, counselor scripts, and CEO action review.",
];

const standards = [
  {
    title: "Lead Status",
    value: "new > contacted > qualified > consult_booked > converted or lost",
  },
  {
    title: "Lead Sources",
    value: "neodove, meta, google, organic, ivr, whatsapp, referral, offline_event, hoarding_qr",
  },
  {
    title: "Lost Reasons",
    value: "price, delay, not_ready, family_decision, competitor, no_response, medical_deferral, invalid_lead",
  },
  {
    title: "Rule",
    value: "If work is not updated in CRM, it is treated as not done.",
  },
  {
    title: "Review Rule",
    value: "Google reviews are primary. Low-rated pending reviews must have a response owner and operational follow-up.",
  },
];

const faqs = [
  {
    question: "Why am I unable to see some tabs?",
    answer: "CRM is role-based. You only see the modules mapped to your role and responsibility.",
  },
  {
    question: "What should I do first after login?",
    answer: "Open Daily Command, check your role tasks, then move to the module where you must update data.",
  },
  {
    question: "When should I use Workboard?",
    answer: "Use it after each task block. Workboard is the visibility layer for leadership, not optional documentation.",
  },
  {
    question: "Why are UTM tags important?",
    answer: "Without UTM and asset tags, the CEO cannot trust ROI, source quality, or cost per registration.",
  },
  {
    question: "Why does the CRM have a Reviews tab?",
    answer: "Reviews are trust intelligence. Positive reviews become testimonials and ad proof; negative reviews become CEO action items for response, counseling, waiting time, or transparency fixes.",
  },
  {
    question: "Why does the CRM have a Content Intelligence tab?",
    answer: "It closes the loop between publishing and learning. Writers, agency, counselors, and telecallers can log what patients actually ask, which topics are under-covered, and what content should be created or refreshed next.",
  },
  {
    question: "Can I close a lead without a reason?",
    answer: "No. Lost, deferred, and pending leads must always have a reason or next action.",
  },
  {
    question: "Should Meta and Google reviews be treated the same?",
    answer: "No. Google reviews are the primary reputation and local SEO signal. Meta can be logged too, but Google should be used as the main operating source.",
  },
  {
    question: "What should field team always include?",
    answer: "Center, location, activity type, owner, and at least one tracking handle such as QR, call number, or WhatsApp number.",
  },
  {
    question: "What if the data looks wrong in CEO Command?",
    answer: "First check whether the source module was updated correctly. Most dashboard issues are input-discipline issues, not code issues.",
  },
  {
    question: "Who should I contact for help?",
    answer: "P0 issues go to CEO/Admin immediately. Role confusion or reset issues also go to CRM Ops Admin.",
  },
];

function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
    >
      {label}
    </a>
  );
}

export default function MarketingManualPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f3ee_0%,#eef3ef_48%,#f7f4ef_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section
          id="overview"
          className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#355d57_0%,#1d3432_42%,#102322_100%)] text-white shadow-[0_30px_80px_rgba(17,34,34,0.18)]"
        >
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.3fr_0.7fr] md:px-10 md:py-10">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="no-print inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Santaan Growth OS
                </span>
              </div>
              <h1 className="max-w-4xl font-playfair text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                Santaan CRM Training Manual
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/78 md:text-lg">
                This is the operating page for every CRM user. It explains what each team member must do,
                where they must do it, how leadership reviews it, and what standards make the dashboard trustworthy.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {sectionLinks.map((item) => (
                  <NavPill key={item.id} href={`#${item.id}`} label={item.label} />
                ))}
                <Link
                  href="/admin/training-deck"
                  className="no-print inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  Open Training Deck
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Core Rule
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">If it is not in CRM, it is not done.</p>
                </div>
                <div className="no-print">
                  <ManualPdfButton />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">Who this is for</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    CEO/Admin, Agency Ops, Field teams, IVR and telecallers, and center counselors.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">What success looks like</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    The CEO can see where leads are coming from, where they are leaking, and who must act today.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">What this page is</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Training manual, reference page, role handbook, and FAQ in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Jump to
              </p>
              <div className="space-y-2">
                {sectionLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <main className="space-y-8">
            <section
              id="quickstart"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Quick Start for New Users</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Use this if someone is opening CRM for the first time.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                {firstDaySteps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f6f1_100%)] p-4"
                  >
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="roles"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Role Guide</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Each role has a different mission. The dashboard is only useful if each role updates the right things.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {roleCards.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fffefc_0%,#f4f7f5_100%)] p-5"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-900">Modules:</span> {item.modules}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-900">Mission:</span> {item.mission}
                    </p>
                    <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      SLA: {item.sla}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="modules"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Module Guide</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This is the fastest way to understand which part of CRM should be used for which type of work.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {moduleCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8faf9_100%)] p-5"
                    >
                      <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{item.purpose}</p>
                      <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Use when:</span> {item.useWhen}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section
              id="review-sop"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Review Response SOP</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Reviews are part of the growth system. They affect local SEO, trust, ad proof, and operational correction.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  {reviewSop.map((item, index) => (
                    <div
                      key={item}
                      className="grid gap-3 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#f7faf8_0%,#ffffff_100%)] p-4 md:grid-cols-[48px_minmax(0,1fr)] md:items-start"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="text-sm leading-6 text-slate-700">{item}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5">
                    <p className="text-sm font-semibold text-slate-900">Use featured reviews for</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                      <li>Homepage and center-page trust proof</li>
                      <li>Ad copy, reel scripts, and counselor reassurance</li>
                      <li>Doctor profile credibility and local authority</li>
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-rose-100 bg-rose-50/80 p-5">
                    <p className="text-sm font-semibold text-slate-900">Escalate low-rated reviews for</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                      <li>Waiting time and response delays</li>
                      <li>Cost transparency and counseling clarity</li>
                      <li>Staff behavior, privacy, and process gaps</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="rhythm"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Daily Operating Rhythm</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    The dashboard becomes useful only when updates follow a fixed daily discipline.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {dailyRhythm.map((item) => (
                  <div
                    key={`${item.time}-${item.owner}`}
                    className="grid gap-3 rounded-[24px] border border-slate-200 bg-[linear-gradient(90deg,#f7faf8_0%,#ffffff_100%)] p-4 md:grid-cols-[120px_200px_minmax(0,1fr)] md:items-center"
                  >
                    <div className="text-base font-semibold text-slate-900">{item.time}</div>
                    <div className="text-sm font-medium text-slate-700">{item.owner}</div>
                    <div className="text-sm leading-6 text-slate-600">{item.action}</div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="screenshots"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                    <ScanSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Visual Walkthrough</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Screenshot-based reference for onboarding and refresh training.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/manual-screenshots"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open Full Screenshot Guide
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { src: "/training/login-screen.png", label: "Login & role guidance" },
                  { src: "/training/crm-role-guide.png", label: "Role checklist inside CRM" },
                  { src: "/training/ops-inputs-agency.png", label: "Structured input forms with help hints" },
                ].map((item) => (
                  <article key={item.src} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <Image src={item.src} alt={item.label} width={1200} height={760} className="h-auto w-full" />
                    <p className="px-3 py-2 text-sm text-slate-700">{item.label}</p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="standards"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Input Standards</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Data quality is not an admin problem. It is a role discipline problem.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {standards.map((item) => (
                  <article key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-800">{item.value}</p>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
                UTM and asset tags are mandatory for campaigns, QR assets, and media links. Missing tags mean the CEO sees weak attribution, weak ROI, and weak accountability.
              </div>
            </section>

            <section
              id="faq"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                  <CircleHelp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Fast answers for daily use, onboarding, and troubleshooting.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {faqs.map((item, index) => (
                  <details
                    key={item.question}
                    className="group rounded-[20px] border border-slate-200 bg-slate-50 p-4 open:bg-white"
                  >
                    <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                      <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      {item.question}
                    </summary>
                    <p className="mt-4 pl-10 text-sm leading-7 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-rose-200 bg-[linear-gradient(180deg,#fff5f5_0%,#fff 100%)] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8">
              <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
                <div>
                  <div className="mb-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Escalation
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">When to escalate</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    P0 issues are login failures, save failures, broken role access, or security concerns. P1 issues are wrong visibility, broken KPI interpretation, or workflows that block daily execution.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[20px] border border-rose-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-rose-700" />
                      <p className="font-semibold text-slate-900">P0 Rule</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Escalate immediately to CEO/Admin.</p>
                  </div>
                  <div className="rounded-[20px] border border-amber-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-700" />
                      <p className="font-semibold text-slate-900">P1 Rule</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Close same day with clear owner and ETA.</p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <LifeBuoy className="h-5 w-5 text-slate-700" />
                      <p className="font-semibold text-slate-900">Support Principle</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      First check whether the source module was updated correctly before assuming the dashboard is wrong.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
