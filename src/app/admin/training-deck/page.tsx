import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
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

type RoleSlide = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  mission: string;
  owns: string[];
  dailyMoves: string[];
  scorecard: string[];
  handoff: string;
};

const roleSlides: RoleSlide[] = [
  {
    title: "CEO / CRM Ops Admin",
    icon: Target,
    mission: "Turn dashboard visibility into weekly decisions on scale, pause, fix, and owner accountability.",
    owns: ["CEO Command", "Analytics", "Content Intelligence", "Workboard", "Spend", "Team access", "Settings"],
    dailyMoves: [
      "Review critical red items by 7:30 PM.",
      "Check spend, lead velocity, attribution coverage, and pending follow-ups.",
      "Assign fixes with one clear owner and due date.",
    ],
    scorecard: ["Pending >24h", "Lead to consult velocity", "Spend vs registrations", "Center-wise conversion health"],
    handoff: "Pushes priorities to agency, field, IVR, and counselor owners.",
  },
  {
    title: "Agency Ops / Performance",
    icon: TrendingUp,
    mission: "Keep campaign structure, spend data, UTM discipline, optimization notes, and trust signals accurate every day.",
    owns: ["Spend", "Analytics", "Content Intelligence", "Ops Inputs", "Reviews", "Campaign notes"],
    dailyMoves: [
      "Update spend by 11:00 AM.",
      "Confirm every active campaign has correct UTM template and landing path.",
      "Log campaign changes, pauses, creative tests, and issues.",
    ],
    scorecard: ["Spend completeness", "Tagged campaign coverage", "Campaign-wise CPL", "Actions logged in CRM"],
    handoff: "Hands clean attribution data to CEO and qualified lead context to IVR/counselors.",
  },
  {
    title: "Content Writer / Social Media",
    icon: Sparkles,
    mission: "Convert search demand, review themes, and patient objections into the next blog, FAQ, reel, or post without guesswork.",
    owns: ["Content Intelligence", "Reviews", "Analytics", "Daily Command", "Workboard"],
    dailyMoves: [
      "Review high-priority feedback and demand signals before planning content.",
      "Register every new blog, reel, social post, or FAQ in the asset registry.",
      "Mark refresh targets and next recommended actions clearly for leadership and agency.",
    ],
    scorecard: ["Assets registered same day", "High-priority feedback triaged", "Refresh queue cleared", "Action notes completed"],
    handoff: "Hands content opportunities to agency and leadership as a structured backlog, not a loose idea list.",
  },
  {
    title: "Field Executive",
    icon: Megaphone,
    mission: "Convert offline activity into trackable digital intent with center, location, asset, and outcome clarity.",
    owns: ["Field activities", "Doctor visits", "Camps", "Hoardings", "TV/radio/offline logs"],
    dailyMoves: [
      "Log every visit or activity on the same day.",
      "Attach center, owner, location, and tracking handle.",
      "Record what happened next: calls, scans, registrations, or no response.",
    ],
    scorecard: ["Activities logged same day", "Assets with tracking handles", "Offline source visibility", "Center-level activity volume"],
    handoff: "Feeds trackable offline source data into CRM so ROI is visible later.",
  },
  {
    title: "IVR Lead / Telecalling",
    icon: PhoneCall,
    mission: "Move fresh leads quickly from new to contacted to qualified with no ambiguity or delay.",
    owns: ["All Contacts", "Hot Leads", "Next follow-up discipline", "Outcome logging"],
    dailyMoves: [
      "Hot leads within 10 minutes, all new leads within 2 hours.",
      "Update call outcome, last contact, next follow-up, and reason codes.",
      "Escalate qualified leads to the right counselor immediately.",
    ],
    scorecard: ["Speed to first contact", "Qualified lead count", "No stale leads", "Lost leads with valid reasons"],
    handoff: "Passes qualified leads with clean notes to counselors.",
  },
  {
    title: "Counselor",
    icon: Users,
    mission: "Turn qualified intent into consults, registrations, or a clearly documented next step, while surfacing trust issues from patient feedback.",
    owns: ["Qualified leads", "Consult booking", "Registration outcome", "Lost/deferred reasons", "Review escalation notes"],
    dailyMoves: [
      "Work same-day on every qualified lead.",
      "Update consult status, counselor note, and registration outcome.",
      "Never leave a lead without next action or reason code.",
    ],
    scorecard: ["Qualified-to-consult rate", "Qualified-to-registration rate", "Same-day action discipline", "Reason-code completeness"],
    handoff: "Closes the loop for CEO on which sources become patients and which leak.",
  },
];

const workflowSteps = [
  {
    title: "Campaign / Asset Live",
    owner: "Agency or Field Team",
    detail: "Every digital campaign, hoarding QR, TV spot, camp, or doctor visit must carry a source handle.",
  },
  {
    title: "Lead Enters CRM",
    owner: "Website / NeoDove / Forms / Offline import",
    detail: "Source, landing path, center, and UTM data should reach CRM with the lead record wherever possible.",
  },
  {
    title: "Telecalling Qualification",
    owner: "IVR / Telecalling",
    detail: "Lead is contacted, dispositioned, and either qualified, deferred, or lost with a reason.",
  },
  {
    title: "Counseling Closure",
    owner: "Counselor",
    detail: "Qualified leads become consults, registrations, follow-ups, or documented losses.",
  },
  {
    title: "Leadership Review",
    owner: "CEO / Admin",
    detail: "Leadership sees where demand came from, what converted, where leads leaked, and what to do next.",
  },
];

const teamRules = [
  "If work is not updated in CRM, it is treated as not done.",
  "No lead can be closed without a reason or next step.",
  "Every active campaign must have a clear UTM and landing path.",
  "Every offline asset must have a tracking handle or source code.",
  "Low-rated Google reviews must have an owner, a response status, and an operational fix if the complaint is valid.",
  "Workboard is not optional. It is the accountability layer for leadership.",
];

function Slide({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="deck-slide flex min-h-[88vh] scroll-mt-6 flex-col justify-between overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(20,40,40,0.08)]"
    >
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#183432_0%,#274b47_55%,#406d66_100%)] px-6 py-5 text-white md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
        <h2 className="mt-2 font-playfair text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        {subtitle ? <p className="mt-3 max-w-4xl text-sm leading-6 text-white/80 md:text-lg">{subtitle}</p> : null}
      </div>
      <div className="flex-1 px-6 py-6 md:px-10 md:py-8">{children}</div>
    </section>
  );
}

export default function TrainingDeckPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2efe8_0%,#eaf2ef_52%,#f7f3ec_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="no-print sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/marketing-manual"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <BookOpenCheck className="h-4 w-4" />
              Manual
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="#slide-1" className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Start Deck
            </a>
            <ManualPdfButton />
          </div>
        </div>

        <Slide
          id="slide-1"
          eyebrow="Santaan Growth OS"
          title="CRM Training Deck"
          subtitle="Use this in live team onboarding. Every user should leave this deck knowing their role, their daily work, their SLA, and how their updates help Santaan grow."
        >
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,#f4f7ed_0%,#eff5ef_45%,#e8f0ec_100%)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700/80">Training objective</p>
              <h3 className="mt-3 font-playfair text-3xl font-semibold text-slate-900 md:text-4xl">
                One system. One team rhythm. One source of truth.
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                Santaan has multiple teams, centers, channels, and tools. The CRM exists to remove fragmentation so
                the CEO can see what is running, what is converting, where leads are leaking, and which owner must act next.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Goal</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">More qualified consults and registrations</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Method</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Structured updates with role ownership</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Leadership use</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Actionable decisions, not passive reporting</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Core rule</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  If it is not updated in CRM, it did not happen.
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Who uses this</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  <p>CEO / CRM Ops Admin</p>
                  <p>Agency Ops / Performance team</p>
                  <p>Field executives by center</p>
                  <p>IVR lead and telecalling team</p>
                  <p>Counselors by center</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        <Slide
          id="slide-2"
          eyebrow="Team Goal"
          title="How the team wins together"
          subtitle="Every role is different, but the team goal is shared: create traceable demand, move it fast, convert it cleanly, and make the leakage visible."
        >
          <div className="grid gap-5 lg:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  {index < workflowSteps.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-400" /> : null}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm font-medium text-emerald-700">{step.owner}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>
        </Slide>

        {roleSlides.map((role, index) => {
          const Icon = role.icon;
          return (
            <Slide
              key={role.title}
              id={`slide-role-${index + 1}`}
              eyebrow={`Role ${index + 1}`}
              title={role.title}
              subtitle={role.mission}
            >
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f5f7f1_0%,#edf4ef_100%)] p-6">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Primary mission</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{role.mission}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Owns these modules</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.owns.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Handoff responsibility</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{role.handoff}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      Daily work
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      {role.dailyMoves.map((item) => (
                        <li key={item} className="flex gap-3">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <ScanSearch className="h-4 w-4" />
                      Measured on
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      {role.scorecard.map((item) => (
                        <li key={item} className="flex gap-3">
                          <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-slate-900" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Slide>
          );
        })}

        <Slide
          id="slide-standards"
          eyebrow="Team Rules"
          title="Operating rules the whole team follows"
          subtitle="These rules are what make the CEO dashboard trustworthy. If the team breaks these, the analytics become decorative."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {teamRules.map((rule) => (
              <div key={rule} className="rounded-[28px] border border-slate-200 bg-white p-5">
                <p className="flex items-start gap-3 text-base leading-7 text-slate-800">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{rule}</span>
                </p>
              </div>
            ))}
          </div>
        </Slide>

        <Slide
          id="slide-modules"
          eyebrow="Product View"
          title="Which modules users touch every day"
          subtitle="The CRM is not one screen. It is a coordinated workspace with separate modules for execution, visibility, and leadership review."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Daily Command",
                icon: Sparkles,
                text: "The first screen for each user. Shows what needs attention now.",
              },
              {
                title: "Workboard",
                icon: ListChecks,
                text: "Daily accountability layer. Team members write what was done, blocked, and next.",
              },
              {
                title: "Contacts / Hot Leads",
                icon: PhoneCall,
                text: "Telecalling and counselor workspace for contact, qualification, and closure.",
              },
              {
                title: "Spend",
                icon: TrendingUp,
                text: "Agency and leadership view for Meta/Google/manual spend and source ROI.",
              },
              {
                title: "Ops Inputs",
                icon: BriefcaseBusiness,
                text: "Field, TV, and agency structured forms so offline activity also becomes measurable.",
              },
              {
                title: "CEO Command",
                icon: LayoutDashboard,
                text: "Executive intelligence screen for growth, leakage, ownership, and intervention.",
              },
              {
                title: "Reviews",
                icon: MessageSquareQuote,
                text: "Google-first trust intelligence for testimonials, SEO proof, and low-rated review action tracking.",
              },
            ].map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{module.text}</p>
                </div>
              );
            })}
          </div>
        </Slide>

        <Slide
          id="slide-reviews"
          eyebrow="Trust Intelligence"
          title="How the Reviews module should be used"
          subtitle="Reviews are not decorative testimonials. They are a trust, SEO, and operations input. Positive reviews become proof. Negative reviews become action items."
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">User flow</p>
              <ol className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
                <li><span className="font-semibold text-slate-900">1.</span> Open the <span className="font-semibold">Reviews</span> tab from the CRM dashboard.</li>
                <li><span className="font-semibold text-slate-900">2.</span> Add a single review manually or import a CSV using the template.</li>
                <li><span className="font-semibold text-slate-900">3.</span> Set source, center, rating, review date, review text, and response status.</li>
                <li><span className="font-semibold text-slate-900">4.</span> For low-rated reviews, assign a response owner and add operational notes.</li>
                <li><span className="font-semibold text-slate-900">5.</span> Mark only strong, patient-safe testimonials as <span className="font-semibold">Featured</span>.</li>
              </ol>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#f0f7ee_0%,#e8f2ec_100%)] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700/80">Use positive reviews for</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-800">
                  <li>Homepage and center-page trust blocks</li>
                  <li>Ad copy proof and reel hooks</li>
                  <li>Doctor/counselor confidence-building language</li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700/80">Use negative reviews for</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-800">
                  <li>Waiting-time, transparency, and communication fixes</li>
                  <li>CEO Command red-flag review on recurring issues</li>
                  <li>Staff coaching and process correction</li>
                </ul>
              </div>
            </div>
          </div>
        </Slide>

        <Slide
          id="slide-closing"
          eyebrow="Closing"
          title="What success looks like after training"
          subtitle="At the end of onboarding, each user should know where to work, what to update, how their work is measured, and who receives the handoff next."
        >
          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Training outcome</p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Every team member can log in and find their work without confusion.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Leadership can trust the dashboard because source, spend, and lead actions are entered consistently.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  The team operates as one chain, not as disconnected functions.
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#f0f7ee_0%,#e8f2ec_100%)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">Trainer instruction</p>
              <p className="mt-4 text-base leading-7 text-slate-800">
                Use this deck first. Then move users into the main manual and finally into live CRM modules for role-based practice.
                The right sequence is: <span className="font-semibold">Deck → Manual → Real task → CEO review.</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/marketing-manual"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Open Manual
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Open CRM
                </Link>
              </div>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  );
}
