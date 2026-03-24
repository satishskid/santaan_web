export interface TreatmentFaq {
  question: string;
  answer: string;
}

export interface TreatmentStep {
  title: string;
  body: string;
}

export interface TreatmentPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string;
  primaryKeyword: string;
  whoItsFor: string[];
  steps: TreatmentStep[];
  risksAndConsiderations: string[];
  faqs: TreatmentFaq[];
}

export const treatmentPages: Record<string, TreatmentPage> = {
  ivf: {
    slug: 'ivf',
    title: 'IVF Treatment',
    description:
      'Understand IVF treatment steps, who IVF is for, and how Santaan plans evidence-based IVF pathways across Odisha and Bangalore.',
    h1: 'IVF Treatment',
    kicker: 'In Vitro Fertilization',
    intro:
      'IVF is a treatment pathway where eggs are collected, fertilized in the lab, and an embryo is transferred into the uterus. This page is a structure for your content team to finalize.',
    primaryKeyword: 'ivf treatment',
    whoItsFor: [
      'Tubal factor infertility, endometriosis, or unexplained infertility',
      'Male-factor infertility where ICSI may be recommended',
      'Low ovarian reserve or time-sensitive fertility planning',
      'Multiple failed cycles of simpler treatments (timed attempts/IUI)',
    ],
    steps: [
      { title: 'Evaluation and plan', body: 'Baseline tests, ultrasound, semen analysis, and protocol planning.' },
      { title: 'Stimulation and monitoring', body: 'Medications to grow follicles with ultrasound and hormone monitoring.' },
      { title: 'Egg retrieval', body: 'A short procedure to collect eggs under sedation.' },
      { title: 'Fertilization and embryo culture', body: 'IVF or ICSI as indicated, followed by lab culture.' },
      { title: 'Embryo transfer', body: 'Transfer of an embryo with luteal support and follow-up.' },
    ],
    risksAndConsiderations: [
      'Medication side effects and ovarian hyperstimulation risk in select cohorts',
      'Multiple pregnancy risk depending on embryo transfer strategy',
      'Emotional and time commitment across cycles',
    ],
    faqs: [
      { question: 'How long does one IVF cycle take?', answer: 'Most IVF cycles take about 4–6 weeks from day‑2 evaluation to pregnancy test. Stimulation is usually 10–12 days, followed by retrieval and either a fresh transfer (3–5 days later) or a frozen transfer in a later cycle. Your doctor will personalize the timeline.' },
      { question: 'Do you recommend IVF or ICSI for male factor?', answer: 'It depends on semen analysis and prior fertilization history. IVF can be enough for mild male‑factor cases, while ICSI is preferred for low count/motility, severe morphology issues, or past fertilization failure. We decide after reviewing reports.' },
      { question: 'Can embryos be frozen for later use?', answer: 'Yes. Embryos can be vitrified and stored for future transfer. Storage duration depends on clinic policy, consent renewal, and applicable guidelines. We explain storage terms clearly before freezing.' },
    ],
  },
  iui: {
    slug: 'iui',
    title: 'IUI Treatment',
    description:
      'Learn IUI treatment steps, who it’s for, and how IUI fits into a structured fertility pathway with Santaan IVF.',
    h1: 'IUI Treatment',
    kicker: 'Intrauterine Insemination',
    intro:
      'IUI is a procedure where prepared sperm is placed inside the uterus around ovulation. This page is a structure for your content team to finalize.',
    primaryKeyword: 'iui treatment',
    whoItsFor: [
      'Mild male-factor issues or unexplained infertility',
      'Ovulation disorders when combined with induction and monitoring',
      'Couples seeking a less invasive first-line assisted option',
    ],
    steps: [
      { title: 'Cycle planning', body: 'Ovulation tracking or induction with ultrasound monitoring.' },
      { title: 'Semen preparation', body: 'Sperm wash to concentrate motile sperm.' },
      { title: 'IUI procedure', body: 'A short outpatient procedure performed near ovulation.' },
      { title: 'Follow-up', body: 'Luteal support where needed and pregnancy testing.' },
    ],
    risksAndConsiderations: ['Multiple pregnancy risk with stimulation medicines', 'Not suitable for blocked tubes or severe male factor'],
    faqs: [
      { question: 'How many IUI cycles should we try?', answer: 'Many couples try 3–4 well‑timed cycles before moving to IVF, but this depends on age, diagnosis, and response. We review results cycle‑by‑cycle and recommend the next step.' },
      { question: 'Is IUI painful?', answer: 'IUI is usually quick and causes mild cramping at most. Most patients describe it as similar to a routine pelvic exam.' },
      { question: 'Can IUI be done with donor sperm?', answer: 'Yes. Donor‑sperm IUI is an option with appropriate counseling, screening, and consent. We’ll guide you through the eligibility and legal requirements.' },
    ],
  },
  icsi: {
    slug: 'icsi',
    title: 'ICSI Treatment',
    description:
      'Understand ICSI, when it is recommended, and how it works within an IVF cycle for male-factor and complex fertilization needs.',
    h1: 'ICSI Treatment',
    kicker: 'Intracytoplasmic Sperm Injection',
    intro:
      'ICSI is a lab technique where a single sperm is injected directly into an egg during IVF. This page is a structure for your content team to finalize.',
    primaryKeyword: 'icsi treatment',
    whoItsFor: [
      'Low sperm count/motility/morphology or prior fertilization failure',
      'Surgical sperm retrieval cases',
      'Selected cases where fertilization needs tighter control',
    ],
    steps: [
      { title: 'IVF stimulation and retrieval', body: 'Egg collection follows standard IVF stimulation.' },
      { title: 'ICSI fertilization', body: 'Embryologist injects a sperm into each mature egg.' },
      { title: 'Embryo culture and transfer', body: 'Embryos are cultured and transferred or frozen.' },
    ],
    risksAndConsiderations: ['ICSI is not needed for every IVF cycle', 'Add-on costs and lab steps should be explained'],
    faqs: [
      { question: 'Is ICSI always better than IVF?', answer: 'No. ICSI is not routinely better for everyone. It is most useful when there are male‑factor issues or prior fertilization failure. If semen parameters are normal, standard IVF can achieve similar outcomes.' },
      { question: 'When is ICSI recommended?', answer: 'ICSI is commonly recommended for severe male‑factor infertility, surgically retrieved sperm, or a history of poor fertilization in prior IVF cycles. The decision is individualized after lab review.' },
    ],
  },
  'egg-freezing': {
    slug: 'egg-freezing',
    title: 'Egg Freezing',
    description:
      'Learn egg freezing eligibility, steps, and planning considerations for fertility preservation with Santaan IVF.',
    h1: 'Egg Freezing',
    kicker: 'Fertility Preservation',
    intro:
      'Egg freezing (oocyte vitrification) preserves eggs for future use. This page is a structure for your content team to finalize.',
    primaryKeyword: 'egg freezing',
    whoItsFor: [
      'People planning pregnancy later for personal or medical reasons',
      'Patients before treatments that can affect fertility',
      'Those wanting fertility optionality while evaluating timelines',
    ],
    steps: [
      { title: 'Baseline assessment', body: 'AMH, ultrasound, and medical review.' },
      { title: 'Stimulation and monitoring', body: 'Medications to grow follicles with monitoring.' },
      { title: 'Retrieval and vitrification', body: 'Eggs are collected and frozen using vitrification.' },
      { title: 'Storage and future use', body: 'Eggs can be stored and later used with IVF.' },
    ],
    risksAndConsiderations: ['Response varies by age and ovarian reserve', 'Storage policies and annual fees should be explicit'],
    faqs: [
      { question: 'How many eggs should I freeze?', answer: 'It depends on age and ovarian reserve. Younger patients typically need fewer eggs, while patients in their late 30s may need more to achieve similar outcomes. We give a personalized target after baseline tests.' },
      { question: 'How long can eggs be stored?', answer: 'Eggs can be stored for several years with periodic consent renewal. We follow current guidelines and explain storage duration and annual renewal terms before freezing.' },
    ],
  },
  pgt: {
    slug: 'pgt',
    title: 'PGT (Embryo Testing)',
    description:
      'Learn how PGT works, who it may help, and key considerations when adding embryo genetic testing to an IVF cycle.',
    h1: 'PGT (Embryo Testing)',
    kicker: 'Genetic Screening and Testing',
    intro:
      'PGT refers to genetic testing of embryos during IVF. This page is a structure for your content team to finalize.',
    primaryKeyword: 'pgt embryo testing',
    whoItsFor: [
      'Recurrent pregnancy loss or repeated implantation failure (selected cases)',
      'Known genetic conditions in the family (PGT-M where applicable)',
      'Advanced maternal age (case-dependent)',
    ],
    steps: [
      { title: 'IVF and embryo culture', body: 'Embryos are grown to biopsy stage.' },
      { title: 'Embryo biopsy', body: 'A few cells are biopsied and embryos are typically frozen.' },
      { title: 'Testing and reporting', body: 'Lab reports results and a transfer plan is made.' },
    ],
    risksAndConsiderations: ['Not every embryo reaches biopsy stage', 'Testing does not guarantee pregnancy or a healthy baby'],
    faqs: [
      { question: 'Does PGT guarantee success?', answer: 'No. PGT can reduce the risk of transferring embryos with certain chromosomal issues, but it does not guarantee pregnancy or a healthy baby. It is one piece of the overall IVF plan.' },
      { question: 'How long do results take?', answer: 'Most labs return results in about 1–3 weeks. Your doctor will plan the transfer timeline once the report is available.' },
    ],
  },
};

export const treatmentSlugs = Object.keys(treatmentPages);

export function getTreatmentPageBySlug(slug: string) {
  return treatmentPages[slug];
}
