import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Crosshair,
  IndianRupee,
  Megaphone,
  Phone,
  Shield,
  Target,
  Users,
  Workflow,
} from "lucide-react";

type SlideProps = {
  number: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

function Slide({ number, title, subtitle, icon: Icon, children }: SlideProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-500">SLIDE {number}</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{title}</h2>
            {subtitle ? <p className="text-sm text-gray-600 mt-1 max-w-3xl">{subtitle}</p> : null}
          </div>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap hidden md:block">Santaan Growth Playbook</div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{children}</span>;
}

export default function CeoManualPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full">CEO Manual</span>
              <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Presentation</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">CEO Growth Manual</h1>
            <p className="text-gray-600 mt-2 max-w-3xl">
              A simple operating system to plan TV/OOH + digital campaigns, run agencies and telecaller units, and align IT so growth is measurable inside CRM.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>CEO Command</Pill>
              <Pill>Spend</Pill>
              <Pill>Ops Inputs</Pill>
              <Pill>Daily Command</Pill>
              <Pill>Contacts</Pill>
              <Pill>NeoDove Sync</Pill>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 min-w-56">
            <p className="text-xs text-gray-500">How to present</p>
            <p className="text-sm text-gray-800 mt-1">Open this page and use browser full-screen, or Print → Save as PDF.</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Slide
            number="01"
            title="The Growth Rule"
            subtitle="No external reporting. Every action updates CRM, and CEO dashboard tells the truth."
            icon={Shield}
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Inputs (What teams do)</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Marketing: campaign links + spend + notes inside Ops Inputs</li>
                  <li>Telecalling: status + owner + follow-up timestamp inside Contacts</li>
                  <li>Field/TV: daily logs inside Ops Inputs</li>
                  <li>IT: wiring health stays green, attribution stays above 85%</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Outputs (What CEO sees)</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Wiring Health: NeoDove/calls/WhatsApp/spend last seen</li>
                  <li>ROI and cost: CPL, CPP, campaign/channel performance</li>
                  <li>Leaks: SLA breaches, pending &gt;24h, overdue follow-ups</li>
                  <li>Trend: NeoDove calls vs conversions (7 days)</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="02"
            title="CEO Daily Cadence (My Day)"
            subtitle="Two executive touchpoints per day. Everything else is delegation + enforcement."
            icon={Clock3}
          >
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">CEO action</th>
                    <th className="px-4 py-3">Where</th>
                    <th className="px-4 py-3">Decision output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">09:30 AM</td>
                    <td className="px-4 py-3 text-gray-700">Check wiring, ROI, SLA breaches, and today&apos;s demand by center</td>
                    <td className="px-4 py-3 text-gray-600">CEO Command</td>
                    <td className="px-4 py-3 text-gray-700">Top 3 priorities + owners + deadlines</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">11:00 AM</td>
                    <td className="px-4 py-3 text-gray-700">Ensure spend + agency metrics updated</td>
                    <td className="px-4 py-3 text-gray-600">Ops Inputs → Agency</td>
                    <td className="px-4 py-3 text-gray-700">Green or escalation to agency/marketing</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">03:30 PM</td>
                    <td className="px-4 py-3 text-gray-700">Call leader huddle: conversions + blockers + script fixes</td>
                    <td className="px-4 py-3 text-gray-600">CEO Command + Contacts</td>
                    <td className="px-4 py-3 text-gray-700">Closure plan + staffing plan</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">09:00 PM</td>
                    <td className="px-4 py-3 text-gray-700">Close day: compliance + leaks + tomorrow&apos;s fixes</td>
                    <td className="px-4 py-3 text-gray-600">Daily Command + Ops Workboard</td>
                    <td className="px-4 py-3 text-gray-700">Daily closure note</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Slide>

          <Slide
            number="03"
            title="Growth Targets (Simple Scoreboard)"
            subtitle="Run one scoreboard, not many. Measure only what drives profit."
            icon={BarChart3}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Demand</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Leads per center per day</li>
                  <li>NeoDove calls per day</li>
                  <li>High-intent leads (score ≥ 70)</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Closure</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Converted patients</li>
                  <li>Qualified-to-converted closure</li>
                  <li>Lost lead rate and winback</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Efficiency</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Cost per lead (CPL)</li>
                  <li>Cost per patient (CPP)</li>
                  <li>Attribution coverage ≥ 85%</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-gray-200 p-5 text-sm text-gray-700">
              CEO rule: if spend is rising but conversions are flat, pause scaling and fix telecalling closure + message match first.
            </div>
          </Slide>

          <Slide
            number="04"
            title="TV + Billboard Planning"
            subtitle="Treat TV/OOH like performance channels: track asset IDs, measure calls, and enforce daily logging."
            icon={Megaphone}
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Before you launch</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Every QR/keyword needs a unique asset ID</li>
                  <li>Landing pages must include center in URL</li>
                  <li>Telecaller script must match ad promise</li>
                  <li>Define daily spend cap and minimum conversion target</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Daily execution</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>08:30 PM: log all spots (Ops Inputs → TV Ads)</li>
                  <li>CEO checks next morning: call volume + conversion change</li>
                  <li>If &lt; 1 conversion after 3 days, change creative or targeting</li>
                  <li>Use CEO Command to confirm wiring + ROI</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="05"
            title="Digital Campaigns (Meta/Google/Social)"
            subtitle="One rule: do not spend on anything you cannot attribute in CRM."
            icon={Crosshair}
          >
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">CEO checklist</h3>
              <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">Creative → Message Match</p>
                  <ul className="mt-2 space-y-1">
                    <li>Offer is same in ad, landing, and call script</li>
                    <li>Center-specific call-to-action</li>
                    <li>One clear next step (Call/WhatsApp/Book)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Measurement</p>
                  <ul className="mt-2 space-y-1">
                    <li>UTM template mandatory for every link</li>
                    <li>Spend logged daily by 11:00 AM</li>
                    <li>CEO Command shows CPL/CPP by campaign</li>
                  </ul>
                </div>
              </div>
            </div>
          </Slide>

          <Slide
            number="06"
            title="Agency Management"
            subtitle="You manage the system, not the people. Make outputs visible and enforce cadence."
            icon={Users}
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Weekly CEO review (30 minutes)</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Top 3 campaigns by conversions and CPP</li>
                  <li>Bottom 3 campaigns by conversion rate</li>
                  <li>Attribution gaps (unattributed leads)</li>
                  <li>Creative refresh plan + landing changes</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Hard rules</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Daily spend must be logged in CRM (Ops Inputs + Spend)</li>
                  <li>Any campaign without UTMs is paused</li>
                  <li>Underperformers flagged with corrective notes by 03:00 PM</li>
                  <li>Agency uses one naming convention for campaigns and assets</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="07"
            title="Telecaller Unit Management"
            subtitle="Speed-to-lead + disciplined follow-ups drive conversion more than ad spend."
            icon={Phone}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Core KPIs</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>2-hour SLA breaches = 0</li>
                  <li>Pending &gt;24h = 0</li>
                  <li>Follow-ups due today completed</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Daily routine</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Sync A (11:00): hot leads</li>
                  <li>Sync B (03:00): callbacks</li>
                  <li>Sync C (07:00): reconcile</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Non-negotiable data</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Status</li>
                  <li>Owner</li>
                  <li>Next follow-up time</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="08"
            title="IT Team Management"
            subtitle="IT owns reliability: if wiring breaks, growth becomes invisible."
            icon={Workflow}
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">IT daily checklist</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Wiring Health stays green (NeoDove/calls/WhatsApp/spend)</li>
                  <li>Attribution coverage above 85%</li>
                  <li>NeoDove webhook updates owner + follow-up fields</li>
                  <li>CEO dashboard loads without errors</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">CEO escalation triggers</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>NeoDove last seen &gt; 2h during business hours</li>
                  <li>Calls last seen &gt; 2h during business hours</li>
                  <li>Attribution drops below 75%</li>
                  <li>Spend logged but conversions not moving</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="09"
            title="Operating Rhythm (Weekly)"
            subtitle="Run 4 meetings. Keep them short and data-first."
            icon={ClipboardList}
          >
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Meeting</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Growth Review</td>
                    <td className="px-4 py-3 text-gray-700">45 min</td>
                    <td className="px-4 py-3 text-gray-700">CEO + Agency + IVR lead</td>
                    <td className="px-4 py-3 text-gray-700">Scale winners, pause losers</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Closure Review</td>
                    <td className="px-4 py-3 text-gray-700">30 min</td>
                    <td className="px-4 py-3 text-gray-700">CEO + Counselors</td>
                    <td className="px-4 py-3 text-gray-700">Fix scripts, reduce loss rate</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Ops Discipline</td>
                    <td className="px-4 py-3 text-gray-700">20 min</td>
                    <td className="px-4 py-3 text-gray-700">CRM Ops Admin</td>
                    <td className="px-4 py-3 text-gray-700">Compliance gaps + owners</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">IT Reliability</td>
                    <td className="px-4 py-3 text-gray-700">15 min</td>
                    <td className="px-4 py-3 text-gray-700">IT lead</td>
                    <td className="px-4 py-3 text-gray-700">Wiring, attribution, uptime</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Slide>

          <Slide
            number="10"
            title="The 30-Day Growth Plan"
            subtitle="First month: build discipline through usability, then tighten enforcement."
            icon={Target}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Week 1</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Wiring stays green</li>
                  <li>Everyone uses CRM daily</li>
                  <li>Spend logs start daily</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Week 2</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Fix attribution gaps</li>
                  <li>Fix SLA breaches</li>
                  <li>Improve conversion scripts</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Week 3–4</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>Scale winners by CPP</li>
                  <li>TV/OOH asset-level tracking</li>
                  <li>Winback for lost leads</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <div>
                Month-1 discipline rule: every lead has owner + next follow-up time. If not, it stays as CEO action item.
              </div>
            </div>
          </Slide>

          <Slide number="11" title="Where to Click in CRM" subtitle="The CEO only needs 5 areas." icon={Building2}>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">CEO Command</h3>
                <ul className="mt-3 space-y-2">
                  <li>Wiring Health (live)</li>
                  <li>NeoDove 7-day trend</li>
                  <li>CPL/CPP and channel performance</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Contacts + Follow-ups</h3>
                <ul className="mt-3 space-y-2">
                  <li>Follow-ups due today/overdue</li>
                  <li>Pending &gt;24h</li>
                  <li>Status discipline</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Spend</h3>
                <ul className="mt-3 space-y-2">
                  <li>Budget control</li>
                  <li>Campaign spend sync</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Ops Inputs</h3>
                <ul className="mt-3 space-y-2">
                  <li>Agency metrics</li>
                  <li>Field activity log</li>
                  <li>TV ad log</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5 md:col-span-2">
                <h3 className="font-semibold text-gray-900">Daily Command</h3>
                <ul className="mt-3 space-y-2">
                  <li>Role-wise accountability</li>
                  <li>Blockers list and escalations</li>
                </ul>
              </div>
            </div>
          </Slide>

          <Slide
            number="12"
            title="CEO Decision Rules (Simple)"
            subtitle="If you follow these 7 rules consistently, growth becomes predictable."
            icon={IndianRupee}
          >
            <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Scaling rules</h3>
                <ul className="mt-3 space-y-2">
                  <li>Scale only channels with stable CPP and rising conversions</li>
                  <li>Increase budgets in 10–15% steps, not 2x jumps</li>
                  <li>Refresh creative weekly on paid social</li>
                  <li>TV/OOH: change creative if no lift after 3 days</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Stop-loss rules</h3>
                <ul className="mt-3 space-y-2">
                  <li>If spend grows but conversions don&apos;t, pause and fix closure</li>
                  <li>If attribution drops, pause spend until UTMs are fixed</li>
                  <li>If SLA breaches rise, move manpower to calls before adding ads</li>
                  <li>If follow-ups overdue, enforce next-follow-up timestamps</li>
                </ul>
              </div>
            </div>
          </Slide>
        </div>
      </div>
    </div>
  );
}

