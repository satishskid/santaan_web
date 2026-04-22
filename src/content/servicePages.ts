export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceSection {
  heading: string;
  body: string;
}

export interface ServicePageData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string;
  primaryKeyword: string;
  city?: string;
  sections: ServiceSection[];
  faqs: ServiceFaq[];
  relatedPages?: Array<{
    href: string;
    label: string;
    description: string;
  }>;
}

export const servicePageData: Record<string, ServicePageData> = {
  'ivf-clinic-bhubaneswar': {
    slug: 'ivf-clinic-bhubaneswar',
    title: 'IVF Centre in Bhubaneswar',
    description:
      'Santaan IVF Bhubaneswar offers evidence-driven IVF, ICSI, male infertility care, and PCOS fertility treatment with compassionate specialist support.',
    h1: 'IVF Centre in Bhubaneswar',
    kicker: 'Bhubaneswar Fertility Care',
    intro:
      'Santaan IVF Bhubaneswar combines advanced reproductive science with personalized planning for couples and individuals who want timely, transparent fertility care.',
    primaryKeyword: 'IVF centre in Bhubaneswar',
    city: 'Bhubaneswar',
    sections: [
      {
        heading: 'Why families choose Santaan in Bhubaneswar',
        body:
          'Patients need clarity, not confusion. Our Bhubaneswar team uses structured fertility diagnostics for both partners, individualized treatment plans, and continuous follow-up so each cycle is data-backed and emotionally supported.',
      },
      {
        heading: 'Services available at this center',
        body:
          'We provide fertility evaluation, ovulation support, IUI, IVF, ICSI, male-factor workup, embryo culture planning, and guidance for egg-freezing decisions. Every plan is built around clinical findings, timeline needs, and budget comfort.',
      },
      {
        heading: 'How we improve treatment decision quality',
        body:
          'Our doctors map hormone trends, ovarian reserve, semen parameters, thyroid-metabolic markers, and cycle response history before selecting protocol pathways. This reduces trial-and-error and helps couples move with confidence.',
      },
      {
        heading: 'Book your first step',
        body:
          'Start with a fertility readiness consultation or at-home testing workflow if privacy and convenience matter to you. Our team guides you from first report to treatment roadmap with realistic milestones.',
      },
    ],
    faqs: [
      {
        question: 'What is the first step to start IVF in Bhubaneswar?',
        answer:
          'Start with a complete fertility assessment for both partners. This includes history review, key blood tests, and semen analysis before recommending IUI, IVF, or other options.',
      },
      {
        question: 'Do you support male infertility evaluation at this center?',
        answer:
          'Yes. Male-factor evaluation is integrated into our standard pathway and includes semen quality profiling and additional tests where clinically needed.',
      },
      {
        question: 'Can I begin with at-home fertility testing?',
        answer:
          'Yes. You can begin with at-home testing and then proceed to specialist consultation with your reports for faster treatment planning.',
      },
    ],
  },
  'ivf-clinic-berhampur': {
    slug: 'ivf-clinic-berhampur',
    title: 'IVF Centre in Berhampur',
    description:
      'Santaan IVF Berhampur provides personalized fertility treatment, IVF and IUI planning, and integrated male-female diagnostics for couples across South Odisha.',
    h1: 'IVF Centre in Berhampur',
    kicker: 'Berhampur Fertility Care',
    intro:
      'Santaan Berhampur serves couples across Ganjam and nearby districts with evidence-driven fertility care that is transparent, compassionate, and locally accessible.',
    primaryKeyword: 'IVF centre in Berhampur',
    city: 'Berhampur',
    sections: [
      {
        heading: 'Local access, specialist quality',
        body:
          'We reduce delays in diagnosis by providing structured evaluations close to home. Couples get faster decisions, less travel burden, and continuity with a focused fertility care team.',
      },
      {
        heading: 'Treatment pathways we offer',
        body:
          'From cycle monitoring and IUI to advanced IVF planning, we tailor treatment based on age, ovarian reserve, semen factors, thyroid-metabolic profile, and prior attempt history.',
      },
      {
        heading: 'Transparent counseling at every stage',
        body:
          'Our team explains expected timelines, likely milestones, and step-wise options so you can make informed decisions with clarity instead of pressure.',
      },
      {
        heading: 'Support beyond procedure days',
        body:
          'Patients receive follow-up guidance for medication schedules, report interpretation, and next-step planning, helping couples stay on track through each cycle.',
      },
    ],
    faqs: [
      {
        question: 'Do you provide complete fertility workup in Berhampur?',
        answer:
          'Yes. We provide structured fertility workup for both partners and build treatment recommendations only after reviewing complete findings.',
      },
      {
        question: 'Is this center suitable for first-time IVF consultation?',
        answer:
          'Yes. The Berhampur center supports first-time consultation, diagnosis, and treatment planning with specialist oversight.',
      },
      {
        question: 'How do I book consultation at Santaan Berhampur?',
        answer:
          'Use call, WhatsApp, or online booking. Our team will schedule appointment slots and share pre-visit preparation details.',
      },
    ],
  },
  'ivf-clinic-angul': {
    slug: 'ivf-clinic-angul',
    title: 'IVF Centre in Angul',
    description:
      'Santaan IVF Angul supports couples with fertility evaluation, IVF and IUI planning, male infertility workup, and step-wise specialist guidance closer to home.',
    h1: 'IVF Centre in Angul',
    kicker: 'Angul Fertility Care',
    intro:
      'Santaan Angul helps families begin fertility evaluation earlier, understand the right next step faster, and move into specialist-led treatment planning without unnecessary confusion or travel burden.',
    primaryKeyword: 'IVF centre in Angul',
    city: 'Angul',
    sections: [
      {
        heading: 'Start fertility workup without delaying the decision',
        body:
          'Many couples spend months repeating fragmented tests before they get a clear plan. The Angul pathway is designed to shorten that delay with structured evaluation for both partners and focused next-step guidance.',
      },
      {
        heading: 'Services and guidance available through this center',
        body:
          'We help patients move from baseline fertility testing and report review into IUI, IVF, ICSI, male-factor evaluation, and condition-specific treatment planning depending on diagnosis, age, and timeline.',
      },
      {
        heading: 'Built for practical, real-world fertility planning',
        body:
          'Treatment decisions are based on ovarian reserve, semen quality, endocrine markers, menstrual history, and prior attempts. This reduces guesswork and helps couples understand what is worth trying next.',
      },
      {
        heading: 'Support for Angul and nearby districts',
        body:
          'The center is designed for families who want accessible first-step fertility guidance in Angul, with continuity into broader Santaan specialist support when advanced treatment coordination is needed.',
      },
    ],
    faqs: [
      {
        question: 'Can I start fertility evaluation in Angul before deciding on IVF?',
        answer:
          'Yes. A structured fertility evaluation is often the best first step because it helps clarify whether timed treatment, IUI, IVF, or further testing is the right path.',
      },
      {
        question: 'Do you evaluate both partners together?',
        answer:
          'Yes. Santaan’s fertility pathway is built around a couple-first assessment model so male and female factors are reviewed together from the beginning.',
      },
      {
        question: 'Who should consider booking at the Angul center?',
        answer:
          'Couples who have been trying for a while, have irregular cycles, low AMH, semen-factor concerns, or want a specialist-led second opinion can start with the Angul center.',
      },
    ],
  },
  'ivf-clinic-bangalore-aecs-layout': {
    slug: 'ivf-clinic-bangalore-aecs-layout',
    title: 'IVF Centre in AECS Layout, Bangalore',
    description:
      'Santaan IVF Bangalore AECS Layout delivers tech-enabled fertility evaluation, IVF planning, and discreet support for couples in the Bengaluru IT corridor.',
    h1: 'IVF Centre in AECS Layout, Bangalore',
    kicker: 'Bangalore IT Corridor Fertility Care',
    intro:
      'Designed for busy professionals, Santaan Bangalore combines evidence-driven clinical pathways with convenient follow-up and discreet communication support.',
    primaryKeyword: 'IVF centre in AECS Layout',
    city: 'Bangalore',
    sections: [
      {
        heading: 'Built for fast-paced professional lives',
        body:
          'Our workflows are structured for time-constrained couples. We keep diagnostics, specialist consultations, and follow-up communication efficient without compromising medical depth.',
      },
      {
        heading: 'Integrated male and female fertility assessment',
        body:
          'We evaluate both partners together so treatment planning is complete from the beginning. This avoids delays caused by one-sided assessment and improves decision quality.',
      },
      {
        heading: 'Data-backed planning for IVF and beyond',
        body:
          'Protocol recommendations are based on ovarian reserve, endocrine markers, semen health, and cycle history. You get realistic timelines and clear decision points.',
      },
      {
        heading: 'Confidential and continuity-focused support',
        body:
          'We offer privacy-conscious communication, structured updates, and practical coordination for professionals balancing treatment with demanding schedules.',
      },
    ],
    faqs: [
      {
        question: 'Do you serve couples in the Bangalore IT corridor?',
        answer:
          'Yes. The AECS Layout center is designed to serve professionals across the IT corridor with flexible fertility pathways and follow-up.',
      },
      {
        question: 'Can I combine in-person visits with virtual follow-up?',
        answer:
          'Yes. Initial diagnostics are planned in-person, and selected follow-up steps can be coordinated efficiently through remote support.',
      },
      {
        question: 'Is male-factor workup included in your pathway?',
        answer:
          'Yes. Male-factor evaluation is included in our standard fertility workup and treatment planning framework.',
      },
    ],
  },
  'male-infertility-clinic': {
    slug: 'male-infertility-clinic',
    title: 'Male Infertility Clinic',
    description:
      'Evaluate low sperm count, motility and morphology with Santaan’s male infertility pathway. Get targeted diagnosis and treatment planning with specialist review.',
    h1: 'Male Infertility Clinic',
    kicker: 'Male Fertility Care',
    intro:
      'Male factors contribute significantly to fertility challenges. Santaan offers structured male infertility assessment and treatment planning to improve conception outcomes.',
    primaryKeyword: 'male infertility clinic',
    sections: [
      {
        heading: 'What we assess in male-factor fertility',
        body:
          'Our pathway evaluates sperm count, motility, morphology, semen quality patterns, and associated clinical markers. Where indicated, deeper evaluation is added to identify reversible causes and treatment priorities.',
      },
      {
        heading: 'From report confusion to action plan',
        body:
          'Many couples receive fragmented reports without clear next steps. We convert those findings into a practical plan: lifestyle corrections, medical support, timed attempts, or assisted pathways.',
      },
      {
        heading: 'Couple-first treatment strategy',
        body:
          'Male fertility is managed in context of both partners. This integrated planning reduces unnecessary delays and supports better treatment sequencing.',
      },
      {
        heading: 'When to seek specialist review',
        body:
          'If conception has not happened after regular attempts, semen reports are inconsistent, or prior treatment has stalled, a targeted male-factor review can unlock clearer options.',
      },
    ],
    faqs: [
      {
        question: 'Does low sperm count always require IVF?',
        answer:
          'Not always. The right option depends on overall semen quality, female partner factors, duration of trying, and prior treatment response.',
      },
      {
        question: 'Can sperm morphology issues improve with treatment?',
        answer:
          'In many cases, yes. Improvement depends on the underlying cause and adherence to a structured correction plan.',
      },
      {
        question: 'Should both partners be evaluated together?',
        answer:
          'Yes. Fertility outcomes improve when both partners are assessed and treatment is coordinated together.',
      },
    ],
  },
  'female-fertility': {
    slug: 'female-fertility',
    title: 'Female Fertility Evaluation and Treatment',
    description:
      'Santaan provides comprehensive female fertility evaluation and treatment, including ovulation care, PCOS, thyroid-linked infertility, unexplained infertility, and tubal-factor planning.',
    h1: 'Female Fertility Evaluation and Treatment',
    kicker: "Women's Fertility Care",
    intro:
      'Female fertility challenges are often multi-factorial. Santaan combines hormone, cycle, ovarian reserve, metabolic, and uterine-tubal assessment to build a clear and timely conception pathway.',
    primaryKeyword: 'female fertility treatment',
    sections: [
      {
        heading: 'Complete female fertility workup, not isolated testing',
        body:
          'We evaluate ovulation patterns, ovarian reserve, thyroid-metabolic signals, menstrual history, ultrasound findings, and prior treatment response together. This avoids fragmented decisions and improves treatment timing.',
      },
      {
        heading: 'Age and timeline-aware fertility planning',
        body:
          'Treatment choices differ for women trying to conceive now versus those planning for the future. We align interventions with age, ovarian profile, and family planning timeline so every step is purposeful.',
      },
      {
        heading: 'From reversible causes to assisted pathways',
        body:
          'Many female fertility causes are manageable with targeted correction. Where needed, we transition quickly and transparently to IUI or IVF to reduce lost cycles and emotional strain.',
      },
      {
        heading: 'Continuity across diagnostics, treatment, and follow-up',
        body:
          'Our team supports report interpretation, medication adherence, and protocol adjustments across each stage, so couples move forward with medical clarity and confidence.',
      },
    ],
    faqs: [
      {
        question: 'When should a woman seek fertility evaluation?',
        answer:
          'If conception has not occurred after 12 months (or 6 months if age is 35+), or if cycles are irregular, early specialist evaluation is recommended.',
      },
      {
        question: 'Can female infertility be treated without IVF?',
        answer:
          'Yes, many cases can improve with ovulation support, endocrine correction, and structured timed pathways. IVF is chosen when clinically appropriate.',
      },
      {
        question: 'Do thyroid and PCOS issues affect female fertility significantly?',
        answer:
          'Yes. Both can influence ovulation, hormone signaling, and implantation readiness. Early correction can improve conception outcomes.',
      },
    ],
    relatedPages: [
      {
        href: '/pcos-fertility-treatment',
        label: 'PCOS Fertility Treatment',
        description: 'Structured care for irregular cycles, ovulation barriers, and insulin-linked fertility challenges.',
      },
      {
        href: '/thyroid-and-fertility',
        label: 'Thyroid and Fertility Care',
        description: 'Correct subtle thyroid-linked fertility blockers that can delay conception and implantation.',
      },
      {
        href: '/unexplained-infertility',
        label: 'Unexplained Infertility Support',
        description: 'Move from normal-looking reports to evidence-led diagnosis and a clearer treatment pathway.',
      },
      {
        href: '/forgotten-fever-tubal-factor',
        label: 'Tubal Factor and Blocked Tube Care',
        description: 'Evaluate and manage tubal-factor infertility linked to prior infections or pelvic inflammation.',
      },
    ],
  },
  'pcos-fertility-treatment': {
    slug: 'pcos-fertility-treatment',
    title: 'PCOS Fertility Treatment',
    description:
      'PCOS fertility treatment at Santaan addresses irregular cycles, insulin resistance, and ovulation barriers using personalized reproductive care pathways.',
    h1: 'PCOS Fertility Treatment',
    kicker: 'PCOS and Conception Support',
    intro:
      'PCOS can delay conception when cycles, ovulation, and metabolic signals are not aligned. Santaan offers a structured plan to restore fertility momentum.',
    primaryKeyword: 'PCOS treatment for fertility',
    sections: [
      {
        heading: 'Why PCOS needs a fertility-focused plan',
        body:
          'PCOS is more than irregular periods. It can affect ovulation consistency, egg quality, and hormonal balance. A fertility-focused plan addresses these factors together rather than in isolation.',
      },
      {
        heading: 'Our treatment framework',
        body:
          'We combine cycle tracking, endocrine evaluation, metabolic correction, and ovulation support with doctor-led protocol decisions to improve natural conception chances or assisted outcomes where needed.',
      },
      {
        heading: 'Reducing trial-and-error in treatment',
        body:
          'With clear baseline data and consistent monitoring, treatment decisions become faster and more precise. Couples avoid repeated cycles without measurable direction.',
      },
      {
        heading: 'When to escalate to assisted treatment',
        body:
          'If ovulation support and metabolic correction do not lead to desired outcomes within planned timelines, we guide couples into the next suitable pathway with clarity.',
      },
    ],
    faqs: [
      {
        question: 'Can PCOS patients conceive naturally?',
        answer:
          'Yes, many can. Success depends on ovulation consistency, metabolic health, and timely treatment planning.',
      },
      {
        question: 'How does insulin resistance affect fertility in PCOS?',
        answer:
          'Insulin resistance can disrupt ovulation and hormone signaling. Managing it improves cycle quality and conception readiness.',
      },
      {
        question: 'How soon should treatment begin for PCOS-related infertility?',
        answer:
          'If cycles are irregular and conception is delayed, early specialist evaluation is recommended to avoid losing valuable time.',
      },
    ],
  },
  'thyroid-and-fertility': {
    slug: 'thyroid-and-fertility',
    title: 'Thyroid and Fertility Care',
    description:
      'Santaan evaluates thyroid-related fertility barriers including subtle hormone imbalances that affect ovulation, implantation, and treatment outcomes.',
    h1: 'Thyroid and Fertility Care',
    kicker: 'Endocrine Precision for Conception',
    intro:
      'Thyroid imbalance can quietly affect ovulation, cycle quality, and implantation potential. Early correction improves treatment confidence and timing.',
    primaryKeyword: 'thyroid and infertility',
    sections: [
      {
        heading: 'How thyroid influences conception',
        body:
          'Even mild thyroid disruption can affect cycle regularity and reproductive hormone balance. These shifts may reduce chances of conception when left unaddressed.',
      },
      {
        heading: 'Our evaluation and correction pathway',
        body:
          'We review thyroid markers along with broader fertility diagnostics, then align medication and monitoring plans to your cycle and treatment goals.',
      },
      {
        heading: 'Thyroid and IVF planning',
        body:
          'For couples entering assisted pathways, thyroid optimization improves readiness and supports better protocol response across treatment stages.',
      },
      {
        heading: 'Sustained follow-up matters',
        body:
          'Stable outcomes require consistent re-evaluation. We track progress and adjust plans so hormone balance remains supportive for conception.',
      },
    ],
    faqs: [
      {
        question: 'Can mild thyroid imbalance delay conception?',
        answer:
          'Yes. Even subclinical shifts can influence ovulation and implantation potential.',
      },
      {
        question: 'Should thyroid be tested before IVF?',
        answer:
          'Yes. Thyroid optimization is a critical pre-treatment step in fertility planning.',
      },
      {
        question: 'Can thyroid correction improve cycle regularity?',
        answer:
          'In many cases, yes. Better hormone balance often improves cycle consistency and treatment response.',
      },
    ],
  },
  'unexplained-infertility': {
    slug: 'unexplained-infertility',
    title: 'Unexplained Infertility Support',
    description:
      'Santaan helps couples with unexplained infertility uncover hidden patterns and move from uncertain reports to structured treatment pathways.',
    h1: 'Unexplained Infertility Support',
    kicker: 'When Reports Look Normal but Conception Delays Continue',
    intro:
      'Unexplained infertility can feel frustrating because standard reports often look normal. Santaan helps couples move from uncertainty to evidence-led action.',
    primaryKeyword: 'unexplained infertility solutions',
    sections: [
      {
        heading: 'Why unexplained infertility happens',
        body:
          'Normal routine reports do not always capture subtle biological or cycle-level factors. Couples may still need deeper pattern-based evaluation and a structured timeline strategy.',
      },
      {
        heading: 'Our approach to hidden blockers',
        body:
          'We review prior reports, cycle response, partner-level findings, and clinical history to identify missing clues and avoid repeating ineffective attempts.',
      },
      {
        heading: 'Treatment decisions with better context',
        body:
          'A clearer diagnostic narrative allows confident decisions on whether to continue natural attempts, start IUI, or shift to IVF with better timing.',
      },
      {
        heading: 'Emotional and practical continuity',
        body:
          'Couples receive practical step-by-step guidance, helping reduce uncertainty while maintaining treatment momentum through each stage.',
      },
    ],
    faqs: [
      {
        question: 'What does unexplained infertility mean?',
        answer:
          'It means routine tests appear normal but pregnancy has not occurred, requiring deeper review and structured treatment planning.',
      },
      {
        question: 'Can unexplained infertility still be treated successfully?',
        answer:
          'Yes. With better diagnostics and protocol sequencing, many couples move toward successful conception.',
      },
      {
        question: 'Should we continue trying naturally or start assisted treatment?',
        answer:
          'The decision depends on age, duration, prior attempts, and complete couple-level findings. A specialist consultation helps choose the right path.',
      },
    ],
  },
  'forgotten-fever-tubal-factor': {
    slug: 'forgotten-fever-tubal-factor',
    title: 'Blocked Fallopian Tube and Tubal Factor Care',
    description:
      'Evaluate blocked fallopian tubes and tubal-factor infertility with Santaan’s structured diagnostic and treatment approach for clearer conception planning.',
    h1: 'Blocked Fallopian Tube and Tubal Factor Care',
    kicker: 'Tubal Factor and Forgotten Infection History',
    intro:
      'Past pelvic infections or overlooked inflammatory episodes can affect tubal patency and delay conception. Santaan offers focused evaluation and treatment planning for tubal-factor infertility.',
    primaryKeyword: 'blocked fallopian tubes treatment',
    sections: [
      {
        heading: 'How tubal factors affect fertility',
        body:
          'When tubes are blocked or functionally compromised, natural conception becomes difficult even if ovulation and semen parameters look acceptable.',
      },
      {
        heading: 'Diagnostic clarity before treatment',
        body:
          'We evaluate tubal patency and related pelvic history to identify whether natural pathways remain feasible or assisted routes are better suited.',
      },
      {
        heading: 'Personalized treatment decision',
        body:
          'Treatment may include targeted correction, timeline-based natural attempts, or transition to assisted pathways based on severity and couple context.',
      },
      {
        heading: 'Avoiding repeated lost cycles',
        body:
          'Early identification of tubal-factor issues prevents prolonged uncertainty and allows couples to move toward the right treatment faster.',
      },
    ],
    faqs: [
      {
        question: 'Can blocked fallopian tubes be a hidden cause of infertility?',
        answer:
          'Yes. Many couples have delayed diagnosis of tubal factors because symptoms can be minimal or absent.',
      },
      {
        question: 'Is tubal testing important before advanced treatment?',
        answer:
          'Yes. Tubal assessment helps determine whether natural conception, correction, or assisted pathways are most appropriate.',
      },
      {
        question: 'Can conception still happen with one blocked tube?',
        answer:
          'It can in selected cases, but outcomes depend on overall reproductive health and complete couple-level findings.',
      },
    ],
  },
};

export const servicePageSlugs = Object.keys(servicePageData);

export function getServicePageBySlug(slug: string): ServicePageData | null {
  return servicePageData[slug] || null;
}
