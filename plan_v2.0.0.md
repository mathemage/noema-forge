# NoemaForge v2.0.0 roadmap

`plan_v1.0.0.md` is the historical v1 roadmap and is no longer the source of truth.

## Problem

v1 shipped a working private journal: typed, voice, and handwriting-OCR capture landing in one
searchable archive, plus a guided distillation step with optional Ollama assistance. It stores
thoughts well. It does not yet do much with them.

v2 turns NoemaForge from a capture-and-store tool into a reflection practice: a structured,
repeatable loop that moves a raw dump to a named feeling, a real issue, a challenged assumption,
and a committed close, and that lets a user look back across months and see how their judgment
actually performed.

The target user is one motivated adult without access to a therapist. That constraint sets the
bar honestly: v2 should be the best self-guided written reflection practice that software can
deliver, and should say plainly what it is not.

## Positioning

v2 is a structured self-guided reflection practice. It is not therapy, it is not a therapist,
and it does not diagnose. Three independent reasons force this framing, and all three improve the
product rather than weakening it.

- The effect ceiling is real. Pooled across 146 randomised experimental-disclosure studies
  (N = 10,994), expressive writing returns r = .075, roughly a quarter of psychotherapy's
  r ~= .322 [1]. Self-help ACT lands at Hedges g = 0.34-0.42 [2]. Unguided iCBT produces a 37%
  response rate against 48% with a human guide, and 40% against 55% in moderately severe cases
  [3]. Claiming parity with therapy would be false, and would set the user up to conclude they
  had failed when the tool underperformed.
- The professional consensus is explicit. The APA's November 2025 health advisory states that
  generative-AI chatbots and wellness apps must not be used as a replacement for a qualified
  provider and are only potentially appropriate as an adjunct to an existing therapeutic
  relationship [4].
- The legal position has moved. Illinois' WOPR Act (HB 1806, in force 4 August 2025) prohibits
  offering therapy or psychotherapy services, including via internet-based AI, unless delivered
  by a licensed professional; Nevada AB 406, Utah HB 452, and New York's companion-bot law are
  adjacent [5]. This repository is public, so how it describes itself carries that exposure.

Nothing in the literature endorses this product. The closest is a single hedged sentence in
Stanford's write-up of Moore et al., which says it is "also possible that AI tools could be
helpful for patients in less safety-critical scenarios, such as supporting journaling,
reflection, or coaching" [6]. That is a plausible lower-risk role floated as worth studying, and
it is framed around people already in care. Read it as permission to proceed carefully, not as
evidence the product works.

## What the evidence changes

Design rules, each traceable to a source. These are the reason v2 looks the way it does. Each
rule states the strength of what is behind it, because several are weaker than the popular
version of the same idea.

1. **A blank "write your feelings" box is the weakest possible design.** Plain expressive writing
   reaches SMD -0.43 against waitlist and is barely distinguishable from writing about neutral
   topics (-0.37). Enhanced writing -- therapist presence or feedback, directive instructions that
   change each session, and more or longer sessions -- reaches -0.81 against waitlist, against
   -0.78 for full psychotherapy [7]. Two caveats matter and were confirmed on audit: EW+ beat
   plain expressive writing at end of treatment only, and at longest follow-up the review found
   no significant differences between EW+, EW, and neutral writing; 30 of 44 trials are at high
   risk of bias and confidence in most network estimates is low. Corroborated independently, and
   more robustly: directed questions and specific examples of what to disclose roughly doubled
   the overall effect (r = .090 vs .052) and produced an eightfold difference on psychological
   health (r = .094 vs .011) [1].
   => The core loop is a session-varying structured protocol with responsive feedback. Expect it
   to help people write better, not to hold a therapy-sized effect at follow-up.

2. **Structure and guidance matter more than duration.** In the debrief literature, high-structure
   protocols that specify exact questions and procedures averaged d = .69 against d = .32 where
   structure was absent, and facilitated debriefs reached d = .75 against d = .25 unfacilitated
   [17]. Both cells are thin -- the unfacilitated estimate rests on two samples -- but they point
   the same way, and against a blank page with a saved template. Session length showed no
   relationship to effect size (k = 17, r = .08, ns), with individual sessions averaging about
   18 minutes.
   => Build the app as an active guide that paces, follows up, and declines to accept a one-line
   answer. Target roughly 15-20 minutes and stop.

3. **Reflection needs a second source of information.** The 25% debrief improvement (d = .67
   across 46 samples) cannot be claimed here at all: one of the four required elements is
   multiple information sources, and the authors explicitly exclude "personal diary keeping" and
   "self-reflection" from the construct [17].
   => Rather than cite it, meet it. Engineer a second source into every session: a contrast with
   the user's own prior entry, an imported objective record, or the assist layer acting as the
   outside perspective. This is the single clearest structural gap between a journal and a debrief.

4. **Make the user explain before the model does.** Prompting people to generate their own
   explanation produced g = .55 (95% CI .45 to .65) across 69 effect sizes and 5,917 participants,
   and beat handing them a ready-made explanation of the same material (g = .35 favouring
   self-explanation) [18]. Prompts asking people to explain the substance worked (g = .873);
   prompts asking them to rate their own planning or understanding did not (g = .192, CI crosses
   zero), and multiple-choice self-explanation was null.
   => Withhold every model-written interpretation until the user has committed their own. Ask
   about the substance of what happened, never for a self-rating, and never offer a pick-a-reason
   widget in place of free text.

5. **Depth beats frequency, but the dosage thresholds are softer than they look.** Sessions under
   fifteen minutes were null-to-negative (r = -.007 overall, -.132 for reported health), and three
   or more sessions outperformed fewer. On audit, though, the session-count moderator was only
   marginal (p one-tailed = .098) and session length was significant for the overall effect
   (p = .03) and reported health (p = .018) but **not** for psychological health (p = .30), which
   is the outcome family this product cares about [1]. The widely-cited ~1,722-word threshold is
   post hoc: word count was measured, not manipulated, and the authors warn that verbal fluency
   rather than engagement may be doing the work [8].
   => Use fifteen minutes as a default session shape, not a gate, and do not tell users a word
   count is required.

6. **Gamification is associated with worse retention.** Across 79 RCTs of depression and anxiety
   apps, attrition was lower when the app had no gamification features and when it provided
   reminders and human contact [9]. Extrinsic rewards can undermine intrinsic motivation for a
   task the user already finds worthwhile, and accountability framed around outcomes rather than
   process produces both lower adherence and greater distress [10]. In habit-formation data, a
   single missed day did not derail acquisition: automaticity fell 0.29 points and the rebound on
   resuming was indistinguishable from an ordinary day's gain [20].
   => No streaks, no points, no badges, and never a failure state after one missed day.

7. **Reminders help, slightly.** In an 89-day micro-randomised trial of 1,255 users, a
   contextually tailored notification raised the chance of a self-monitoring entry within 24 hours
   by 3.9% relative (RR 1.039, 95% CI 1.01-1.08) [21]. The effect concentrated on weekends and did
   not decay over twelve weeks. The trial capped sends at one per day and backed off as idle days
   accumulated.
   => Ship reminders, cap at one a day, back off automatically when the user goes quiet, and size
   expectations at single-digit percentage lift rather than treating notifications as the
   retention strategy.

8. **Private articulation is enough; sharing adds nothing.** In three studies, reflection followed
   by explaining insights to another person was never significantly better than private reflection
   [27]. Separately, whether writing was private or done in another's presence did not moderate
   the pronoun-depression association [23].
   => Build for a solo writer. Skip audience, publishing, and social features entirely. Note this
   sits in mild tension with rule 9's privacy finding; the honest reading is that privacy is worth
   protecting for its own sake and possibly for efficacy, but the evidence is not one-directional.

9. **Capture modality does not affect outcomes.** Handwriting, typing, and talking showed no
   significant difference on any outcome [1], and typed matched handwritten in the positive-writing
   literature [11]. Writing at home returned r = .122 against r = .034 in a controlled setting [1].
   => v1's multimodal capture is complete as a friction feature; do not expect more from it.

10. **Behavioural activation before cognitive challenge.** Pooled across 25 trials and 1,088
    participants, behavioural activation reached g = -0.74 (95% CI -0.91 to -0.56, NNT 2.5) post
    treatment, halving to -0.35 at 6-9 months [22]. Adding functional analysis and values
    clarification did not improve on the two basic elements: simple BA (self-monitoring plus
    activity scheduling) performed the same as complex BA. Dose showed no relationship to outcome
    across a median of eight sessions. Separately, in face-to-face therapy a network meta-analysis
    could not detect a difference between cognitive restructuring alone, behavioural activation
    alone, and full CBT, though the estimate for restructuring alone is markedly less precise
    (SMD 0.57, 95% CI 0.08-1.07) and the authors call for more research on it [32].
    => Ship a fixed, finishable eight-session activation course built from two fields -- what you
    did and how you felt, then what you will schedule next -- and do not add components to it.

11. **Socratic questioning is not for everyone, and its payoff is immediate rather than delayed.**
    In a 16-week open trial of 126 depressed adults, therapist Socratic questioning did **not**
    predict next-session depression severity; the entire effect ran through immediate,
    within-session cognitive change, while sustained between-session change was not a significant
    mediator [19]. Trait reactance moderated it opposite to the pre-registered hypothesis:
    questioning helped only low-reactance clients (about 39% of the sample) and was unrelated,
    with a positive point estimate, for the rest. Users low in baseline behavioural skills got
    nothing from it.
    => Measure the in-session cognitive shift, not next-week mood. Sequence activation before
    challenge. Offer a non-interrogative path for users the questioning mode does not suit.

12. **Severity determines whether self-guided help is enough.** Below PHQ-9 9 there is little or no
    difference between guided and unguided iCBT; above it, guidance matters progressively more
    [3]. Chatbot benefit for depression is g = 0.64 in clinical samples, 0.34 in sub-clinical, and
    0.07 with a confidence interval crossing zero in non-clinical samples [12].
    => Periodic PHQ-9 and GAD-7, with an honest routing message above threshold.

13. **Showing someone their scores is inert.** In routine outcome monitoring, feedback paired with
    clinical support tools reaches d = 0.36 for off-track cases, an expected-response trajectory
    d = 0.12, and raw scores d = 0.04 [13]. Severe presentations react aversively to negative
    feedback when support tools are absent. On audit: these effects are for data fed back to a
    **therapist** inside ongoing psychotherapy and are additive to therapy's own effect, so
    applying them to a solo app is an extension the source does not test.
    => Never ship a bare mood chart. Pair every trend with an expected trajectory and a structured
    off-track check-in covering social support, motivation, life events, and safety.

14. **Text analytics cannot say anything about one person.** First-person singular pronoun use
    correlates with depression at r = .130 (95% CI .098-.162, 21 studies, N = 3,758) -- about 1.7%
    of shared variance -- and whether reducing it helps is explicitly untested [23]. In a
    resampling analysis of 65,896 users, no language feature reached significance for personality
    at a sample of 150 users, however much text each contributed [24]; a solo journal is n = 1.
    Function words stay reliable in short texts while emotion words do not: 500 random words
    contained 56 pronouns but only 11 negative-emotion words. Dictionary counting misses negation
    and irony, with 21% of false positives from negation alone.
    Word categories also violate ordinary psychometrics -- the article category scored Cronbach's
    alpha of .14 across a 2,800-file corpus -- and cannot resolve irony or idiom; "mad" in "I'm mad
    about him" scores as anger [36]. The one signal that did track benefit in expressive writing
    was an *increase over sessions* in causal and insight words, not their level, and that finding
    is reported without an effect size or sample size [36].
    => Ship no inferred score, trait profile, or percentile. Any word-level feature must be shown
    as highlighted matches in the user's own text that they can see and dismiss, never as a number
    about them.

15. **Sentiment in particular would mislead.** Absolutist word use rises monotonically with
    severity (control 0.97%, anxiety and depression 1.45%, suicidal ideation 1.80%) [14]. The
    popular framing that sentiment tracks the wrong way overstates it, and the audit corrected
    this: only "negative emotion" was significantly lower in suicidal-ideation than anxiety forums
    (d = 1.05) and it was indistinguishable from depression forums (d = 0.05, ns), while "sad" ran
    significantly *higher* in suicidal ideation (d = 1.78), and negative-emotion words were still
    far above controls (d = 3.56). These remain between-forum, group-level effects with no
    within-person analysis. In the one study often cited for automated emotion labelling, the
    F1-macro of 0.45 was measured on translated Reddit comments, not on the therapy transcripts
    the model was then applied to unvalidated [15]; negative sentiment alone predicted symptom
    severity at r = .08.
    => No sentiment tracking and no risk score from word counts. Surfacing all-or-nothing language
    back to the writer as a restructuring prompt is defensible only as a transparent mirror of
    their own words, never as a measurement.

16. **Rumination and reflection differ by framing, and the difference is specified.** In 1,130
    community adults measured a year apart, brooding predicted higher later depression
    (beta = 0.158) while reflection predicted lower (beta = -0.059, which the authors warn may be
    a suppression artifact); brooding correlates with depression at r = .44 against reflection's
    r = .12 [25]. Critically, the item "Write down what you are thinking and analyze it" loads on
    the *adaptive* reflection factor. The brooding factor is defined by grievance and social
    comparison: "What am I doing to deserve this?", "Why do I have problems other people don't
    have?", "Why can't I handle things better?"
    => Frame prompts analytically ("analyse", "understand why this happened") and keep grievance
    and social-comparison framings out of prompt copy entirely. This is the concrete mechanism
    behind the reflection-versus-rumination distinction.

17. **Distanced self-talk has a specific, testable form.** Writing about a current worry using
    one's own name and non-first-person pronouns raised challenge-over-threat appraisal
    (partial eta-squared = .112) in the only fully self-administered written study (N = 117) [26].
    It was only ever tested joined to a causal "why did [name] feel this way" question, never as
    detached observation. It did not reduce anticipatory anxiety (partial eta-squared = .001);
    the effect is on post-event recovery and reduced replaying. Trait social anxiety did not
    moderate it. Under unsupervised online delivery about a quarter of participants failed the
    compliance check, by writing about a past event or not using the assigned pronoun form.
    => Offer the mode to everyone, keep the why-question attached, frame it as recovery rather
    than calm, and validate the entry before saving it.

18. **Sycophancy is the AI layer's characteristic failure.** Agreeable models reinforce
    confirmation bias and cognitive distortions and avoid necessary challenge, where trained
    providers deliberately alternate support and challenge [4].
    => The assist layer's job is to challenge, after the user has explained themselves first.

19. **Crisis handling must be hard-coded.** Against an escalating C-SSRS-based prompt sequence,
    zero of 29 mental-health chatbot agents met adequate-response criteria; only 10.34% offered a
    correct region-appropriate emergency number unprompted; 20.69% gave inconsistent or
    inappropriate responses, including answering "I think I will do it" with "It's great to see
    that you're determined!"; and only 17.24% ever stated they were not equipped to handle a
    crisis [16]. A separate qualitative study, cited by that paper, found that guardrails blocking
    messages disrupted some users' sense of emotional sanctuary and caused additional distress.
    => Locale-configured hard-coded resources, an explicit not-equipped statement, and no
    censorship of what the user may write in their own journal.

20. **The language model is not the active ingredient.** Generative-AI chatbots did not outperform
    retrieval or rule-based ones, and the generative-AI subgroup effect was not significant on its
    own (8 of 39 trials) [12].
    => The scripted protocol is primary and must work completely with Ollama absent.

### Popular ideas v2 deliberately does not build

- Benefit-finding or "silver lining" prompts: five studies, few significant benefits, and no
  improvement in affect, perceived stress, or benefit-finding itself [11].
- Best Possible Self as a core feature: one study found the neutral writing control improved
  subjective wellbeing more than the intervention did [11].
- Three Good Things, resource diaries, and satisfaction-processes writing: a single study each
  [11]. The whole positive-writing base is 51 studies all rated poor or fair, with only 7 using
  intention-to-treat, and it is a narrative review with no meta-analysis or dose-response model.
- Coaching users to write fewer "I" words. The correlation is r = .13 and the causal direction is
  explicitly untested; gaming the metric would corrupt any later measurement [23].
- Self-rated "how much did this help" sliders as an evaluation metric. In the debrief literature,
  subjectively rated criteria averaged d = 1.07 against d = 0.58 for objective ones -- that choice
  alone nearly doubles an apparent effect [17].

### Harms to design against

- **Trauma-disclosure prompting without support.** Expressive writing increased illness-related
  doctor visits in a PTSD sample and produced null effects in former psychiatric patients, people
  with negative body image, and people with suicidal tendencies [1]. A caution against
  unsupervised home-based application is often quoted [11], but it traces to a single 2002 study
  and sits in direct tension with [1], where home disclosure outperformed lab settings and topic
  valence did not significantly moderate any outcome. The conservative reading stands: v2 never
  prompts trauma disclosure by default.
- **Misreading the post-writing dip.** A short-term negative-affect spike is reliable and coexists
  with eventual benefit [8]. It must never be auto-interpreted as deterioration.
- **Rumination amplification.** See rule 16 for the concrete framings to avoid.
- **Dependency.** The APA flags that users in low-income or care-scarce contexts carry
  higher-than-average dependency risk precisely because the tool becomes their primary support,
  and advises limiting AI memory, reducing anthropomorphic features, and adding break nudges [4].

The dependency guidance appears to conflict with a journal's longitudinal value. v2 resolves it by
locating continuity in the archive rather than in a persona: the product remembers, the assistant
does not. Every assist call is stateless and receives only the slice the user chose to bring to it.

## Evidence status

All 125 claims underlying references [1]-[16] and [28]-[37] were extracted from primary sources by
automated research agents and then audited adversarially against those sources: 95 confirmed
unchanged, 28 overstated, 2 with a wrong figure. Every correction identified has been folded into
the rules above, and the two numeric errors -- a study-count/sample-size pairing and a corrupted
quotation -- are fixed.

The pattern is worth carrying forward: numbers survived audit far better than interpretations did.
The recurring failure was a correct figure with an interpretive tail that reached past it, most
often by generalising a therapist-delivered effect to unguided software. References [17]-[27]
carry verbatim source quotes and per-claim evidence grading; their adversarial verification pass
was interrupted, so treat the rules citing them as well-sourced but not double-checked.

Three limits are inherited from the sources themselves and cannot be designed away. The CBT
component, homework-compliance, routine-outcome-monitoring, and safety-planning literatures are
drawn from therapist-delivered care, so every application here is an extension. The iCBT dose
figures are the average protocol studied, not an established minimum. And the debrief
meta-analysis explicitly excludes solitary journaling from its construct, which is why rule 3
treats it as a design target rather than a citation.

## Proposed approach

The v1 stack stands. v2 adds no new infrastructure tier.

- Next.js 16, React 19, TypeScript, Tailwind 4, Drizzle, PostgreSQL on Neon, Vercel
- Vitest and Testing Library for units and routes, Playwright for end-to-end
- Ollama stays the default assist path and stays optional

Three changes are structural rather than additive:

- **Reflection becomes data.** v1 flattens the guided reflection into the single `body` column via
  `composeJournalEntryBody()`. Nothing about a reflection is queryable, so trends, reviews,
  calibration, and practice tracking are all impossible. v2 introduces a structured model and
  backfills v1 entries by parsing their existing sections.
- **Sessions become a first-class concept.** An entry belongs to a session with a type
  (reflection, decision, practice, review) and a protocol variant, which is what makes
  session-varying prompts possible.
- **The assist contract inverts.** v1 asks for a clarifying question and next steps. v2 requires a
  challenge: a disconfirming question, an alternative interpretation, and a named assumption, with
  a scripted fallback good enough to ship with no model at all.

## Assumptions

- Single user or a very small account set, as in v1
- Responsive web, no native apps
- The full loop works with no language model configured; Ollama stays optional and local-first
- No open-ended chat surface at any point in v2
- English-language protocol content only

Keep `README.md` and `PHILOSOPHY.md` aligned with this plan when scope or positioning changes.

## Roadmap

Eleven items in three waves, ordered by dependency. Use the shared PR template and Copilot prompt in
the final section for every item.

### Wave 1 - Foundation

Nothing else in v2 can be built until reflection is queryable and the safety layer is in place.

### Roadmap item 1

- **Title:** `docs(product): Define the NoemaForge v2.0.0 roadmap`
- **Branch:** `docs/v2-roadmap`
- **Goal:** lock v2 positioning, the evidence base, and the staged PR plan before any code changes
- **Why:** v2 changes what the product claims to be, and that claim needs to be written down and
  sourced before features are built on top of it
- **Key changes:**
  - rename `plan.md` to `plan_v1.0.0.md` and add `plan_v2.0.0.md`
  - state the positioning, the evidence-derived design rules, and the harms to design against
  - record the features the evidence says not to build, and the verification status of each source
  - point `README.md` at the current roadmap and add the non-therapist positioning line
- **Success criteria:**
  - the repository has a v2 roadmap with a bounded set of implementation items
  - every design rule cites a source, and unverified sources are marked as such
  - the v1 roadmap is preserved rather than overwritten
  - `README.md` states plainly that the app is not therapy and does not diagnose
- **Out of scope:**
  - application code
  - schema changes

### Roadmap item 2

- **Title:** `refactor(journal): Replace the flattened entry body with a structured reflection model`
- **Branch:** `refactor/structured-reflection`
- **Goal:** make every part of a reflection queryable so trends, reviews, calibration, and practice
  tracking become possible
- **Why:** `composeJournalEntryBody()` serialises feeling, root issue, next step, and assist output
  into the single `body` column, so none of it can be searched, compared, or aggregated; every
  remaining v2 item depends on undoing this
- **Key changes:**
  - add a session model with a type and a protocol variant, and attach entries to sessions
  - store reflection fields as columns or rows rather than as prose inside `body`
  - keep a rendered plain-text view of each entry so the archive stays readable and searchable
  - migrate v1 entries by parsing their existing section headings, leaving unparseable entries
    intact as raw captures
  - replace the fixed 100-entry history limit with pagination and add date filtering
- **Success criteria:**
  - reflection fields can be queried directly without parsing `body`
  - every existing v1 entry survives the migration with its text unchanged and its source intact
  - entries that cannot be parsed are preserved as raw captures rather than dropped or mangled
  - history and search remain usable past 100 entries
  - migration behaviour is covered by unit tests against realistic v1 entry text
- **Out of scope:**
  - new capture modes
  - new reflection prompts
  - any change to what the assist layer returns

### Roadmap item 3

- **Title:** `feat(safety): Add severity check-ins, crisis resources, and non-therapist positioning`
- **Branch:** `feat/safety-routing`
- **Goal:** put the safety and honesty layer in place before v2 adds any further AI surface area
- **Why:** the app targets someone without access to a therapist, which is exactly the group the
  APA flags for elevated dependency risk, and no chatbot in the published evaluation handled a
  crisis adequately; this cannot be retrofitted after the fact
- **Key changes:**
  - add optional periodic PHQ-9 and GAD-7 check-ins with an honest routing message above
    threshold, including the observed response-rate gap between self-guided and supported use
  - hard-code locale-configured crisis resources; never let a model generate a phone number
  - add a persistent, plainly worded statement that the app is not a therapist, does not diagnose,
    and that assist output comes from a language model
  - add a one-off consent and contraindication step before any prompt that invites writing about
    trauma, and keep such prompts out of the default flow
  - never block, censor, or refuse what the user writes in their own journal
  - add a persistent safety-plan document with the published six ordered steps, moving from
    self-managed coping through distraction, support contacts, and professional help to means
    safety; describe it as plan storage and rehearsal, since the studied intervention bundled a
    clinician-built plan with roughly four human follow-up calls [34]
- **Success criteria:**
  - crisis resources are correct for the configured locale and reachable from every screen
  - the safety plan is a first-class stored document rather than free text inside an entry, and
    is retrievable in one step from anywhere in the app
  - check-in scores are stored, but a score alone never triggers an automated interpretation
  - the app states its limits before a user's first session, not buried in a settings page
  - trauma-writing prompts are unreachable without an explicit opt-in
  - no user text is ever rejected or filtered on the way into the journal
- **Out of scope:**
  - risk scoring or classification of the user's writing
  - contacting anyone on the user's behalf
  - clinical interpretation of check-in scores

### Wave 2 - The reflection engine

The core loop, the challenge layer, and the specialised session types.

Build item 11 first. Socratic-style challenge -- which is what item 4's Explore move is -- did
nothing for users low in baseline behavioural skills, and behavioural activation carries better
evidence than cognitive restructuring alone as a starting protocol (rules 10 and 11). Item
numbering is kept stable because the GitHub issues reference it; only the build order differs.

### Roadmap item 4

- **Title:** `feat(reflection): Add the five-move guided session`
- **Branch:** `feat/five-move-session`
- **Goal:** replace the three-field distillation step with a session that reliably moves a raw dump
  to a committed close
- **Why:** structured, session-varying instruction is the difference between writing that
  approaches therapy's effect size and writing that barely beats describing a neutral topic; and
  reflection that ends in analysis rather than a decision is the mechanism by which journaling
  turns into rumination
- **Key changes:**
  - implement the five moves: Dump, Distinguish (facts, feelings, assumptions, wants), Distill
    ("the real issue is..."), Explore (what am I missing, what am I avoiding, is there another
    interpretation, what would change my mind), Act ("the next useful action is...")
  - add a closure gate: a session completes only when it produces an insight, a decision, an open
    question, or a next action
  - rotate Distinguish and Explore wording across sessions from a protocol library so instructions
    vary rather than repeat; seed the library from published protocols, including the bounded
    five-session structured writing arc [31] and a user-set thirty-minute worry window with a
    one-tap daytime postpone capture, which returned d = 0.358 on worry duration over plain worry
    logging and works best left unstructured inside the window [35]
  - add an optional self-distanced mode that switches Distill and Explore to second or third person
  - surface elapsed time and writing depth as information, never as a lock or a score
  - keep every move skippable except the closure gate
- **Success criteria:**
  - a user can carry one raw dump through all five moves and finish with a recorded close
  - a session cannot be marked complete with analysis alone
  - two consecutive sessions present different Distinguish and Explore wording
  - the whole loop works with no language model configured
  - Playwright covers the full five-move session on phone and laptop widths
- **Out of scope:**
  - the AI challenge layer, which is item 5
  - decision and practice session types, which are items 6 and 7
  - review and trend surfaces, which are item 8

### Roadmap item 5

- **Title:** `feat(assist): Rebuild AI assistance as a challenge-oriented reflection partner`
- **Branch:** `feat/challenge-assist`
- **Goal:** make the assist layer contribute the thing that distinguishes enhanced writing from
  plain writing, which is responsive challenge rather than agreement
- **Why:** sycophancy is the named therapeutic failure mode of language models, and v1's assist
  contract asks only for a clarifying question and next steps, which is the shape most likely to
  produce agreeable, unchallenging output
- **Key changes:**
  - change the assist contract to require a disconfirming question, an alternative interpretation,
    and one named assumption drawn from the user's own text
  - keep every call stateless and pass only the slice of the archive the user chose to bring
  - surface all-or-nothing language from the entry back to the writer as a restructuring prompt,
    without scoring it or storing it as a risk signal
  - improve the no-model fallback so the scripted challenge is genuinely useful on its own
  - keep journal text treated strictly as data, never as instructions, as v1 already does
  - add an explicit refusal path for diagnosis, medication, and crisis questions that hands off to
    the item 3 resources
- **Success criteria:**
  - assist output always contains a challenge, never only validation
  - the model never receives archive content the user did not choose to include
  - the fallback path produces a usable challenge with no Ollama configured
  - prompt-injection attempts inside entry text do not alter assist behaviour
  - diagnosis and crisis requests are refused and routed rather than answered
- **Out of scope:**
  - open-ended chat
  - multi-turn conversation
  - any persistent AI memory of the user across sessions
  - cloud model providers

### Roadmap item 6

- **Title:** `feat(decisions): Add the decision journal with predictions and calibration review`
- **Branch:** `feat/decision-journal`
- **Goal:** let a user make a decision by writing it out, then find out later whether their
  judgment was any good
- **Why:** reasoning about a hard decision mutates continuously until it is written down, and
  without a recorded prediction there is no way to separate a good decision from a lucky outcome
- **Key changes:**
  - add a decision session type covering what is being decided, what is known, what is uncertain,
    the options, what is valued here, what is feared, and what would change the decision
  - record a predicted outcome with a confidence level and a review date
  - add a premortem prompt that asks the user to imagine the decision having gone badly and say
    why, as a timed two-minute freewrite for failure reasons followed by a separate two-minute
    freewrite for fixes; a generic "critique this" prompt moved confidence no more than doing
    nothing, so the failure frame is the active part [38]
  - capture confidence at three fixed checkpoints rather than one, because confidence drops after
    generating failure reasons and partly rebounds after generating fixes [38]
  - resurface decisions on their review date to record the actual outcome against the prediction
  - add a calibration view comparing stated confidence against observed hit rate over time
  - gate the first prediction behind a one-time primer under an hour; comparable sub-hour training
    improved forecasting accuracy by 6-11% on Brier scores across four nine-month tournaments, and
    single-session debiasing training has shown durable effects [39][40]
- **Success criteria:**
  - a decision can be captured, predicted, reviewed, and scored without leaving the app
  - a decision due for review appears without the user having to remember it
  - the calibration view is honest about small samples rather than implying precision
  - decisions are searchable alongside every other entry
  - the full decision-to-review cycle has end-to-end coverage
- **Out of scope:**
  - advice on what to decide
  - probability elicitation beyond a simple confidence level
  - importing decisions from outside the app
  - any claim that the app improves calibration; the premortem evidence measured self-reported
    confidence only and never checked whether confidence tracked accuracy [38]

### Roadmap item 7

- **Title:** `feat(practice): Add the experience-to-principle practice loop`
- **Branch:** `feat/practice-loop`
- **Goal:** let reflection change how the user operates, rather than only accumulating entries
- **Why:** without a step that converts a reflection into a rule and a rule into a test, experience
  accumulates but behaviour does not change
- **Key changes:**
  - add a practice session type running experience, reflection, principle, experiment
  - keep principles as a persistent, editable list the user owns
  - give experiments a check-in date and a recorded outcome that feeds the next session
  - link every principle and experiment back to the entry that produced it
- **Success criteria:**
  - a user can turn a single experience into a named principle and a testable experiment
  - experiments due for check-in surface without being searched for
  - a principle shows the entries and experiment outcomes behind it
  - principles and experiments are covered by unit and end-to-end tests
- **Out of scope:**
  - goal or habit tracking beyond experiment check-ins
  - suggesting principles on the user's behalf
  - sharing or exporting principles as a template library

### Roadmap item 11

- **Title:** `feat(activation): Add the eight-session behavioural activation course`
- **Branch:** `feat/behavioural-activation`
- **Goal:** give the user a finishable, low-demand protocol that works before they are ready to
  argue with their own thoughts
- **Why:** behavioural activation reached g = -0.74 post treatment across 25 trials, adding
  functional analysis and values clarification did not improve on the two basic elements, and
  Socratic-style questioning produced no benefit for users low in baseline behavioural skills;
  activation is the right first protocol and the right prerequisite for item 4
- **Key changes:**
  - add a fixed eight-session course built from two fields: what you did and how you felt, then
    what you will schedule next
  - keep the course finishable and bounded rather than open-ended, and do not add components to it
  - schedule a follow-up check at six and nine months after completion
  - surface the course as the default starting protocol for a new user
- **Success criteria:**
  - a user can complete the whole course and see that it is finished
  - the protocol stays at two fields; values clarification and functional analysis are not added
  - the course works with no language model configured
  - scheduled activities and their outcomes are queryable alongside every other session type
  - the course has unit and end-to-end coverage
- **Out of scope:**
  - values clarification and functional analysis screens
  - longer or premium course variants, which the dose data does not support
  - importing activity data from external services

### Wave 3 - Continuity and durability

What makes the archive worth having, and what keeps the practice alive.

### Roadmap item 8

- **Title:** `feat(review): Add weekly and monthly review with longitudinal resurfacing`
- **Branch:** `feat/review-resurfacing`
- **Goal:** make months of writing legible, so the user can compare what they believed then with
  what they believe now
- **Why:** the archive is the point of keeping one, but raw score displays are effectively inert
  and sentiment trends would point the wrong way, so the review has to be built from the things
  that actually carry signal
- **Key changes:**
  - add a weekly review covering sessions completed, closes produced, questions still open,
    experiments and decisions due, and principles touched
  - resurface one past entry per review for direct comparison with current thinking
  - add a monthly review showing check-in scores against an expected trajectory rather than as
    bare numbers, with a structured off-track check-in covering social support, motivation, life
    events, and safety
  - never interpret a post-session mood dip as deterioration
- **Success criteria:**
  - a review can be completed in a few minutes and ends with a close like any other session
  - trends are never shown without an accompanying trajectory and an actionable next step
  - the app ships no sentiment chart, no per-entry emotion label, and no computed risk score
  - reviews work with a sparse archive without implying the user has failed
  - review generation is covered by unit tests over fixture archives
- **Out of scope:**
  - sentiment analysis and emotion classification
  - predictive modelling of the user's state
  - exporting reviews to third-party services

### Roadmap item 9

- **Title:** `feat(engagement): Add process-framed accountability without gamification`
- **Branch:** `feat/accountability`
- **Goal:** replace the missing human supporter with the mechanics that actually retain people
- **Why:** unguided completion rates in comparable programmes run in the low single digits, and
  the obvious fix is the wrong one: gamification is associated with worse retention, and
  outcome-framed accountability lowers adherence while raising distress
- **Key changes:**
  - add an if-then plan composer using the published `And if <situation>, then I will <action>!`
    frame as two bound fields, rejecting plans whose cue is only a date word or whose action names
    only an outcome, since imprecise plans confer no advantage over a bare intention [28]
  - prompt a short rehearsal write-through of the cue-to-action link after a plan is saved, rather
    than routing the plan into a pinned reminder card [28]
  - add reminders tied to that plan, with an explanation of why the app is prompting, capped at
    one a day and backing off automatically as idle days accumulate
  - collect a commitment rating before opening the planning flow and route weakly held goals to a
    why-this-matters prompt instead, since if-then plans only work on strongly held, currently
    active goals [28]; note that document-delivered mental contrasting showed a smaller pooled
    effect than experimenter-delivered (g = 0.277 vs 0.465), on a subgroup that excluded the only
    large online trials [33]
  - frame all progress around completed sessions and closes, never around mood improving
  - track lapses without penalty, offer a shorter re-entry session after a gap, and offer plan
    revision after repeated failure rather than surfacing an adherence score
  - measure nonusage separately from account retention [29]
- **Success criteria:**
  - the app ships no streak, point, badge, or loss-framed mechanic
  - a plan cannot be saved with a vague cue or an outcome-only action
  - progress language never implies the user should be feeling better
  - a returning user after a long gap meets a re-entry path rather than a broken counter
  - reminder behaviour is user-configurable and off by default
- **Out of scope:**
  - social features, sharing, or accountability partners
  - push notifications requiring native app support
  - any external analytics on entry content

### Roadmap item 10

- **Title:** `feat(privacy): Harden privacy, export, and data ownership`
- **Branch:** `feat/privacy-hardening`
- **Goal:** make the archive genuinely the user's, and make private writing safe enough to be
  honest in
- **Why:** writing privately measurably outperforms writing under observation, so privacy is part
  of how the product works; and in the reviewed consumer mental-health category, 23 of 27 apps
  earned a privacy warning label [30]
- **Key changes:**
  - meet the published minimum security baseline: encryption in transit and at rest, enforced
    password strength, a documented vulnerability-reporting contact, and a real privacy policy [30]
  - add full export of every entry, session, principle, and decision in plain text and JSON
  - add account and data deletion that actually removes stored content
  - keep the default assist path local-first and document exactly what leaves the machine when
    Ollama is configured remotely
  - keep entry text out of logs, error reports, and any third-party service
- **Success criteria:**
  - a user can export their entire archive and read it without the app
  - deletion removes entries, sessions, uploads, and check-in scores
  - no entry text appears in application logs or error output
  - the privacy documentation states plainly what is stored, where, and what the assist path sends
- **Out of scope:**
  - end-to-end encryption with client-held keys
  - multi-device sync
  - compliance certification

## References

Entries marked "audited" were re-checked against the source by an adversarial verification pass;
see "Evidence status" above.

1. Frattaroli (2006), *Experimental Disclosure and Its Moderators: A Meta-Analysis*, Psychological
   Bulletin (audited). https://bpb-us-e2.wpmucdn.com/faculty.sites.uci.edu/dist/c/602/files/2019/08/Frattaroli-psych-bulletin-2006.pdf
2. *What is the evidence for the efficacy of self-help acceptance and commitment therapy?*
   (audited). https://www.sciencedirect.com/science/article/abs/pii/S2212144717300753
3. *Internet-Based Cognitive Behavioral Therapy for Depression: An IPD Network Meta-Analysis*
   (audited). 39 RCTs contributed IPD; 8,107 patients across 36 studies analysed.
   https://eprints.whiterose.ac.uk/id/eprint/168702/1/PSY20_2474R_Merged_PDF.pdf
4. APA Health Advisory (Nov 2025), *Use of Generative AI Chatbots and Wellness Applications for
   Mental Health* (audited). https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-chatbots-wellness-apps
5. DLA Piper (Aug 2025), *A legislative and enforcement outlook for mental health chatbots*
   (audited). https://www.dlapiper.com/en/insights/publications/2025/08/ai-mental-health-chatbots
6. Stanford HAI / Moore et al. (2025), *New study warns of risks in AI mental health tools*
   (audited; the journaling endorsement is a single hedged sentence, see Positioning).
   https://news.stanford.edu/stories/2025/06/ai-mental-health-care-tools-dangers-risks
7. *Expressive writing vs psychotherapy for PTSD: systematic review and network meta-analysis*
   (audited). https://pmc.ncbi.nlm.nih.gov/articles/PMC9772920/
8. *Chasing elusive expressive writing effects: emotion-acceptance instructions* (N = 833 RCT;
   audited). https://pmc.ncbi.nlm.nih.gov/articles/PMC10300201/
9. *Uptake, Adherence, and Attrition in Clinical Trials of Depression and Anxiety Apps* (79 RCTs),
   JAMA Psychiatry 2025 (audited). https://doi.org/10.1001/jamapsychiatry.2025.3439
10. Mohr et al., *Supportive Accountability: A Model for Providing Human Support to eHealth
    Interventions* (audited). https://pmc.ncbi.nlm.nih.gov/articles/PMC3221353/
11. *Positive expressive writing interventions, subjective health and wellbeing* (51 studies;
    audited). https://pmc.ncbi.nlm.nih.gov/articles/PMC12094736/
12. *Systematic review and meta-analysis of chatbots in the management of depressive and anxiety
    symptoms* (39 RCTs; audited). https://www.nature.com/articles/s41746-026-02566-w
13. Barkham, De Jong, Delgadillo & Lutz, *Routine Outcome Monitoring and Feedback: Research Review
    and Recommendations*, Psychotherapy Research 33(7):841-855 (audited).
    https://www.tandfonline.com/doi/full/10.1080/10503307.2023.2181114
14. Al-Mosaiwi & Johnstone (2018), *In an Absolute State: Elevated Use of Absolutist Words*
    (audited). https://pmc.ncbi.nlm.nih.gov/articles/PMC6376956/
15. *Employing large language models for emotion detection in psychotherapy transcripts* (audited;
    the F1-macro figure is from GoEmotions, not the transcripts).
    https://pmc.ncbi.nlm.nih.gov/articles/PMC12098529/
16. *Performance of mental health chatbot agents in detecting and managing suicidal ideation*
    (29 agents), Scientific Reports 2025 (audited).
    https://www.nature.com/articles/s41598-025-17242-4
17. Tannenbaum & Cerasoli, *Do Team and Individual Debriefs Enhance Performance? A Meta-Analysis*
    (46 samples, N = 2,136). Explicitly excludes solitary journaling from the construct.
    https://cebma.org/assets/Uploads/Tannenbaum-Cerasoli.pdf
18. Bisra et al. (2018), *Inducing Self-Explanation: A Meta-Analysis* (69 effect sizes,
    N = 5,917). https://gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf
19. *Socratic questioning, cognitive change and symptom change in cognitive therapy for
    depression* (N = 126 open trial, Ohio State dissertation).
    https://etd.ohiolink.edu/acprod/odb_etd/ws/send_file/send?accession=osu1536691280047438&disposition=inline
20. Lally et al. (2010), *How are habits formed: Modelling habit formation in the real world*,
    Eur J Soc Psychol. Median 66 days, range 18-254, model fitted for 48% of participants.
    https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674
21. *Micro-randomized trial of push notifications for self-monitoring* (1,255 users, 89 days).
    https://pmc.ncbi.nlm.nih.gov/articles/PMC6293241/
22. *Behavioural activation for depression: systematic review and meta-analysis* (25 trials,
    N = 1,088), PLOS ONE. https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0100100
23. *First-person singular pronoun use and depression: a meta-analysis* (21 studies, N = 3,758).
    https://osf.io/7sgzn/
24. Eichstaedt et al., *Closed and Open Vocabulary Approaches to Text Analysis: A Primer*,
    Psychological Methods. https://jeichstaedt.com/s/Eichstaedt-Intro-to-Text-analysis_psych-methods_sp.pdf
25. Treynor, Gonzalez & Nolen-Hoeksema (2003), *Rumination Reconsidered: A Psychometric Analysis*
    (N = 1,130, 1-year follow-up). https://websites.umich.edu/~gonzo/papers/treynor-rumination.pdf
26. Kross et al. (2014), *Self-Talk as a Regulatory Mechanism: How You Do It Matters*, JPSP.
    https://sites.lsa.umich.edu/emotion-selfcontrol-psych/wp-content/uploads/sites/1322/2024/07/KrossJ_Pers_Soc_Psychol2014Self-talk_as_a_regulatory_mechanism_How_you_do_it_matters.pdf
27. Di Stefano, Gino, Pisano & Staats, *Learning by Thinking: How Reflection Can Spur Progress
    Along the Learning Curve* (Wipro field experiment plus two lab studies).
    https://larryferlazzo.edublogs.org/files/2013/08/reflection-1di0i76.pdf
28. Gollwitzer & Sheeran (2006), *Implementation Intentions and Goal Achievement: A Meta-Analysis
    of Effects and Processes*. d = .65 (95% CI .60-.70) across 94 tests, N = 8,461, against a goal
    intention alone; d = .58 for self-nominated personal goals.
    https://kops.uni-konstanz.de/handle/123456789/10973
29. Eysenbach (2005), *The Law of Attrition*, J Med Internet Res 7(1):e11 (audited; the 45x
    completion gap compares two non-comparable cohorts). https://www.jmir.org/2005/1/e11/
30. Mozilla Foundation, *Privacy Not Included - Mental Health Apps* (audited).
    https://www.mozillafoundation.org/en/privacynotincluded/categories/mental-health-apps/
31. Sloan, Marx et al. (2018), *Written Exposure Therapy vs Cognitive Processing Therapy*
    (audited). A 5-session therapist-delivered writing protocol noninferior to 12-session CPT,
    with 6.4% versus 39.7% dropout. https://pmc.ncbi.nlm.nih.gov/articles/PMC5843538/
32. Ciharova et al. (2021), *Cognitive restructuring, behavioral activation and cognitive-behavioral
    therapy for adult depression: a network meta-analysis* (audited), J Consult Clin Psychol
    89(6):563-574. https://pubmed.ncbi.nlm.nih.gov/34264703/
33. *A Meta-Analysis of the Effects of Mental Contrasting With Implementation Intentions*
    (audited). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8149892/
34. *Safety Planning Intervention plus follow-up (SPI+) in emergency departments* (1,640 patients,
    non-randomised cohort comparison). https://pmc.ncbi.nlm.nih.gov/articles/PMC6142908/
35. Dippel et al. (2023), *Worry postponement: a meta-analysis* (8 samples, 7 RCTs, N = 999).
    https://www.piekeren.com/wp-content/uploads/2024/03/Dippel.2023_Worry-postponement-meta-analysis.pdf
36. Tausczik & Pennebaker (2010), *The Psychological Meaning of Words: LIWC and Computerized Text
    Analysis Methods*. https://www.cs.cmu.edu/~ylataus/files/TausczikPennebaker2010.pdf
37. *Quantity and Quality of Homework Compliance: A Meta-Analysis* (audited; therapist-delivered
    CBT only). https://www.sciencedirect.com/science/article/abs/pii/S0005789416300296

38. Veinott et al. (2010), *Evaluating the Effectiveness of the PreMortem Technique on Plan
    Confidence* (N = 178, single lab experiment; facilitated and group-based).
    https://web.archive.org/web/20200928015943/http://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf
39. *Training improves probabilistic forecasting accuracy* (four nine-month tournaments;
    sub-hour training improved Brier scores 6-11%). https://journal.sjdm.org/16/16511/jdm16511.pdf
40. Morewedge et al., *Debiasing Decisions: Improved Decision Making With a Single Training
    Intervention*. https://marketing.wharton.upenn.edu/wp-content/uploads/2019/12/01.06.2020-Morewedge-Carey-PAPER-Debiasing-Decisions.pdf

## Recommended model per item

Each roadmap item's GitHub issue carries a ready-to-paste prompt for both Claude Code and Codex.
Effort refers to the reasoning-effort setting: Claude Code exposes low through xhigh, GPT-5.6
exposes none through max.

| Item | Anthropic | Effort | OpenAI | Effort |
| --- | --- | --- | --- | --- |
| 1 Roadmap | Opus 5 | xhigh | GPT-5.6 Sol | xhigh |
| 2 Structured reflection model | Opus 5 | xhigh | GPT-5.6 Sol | xhigh |
| 3 Safety and severity routing | Opus 5 | high | GPT-5.6 Sol | high |
| 4 Five-move session | Opus 5 | high | GPT-5.6 Sol | high |
| 5 Challenge-oriented assist | Opus 5 | xhigh | GPT-5.6 Sol | xhigh |
| 6 Decision journal | Opus 5 | high | GPT-5.6 Sol | high |
| 7 Practice loop | Sonnet | high | GPT-5.6 Terra | high |
| 8 Review and resurfacing | Opus 5 | high | GPT-5.6 Sol | high |
| 9 Accountability | Sonnet | high | GPT-5.6 Terra | high |
| 10 Privacy hardening | Opus 5 | xhigh | GPT-5.6 Sol | xhigh |
| 11 Behavioural activation course | Sonnet | high | GPT-5.6 Terra | high |

Items 7, 9, and 11 sit at the balanced tier because they are scoped and rule-driven once their
preceding items land. Items 2, 5, and 10 sit at xhigh because a silent mistake in a data
migration, an anti-sycophancy prompt contract, or a deletion path is expensive and hard to detect
after the fact.

## Shared templates

### Shared PR template

Use this structure when opening a PR for any roadmap item. Fill it with that item's `Why`,
`Key changes`, `Success criteria`, and `Out of scope` bullets.

```md
## Why
<why from the roadmap item>

## What changed
- <key change 1>
- <key change 2>
- <key change 3>

## Success criteria
- <criterion 1>
- <criterion 2>
- <criterion 3>

## Out of scope
- <out-of-scope item 1>
- <out-of-scope item 2>
```

### Shared Copilot prompt

Use the roadmap item as the source of truth for scope. For already-started work, use the exact
branch shown in that roadmap item.

```text
Read plan_v2.0.0.md, README.md, and AGENTS.md first. `.github/copilot-instructions.md` mirrors
AGENTS.md. Read PHILOSOPHY.md too when the roadmap item changes product behavior rather than only
scaffolding. `plan_v1.0.0.md` is the historical v1 roadmap and is not the current source of truth.

Create a new GitHub Issue for <roadmap item title> if one does not already exist; otherwise use
the existing issue. Then create the branch named in that roadmap item and implement only that PR.

Use the roadmap item's Goal, Why, Key changes, Success criteria, and Out of scope bullets as the
source of truth. Where the item is justified by a design rule in the "What the evidence changes"
section, do not weaken or work around that rule without saying so in the PR.

Keep the PR narrow, add tests that satisfy the item's success criteria, use a scoped commit
message with the issue number, and open a draft PR with the shared PR template.
```
