"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AlertCircle, CalendarDays, CheckCircle2, ExternalLink, LoaderCircle, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { PRACTO_BOOKING_URL, PRIMARY_CALL_HREF, PRIMARY_CALL_NUMBER, PRIMARY_WHATSAPP_BOOKING_URL } from "@/data/centers";
import { cn } from "@/lib/utils";

const practoWidgetId = process.env.NEXT_PUBLIC_PRACTO_WIDGET_ID?.trim() || "183548fb196d70a5";
const practoBookingUrl = process.env.NEXT_PUBLIC_PRACTO_BOOKING_URL?.trim() || PRACTO_BOOKING_URL;
const practoDoctorLabel =
  process.env.NEXT_PUBLIC_PRACTO_DOCTOR_LABEL?.trim() || "Santaan Fertility Centre and Research Institute";
const practoLocationLabel = process.env.NEXT_PUBLIC_PRACTO_LOCATION_LABEL?.trim() || "Berhampur, Odisha";
const practoWidgetMarkup = `<practo:abs_widget widget="${practoWidgetId}"></practo:abs_widget>`;

const trustPoints = [
  "Confidential fertility consultation with specialist-led guidance",
  "Choose a convenient slot online or continue on WhatsApp",
  "Designed as a low-friction first step before advanced testing or IVF planning",
];

type WidgetStatus = "idle" | "loading" | "ready" | "fallback";

function hasRenderedPractoWidget(host: HTMLElement | null) {
  if (!host) return false;

  const text = host.textContent?.trim() || "";
  if (/book|appointment|consult/i.test(text)) return true;

  if (host.querySelector("iframe")) return true;

  return Array.from(host.querySelectorAll("a, button")).some((node) => {
    const label = node.textContent?.trim() || "";
    return label.length > 0;
  });
}

export function PractoBookingSection() {
  const callHref = PRIMARY_CALL_HREF;
  const whatsappBookingHref = PRIMARY_WHATSAPP_BOOKING_URL;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>(practoWidgetId ? "loading" : "idle");

  useEffect(() => {
    if (!practoWidgetId) return;

    const host = hostRef.current;
    if (!host) return;

    if (hasRenderedPractoWidget(host)) {
      timeoutRef.current = window.setTimeout(() => {
        setWidgetStatus("ready");
      }, 0);
      return;
    }

    const observer = new MutationObserver(() => {
      if (hasRenderedPractoWidget(host)) {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setWidgetStatus("ready");
      }
    });

    observer.observe(host, { childList: true, subtree: true, characterData: true });

    timeoutRef.current = window.setTimeout(() => {
      if (!hasRenderedPractoWidget(host)) {
        setWidgetStatus("fallback");
      }
    }, 4500);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section
      id="book-consultation"
      className="relative overflow-hidden bg-gradient-to-br from-[#f8f3ed] via-white to-[#eef5f1] py-24"
    >
      {practoWidgetId ? (
        <Script
          id="practo-widget-helper"
          src="https://www.practo.com/bundles/practopractoapp/js/abs_widget_helper.js"
          strategy="afterInteractive"
          onLoad={() => {
            const host = hostRef.current;
            if (hasRenderedPractoWidget(host)) {
              setWidgetStatus("ready");
              return;
            }

            setWidgetStatus("loading");
          }}
          onError={() => {
            setWidgetStatus("fallback");
          }}
        />
      ) : null}

      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-0 top-12 h-64 w-64 rounded-full bg-santaan-amber/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-santaan-teal/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-santaan-teal/10 bg-white/80 px-4 py-1.5 text-sm font-semibold tracking-wide text-santaan-teal shadow-sm">
              <CalendarDays className="h-4 w-4 text-santaan-amber" />
              Appointment booking
            </span>

            <h2 className="mt-5 max-w-xl font-playfair text-3xl font-bold text-santaan-teal md:text-5xl">
              Book your consultation without losing the Santaan experience
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-santaan-teal/80 md:text-lg">
              Pick your preferred slot with {practoDoctorLabel}. The booking area stays inside a branded Santaan shell,
              while the inner Practo interface remains intact for reliability.
            </p>

            <div className="mt-8 grid gap-4">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-santaan-teal/10 bg-white/75 px-4 py-4 shadow-[0_12px_30px_rgba(47,79,79,0.06)] backdrop-blur"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-santaan-amber" />
                  <p className="text-sm leading-6 text-santaan-teal/85 md:text-[15px]">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappBookingHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Book on WhatsApp
              </a>
              <a href={callHref} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
                <PhoneCall className="mr-2 h-5 w-5" />
                Call Santaan
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-santaan-teal/10 bg-white p-4 shadow-[0_30px_80px_rgba(31,46,46,0.12)] md:p-6">
            <div className="rounded-[24px] bg-gradient-to-br from-santaan-teal to-[#365a5a] px-5 py-5 text-white md:px-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-santaan-amber">Practo booking</p>
                  <h3 className="mt-2 font-playfair text-2xl font-bold">Consultation scheduling</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">
                    Doctor context, trust framing and fallback actions stay in Santaan&apos;s voice even if the embedded booking
                    UI itself has limited styling options.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
                  <p className="font-semibold">{practoDoctorLabel}</p>
                  <p className="mt-1 text-white/75">{practoLocationLabel}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-santaan-teal/10 bg-[#fcfaf7] p-4 md:p-5">
              <div className="mb-4 flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-santaan-amber" />
                <p className="text-sm leading-6 text-santaan-teal/80">
                  Confidential fertility consultation. If the widget is unavailable on a device, patients can still continue on
                  WhatsApp or by phone without dropping intent.
                </p>
              </div>

              {practoWidgetId ? (
                <div className="relative min-h-[320px] rounded-[20px] border border-santaan-teal/10 bg-white px-6 py-10 shadow-inner">
                  <div
                    ref={hostRef}
                    className={cn(
                      "practo-widget-host mx-auto flex max-w-3xl justify-center",
                      widgetStatus === "ready" ? "opacity-100" : "pointer-events-none absolute inset-6 opacity-0"
                    )}
                    dangerouslySetInnerHTML={{ __html: practoWidgetMarkup }}
                  />

                  {widgetStatus === "fallback" ? (
                    <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
                      <p className="mt-3 font-semibold text-santaan-teal">Practo booking is temporarily unavailable here.</p>
                      <p className="mt-2 text-sm leading-6 text-santaan-teal/75">
                        The embedded widget did not load on this page. Patients can continue instantly on WhatsApp or by phone,
                        with the Practo page still available as a backup.
                      </p>
                      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                          href={whatsappBookingHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700")}
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Book on WhatsApp
                        </a>
                        <a
                          href={callHref}
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                        >
                          <PhoneCall className="mr-2 h-5 w-5" />
                          Call Santaan
                        </a>
                      </div>
                      {practoBookingUrl ? (
                        <a
                          href={practoBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal transition-colors hover:text-santaan-amber"
                        >
                          Open the direct Practo page
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  ) : widgetStatus === "loading" ? (
                    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-santaan-teal/10 bg-[#f8faf8] px-5 py-8 text-center">
                      <LoaderCircle className="h-8 w-8 animate-spin text-santaan-amber" />
                      <p className="mt-4 font-semibold text-santaan-teal">Loading appointment booking...</p>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-santaan-teal/75">
                        If the embedded booking takes too long on this device, patients can continue instantly on WhatsApp,
                        by phone, or on the full Practo page.
                      </p>
                      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                          href={whatsappBookingHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700")}
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Book on WhatsApp
                        </a>
                        <a
                          href={callHref}
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                        >
                          <PhoneCall className="mr-2 h-5 w-5" />
                          Call Santaan
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto min-h-[240px] max-w-3xl rounded-2xl border border-santaan-teal/10 bg-[#f8faf8] px-4 py-6" />
                  )}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-santaan-teal/20 bg-white px-6 py-10 text-center">
                  <p className="font-playfair text-2xl font-bold text-santaan-teal">Practo widget slot ready</p>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-santaan-teal/75">
                    Add `NEXT_PUBLIC_PRACTO_WIDGET_ID` to render the live booking embed inside this wrapper. Until then, users can
                    book through the backup conversion paths below.
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <a
                      href={whatsappBookingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Book on WhatsApp
                    </a>
                    <a
                      href={callHref}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                    >
                      <PhoneCall className="mr-2 h-5 w-5" />
                      Call Santaan
                    </a>
                  </div>
                </div>
              )}

              {practoBookingUrl ? (
                <div className="mt-4 flex justify-end">
                  <a
                    href={practoBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal transition-colors hover:text-santaan-amber"
                  >
                    Open Practo booking page
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
