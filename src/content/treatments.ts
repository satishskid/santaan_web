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
      { question: 'How long does one IVF cycle take?', answer: '— (Writer to add timeline and center-specific details)' },
      { question: 'Do you recommend IVF or ICSI for male factor?', answer: '— (Writer to add criteria and explanation)' },
      { question: 'Can embryos be frozen for later use?', answer: '— (Writer to add policy and storage details)' },
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
      { question: 'How many IUI cycles should we try?', answer: '— (Writer to add guideline and personalization)' },
      { question: 'Is IUI painful?', answer: '— (Writer to add patient expectation)' },
      { question: 'Can IUI be done with donor sperm?', answer: '— (Writer to add program details)' },
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
      { question: 'Is ICSI always better than IVF?', answer: '— (Writer to add evidence-based comparison)' },
      { question: 'When is ICSI recommended?', answer: '— (Writer to add criteria and examples)' },
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
      { question: 'How many eggs should I freeze?', answer: '— (Writer to add age-based guidance)' },
      { question: 'How long can eggs be stored?', answer: '— (Writer to add policy)' },
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
      { question: 'Does PGT guarantee success?', answer: '— (Writer to add clear disclaimer)' },
      { question: 'How long do results take?', answer: '— (Writer to add typical turnaround)' },
    ],
  },
};

export const treatmentSlugs = Object.keys(treatmentPages);

export function getTreatmentPageBySlug(slug: string) {
  return treatmentPages[slug];
}

