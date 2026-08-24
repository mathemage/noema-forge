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

The same literature is direct about what is appropriate: supportive journaling, reflection, and
coaching are named as suitable lower-risk roles for language models [6]. That is precisely this
product. v2 commits to it, and routes honestly to human help when severity warrants.

## What the evidence changes

Ten design rules, each traceable to a source. These are the reason v2 looks the way it does.

1. **A blank "write your feelings" box is the weakest possible design.** Plain expressive writing
   reaches SMD -0.43 against waitlist and is barely distinguishable from writing about neutral
   topics (-0.37). Enhanced writing -- directive instructions that change each session, plus
   responsive feedback -- reaches -0.81, statistically indistinguishable from full psychotherapy
   (-0.78) [7]. The superiority is not robust: it disappears when two-arm trials are removed, and
   30 of 44 trials are at high risk of bias. Treat it as the best available direction, not a
   settled result. Corroborated independently: directed questions roughly doubled the overall
   effect (r = .090 vs .052) and produced an eightfold difference on psychological health
   (r = .094 vs .011) [1].
   => The core loop is a session-varying structured protocol with responsive feedback.

2. **Depth beats frequency, and short sessions may be worse than none.** At least three sessions
   of at least fifteen minutes; sessions under fifteen minutes were null-to-negative (r = -.007
   overall, -.132 for reported health). Session spacing was not a significant moderator [1]. In
   an N = 833 RCT, benefit appeared only for participants whose writing reached roughly 1,722
   words [8]. These are moderator analyses, not randomised dose comparisons, so read them as
   direction rather than as a validated threshold.
   => Measure depth and completed sessions, not consecutive days.

3. **Gamification is associated with worse retention.** Across 79 RCTs of depression and anxiety
   apps, attrition was lower when the app had no gamification features and when it provided
   reminders and human contact [9]. Extrinsic rewards can undermine intrinsic motivation for a
   task the user already finds worthwhile, and accountability framed around outcomes rather than
   process produces both lower adherence and greater distress [10].
   => No streaks, no points, no badges. Reminders and process framing instead.

4. **Capture modality does not affect outcomes; privacy does.** Handwriting, typing, and talking
   showed no significant difference on any outcome [1], and typed writing matched handwritten in
   the positive-writing literature [11]. But writing at home returned r = .122 against r = .034
   in a controlled setting, and a private room .085 against .034 in a public one [1].
   => v1's multimodal capture is complete as a friction feature; do not expect more from it.
   Privacy work is an efficacy investment, not only an ethical one.

5. **Severity determines whether self-guided help is enough.** Below PHQ-9 9 there is little or no
   difference between guided and unguided iCBT; above it, guidance matters progressively more
   [3]. Chatbot benefit for depression is g = 0.64 in clinical samples, 0.34 in sub-clinical, and
   0.07 with a confidence interval crossing zero in non-clinical samples [12].
   => Periodic PHQ-9 and GAD-7, with an honest routing message above threshold.

6. **Showing someone their scores is inert.** In this review of routine outcome monitoring,
   feedback paired with clinical support tools reaches d = 0.36 for off-track cases, an
   expected-response trajectory reaches d = 0.12, and displaying raw scores reaches d = 0.04
   [13]. Severe presentations react aversively to negative feedback when support tools are
   absent.
   => Never ship a bare mood chart. Pair every trend with an expected trajectory and a structured
   off-track check-in covering social support, motivation, life events, and safety.

7. **Sentiment tracking would point the wrong way.** Absolutist word use rises monotonically with
   severity (control 0.97%, anxiety and depression 1.45%, suicidal ideation 1.80%), while
   negative-emotion dictionaries were *lower* in the suicidal-ideation group than in anxiety and
   depression [14]. A sentiment trend would have ranked the highest-risk group as least
   distressed. These are between-group effects with no within-person analysis, so scoring an
   individual over time is an untested extrapolation. Separately, per-label emotion detection in
   therapy transcripts reaches only F1-macro 0.45, though aggregated features predict severity at
   r = .50 [15].
   => No sentiment tracking, no risk score from word counts, no per-entry emotion label presented
   as fact. Mirror all-or-nothing language back as a restructuring prompt instead.

8. **Crisis handling must be hard-coded.** Against an escalating C-SSRS-based prompt sequence,
   zero of 29 mental-health chatbot agents met adequate-response criteria; only 10.34% offered a
   correct region-appropriate emergency number unprompted; 20.69% gave inconsistent or
   inappropriate responses, including answering "I think I will do it" with "It's great to see
   that you're determined!"; and only 17.24% ever stated they were not equipped to handle a
   crisis [16]. Crude keyword blocking is itself documented as harmful, because guardrails that
   refuse to let a message be sent disrupt the user's sense of emotional sanctuary.
   => Locale-configured hard-coded resources, an explicit not-equipped statement, and no
   censorship of what the user may write in their own journal.

9. **Sycophancy is the AI layer's characteristic failure.** Agreeable models reinforce
   confirmation bias and cognitive distortions and avoid necessary challenge, where trained
   providers deliberately alternate support and challenge [4].
   => The assist layer's job is to challenge. Disconfirmation is a required output.

10. **The language model is not the active ingredient.** Generative-AI chatbots did not outperform
    retrieval or rule-based ones, and the generative-AI subgroup effect was not significant on its
    own (8 of 39 trials) [12].
    => The scripted protocol is primary and must work completely with Ollama absent.

### Popular ideas v2 deliberately does not build

- Benefit-finding or "silver lining" prompts: five studies, few significant benefits, and no
  improvement in affect, perceived stress, or benefit-finding itself [11].
- Best Possible Self as a core feature: one study found the neutral writing control improved
  subjective wellbeing more than the intervention did [11].
- Three Good Things, resource diaries, and satisfaction-processes writing: a single study each
  [11].
- Gratitude and Best Possible Self were the most consistent of the seven techniques reviewed, so
  they may ship later as an optional wellbeing module labelled as affect boosters, never as
  symptom treatment. The whole positive-writing base is 51 studies all rated poor or fair, with
  only 7 using intention-to-treat analysis [11].

### Harms to design against

- **Trauma-disclosure prompting without support.** Expressive writing increased illness-related
  doctor visits in a PTSD sample and produced null effects in former psychiatric patients, people
  with negative body image, and people with suicidal tendencies [1]; researchers have cautioned
  explicitly against unsupervised home-based application [11]. v2 never prompts trauma disclosure
  by default.
- **Misreading the post-writing dip.** A short-term negative-affect spike is reliable and coexists
  with eventual benefit [8]. It must never be auto-interpreted as deterioration.
- **Rumination amplification.** Elaborating at length on why something happened, without moving
  anywhere, is the failure mode journaling is most prone to. Reflection has to travel: what
  happened, why it might have happened, what it means, what can be learned, what will be done.
- **Dependency.** The APA flags that users in low-income or care-scarce contexts carry
  higher-than-average dependency risk precisely because the tool becomes their primary support,
  and advises limiting AI memory, reducing anthropomorphic features, and adding break nudges [4].

The dependency guidance appears to conflict with a journal's longitudinal value. v2 resolves it by
locating continuity in the archive rather than in a persona: the product remembers, the assistant
does not. Every assist call is stateless and receives only the slice the user chose to bring to it.

## Evidence status

The claims above were extracted from primary sources by automated research agents and then
audited adversarially against those sources. The audit completed for references [1]-[3], [21],
and [22] before hitting a service limit; 18 of 25 audited claims were confirmed unchanged, and 7
required correction. Every correction was an overreaching interpretation rather than a wrong
figure, with two exceptions: one sample-size pairing and one corrupted quotation, both fixed.

References [4]-[20] carry verbatim supporting quotes from their sources but have not been
independently re-checked. Given that the completed audit found interpretive overreach in roughly
a quarter of claims, treat the design rules as well-sourced direction rather than settled fact,
and re-verify any figure before it appears in user-facing copy or a public claim about the
product.

Two known limits inherited from the sources themselves: the CBT component and homework-compliance
literature is drawn entirely from therapist-delivered, face-to-face trials, so applying it to
unguided software is an extension the evidence does not test; and the iCBT dose figures are the
average protocol studied, not an established minimum effective dose.

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

Ten items in three waves, ordered by dependency. Use the shared PR template and Copilot prompt in
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
  - the repository has a v2 roadmap with no more than ten implementation items
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
- **Success criteria:**
  - crisis resources are correct for the configured locale and reachable from every screen
  - check-in scores are stored, but a score alone never triggers an automated interpretation
  - the app states its limits before a user's first session, not buried in a settings page
  - trauma-writing prompts are unreachable without an explicit opt-in
  - no user text is ever rejected or filtered on the way into the journal
- **Out of scope:**
  - risk scoring or classification of the user's writing
  - contacting anyone on the user's behalf
  - clinical interpretation of check-in scores

### Wave 2 - The reflection engine

The core loop, the challenge layer, and the two specialised session types.

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
    vary rather than repeat
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
  - add a premortem prompt that asks the user to imagine the decision having gone badly and say why
  - resurface decisions on their review date to record the actual outcome against the prediction
  - add a calibration view comparing stated confidence against observed hit rate over time
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
    only an outcome, since imprecise plans confer no advantage over a bare intention [17]
  - prompt a short rehearsal write-through of the cue-to-action link after a plan is saved, rather
    than routing the plan into a pinned reminder card [17]
  - add reminders tied to that plan, with an explanation of why the app is prompting
  - frame all progress around completed sessions and closes, never around mood improving
  - track lapses without penalty, offer a shorter re-entry session after a gap, and offer plan
    revision after repeated failure rather than surfacing an adherence score
  - measure nonusage separately from account retention [18]
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
  earned a privacy warning label [19]
- **Key changes:**
  - meet the published minimum security baseline: encryption in transit and at rest, enforced
    password strength, a documented vulnerability-reporting contact, and a real privacy policy [19]
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

Audited entries were re-checked against the source by an adversarial verification pass; see
"Evidence status" above.

1. Frattaroli (2006), *Experimental Disclosure and Its Moderators: A Meta-Analysis*, Psychological
   Bulletin. https://bpb-us-e2.wpmucdn.com/faculty.sites.uci.edu/dist/c/602/files/2019/08/Frattaroli-psych-bulletin-2006.pdf
2. *What is the evidence for the efficacy of self-help acceptance and commitment therapy?* (audited)
   https://www.sciencedirect.com/science/article/abs/pii/S2212144717300753
3. *Internet-Based Cognitive Behavioral Therapy for Depression: An IPD Network Meta-Analysis*
   (audited). 39 RCTs contributed IPD; 8,107 patients across 36 studies analysed.
   https://eprints.whiterose.ac.uk/id/eprint/168702/1/PSY20_2474R_Merged_PDF.pdf
4. APA Health Advisory (Nov 2025), *Use of Generative AI Chatbots and Wellness Applications for
   Mental Health*. https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-chatbots-wellness-apps
5. DLA Piper (Aug 2025), *A legislative and enforcement outlook for mental health chatbots*.
   https://www.dlapiper.com/en/insights/publications/2025/08/ai-mental-health-chatbots
6. Stanford HAI / Moore et al. (2025), *New study warns of risks in AI mental health tools*.
   https://news.stanford.edu/stories/2025/06/ai-mental-health-care-tools-dangers-risks
7. *Expressive writing vs psychotherapy for PTSD: systematic review and network meta-analysis*.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC9772920/
8. *Chasing elusive expressive writing effects: emotion-acceptance instructions* (N = 833 RCT).
   https://pmc.ncbi.nlm.nih.gov/articles/PMC10300201/
9. *Uptake, Adherence, and Attrition in Clinical Trials of Depression and Anxiety Apps* (79 RCTs),
   JAMA Psychiatry 2025. https://doi.org/10.1001/jamapsychiatry.2025.3439
10. Mohr et al., *Supportive Accountability: A Model for Providing Human Support to eHealth
    Interventions*. https://pmc.ncbi.nlm.nih.gov/articles/PMC3221353/
11. *Positive expressive writing interventions, subjective health and wellbeing* (51 studies).
    https://pmc.ncbi.nlm.nih.gov/articles/PMC12094736/
12. *Systematic review and meta-analysis of chatbots in the management of depressive and anxiety
    symptoms* (39 RCTs). https://www.nature.com/articles/s41746-026-02566-w
13. *Routine Outcome Monitoring and Feedback: Research Review and Recommendations*.
    https://www.tandfonline.com/doi/full/10.1080/10503307.2023.2181114
14. Al-Mosaiwi & Johnstone (2018), *In an Absolute State: Elevated Use of Absolutist Words*.
    https://pmc.ncbi.nlm.nih.gov/articles/PMC6376956/
15. *Employing large language models for emotion detection in psychotherapy transcripts*.
    https://pmc.ncbi.nlm.nih.gov/articles/PMC12098529/
16. *Performance of mental health chatbot agents in detecting and managing suicidal ideation*
    (29 agents), Scientific Reports 2025. https://www.nature.com/articles/s41598-025-17242-4
17. Gollwitzer & Sheeran (2006), *Implementation Intentions and Goal Achievement: A Meta-Analysis
    of Effects and Processes*. d = .65 (95% CI .60-.70) across 94 tests, N = 8,461, measured
    against a goal intention alone rather than against no plan.
    https://kops.uni-konstanz.de/handle/123456789/10973
18. Eysenbach (2005), *The Law of Attrition*, J Med Internet Res 7(1):e11.
    https://www.jmir.org/2005/1/e11/
19. Mozilla Foundation, *Privacy Not Included - Mental Health Apps*.
    https://www.mozillafoundation.org/en/privacynotincluded/categories/mental-health-apps/
20. Sloan, Marx et al. (2018), *Written Exposure Therapy vs Cognitive Processing Therapy*, a
    5-session writing protocol noninferior to 12-session CPT with 6.4% versus 39.7% dropout.
    https://pmc.ncbi.nlm.nih.gov/articles/PMC5843538/
21. Ciharova et al. (2021), *Cognitive restructuring, behavioral activation and cognitive-behavioral
    therapy for adult depression: a network meta-analysis* (audited), J Consult Clin Psychol
    89(6):563-574. https://pubmed.ncbi.nlm.nih.gov/34264703/
22. *A Meta-Analysis of the Effects of Mental Contrasting With Implementation Intentions* (audited).
    https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8149892/

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
