import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, ExternalLink } from "lucide-react";

type Shot = {
  src: string;
  title: string;
  note: string;
};

const shots: Shot[] = [
  {
    src: "/training/login-screen.png",
    title: "1) Login Screen",
    note: "Users sign in with assigned role email and password, then move to Daily Command.",
  },
  {
    src: "/training/crm-role-guide.png",
    title: "2) CRM Role Guide Panel",
    note: "Role mission, SLA, must-update checklist, and one-click quick actions.",
  },
  {
    src: "/training/spend-form-help.png",
    title: "3) Spend Form with Field Help",
    note: "Each field has help hints to keep spend and UTM data consistent.",
  },
  {
    src: "/training/ops-inputs-agency.png",
    title: "4) Ops Inputs - Agency",
    note: "Campaign-level daily entry with required attribution fields.",
  },
  {
    src: "/training/ops-inputs-field.png",
    title: "5) Ops Inputs - Field",
    note: "Offline activity logging with center, location, and tracking handles.",
  },
  {
    src: "/training/ops-inputs-tv.png",
    title: "6) Ops Inputs - TV",
    note: "Spot-level TV tracking with QR/IVR/keyword linkage for attribution.",
  },
];

export default function ManualScreenshotsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f3ee_0%,#eef3ef_52%,#f7f4ef_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Training Companion</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">CRM Screenshot Walkthrough</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Use this page in onboarding calls. It maps the exact screens users will touch daily.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/marketing-manual"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Manual
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
                Open CRM
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {shots.map((shot) => (
            <article key={shot.src} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-500" />
                  {shot.title}
                </h2>
              </div>
              <div className="p-4">
                <Image
                  src={shot.src}
                  alt={shot.title}
                  width={1200}
                  height={800}
                  className="h-auto w-full rounded-xl border border-slate-200"
                />
                <p className="mt-3 text-sm leading-6 text-slate-600">{shot.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

