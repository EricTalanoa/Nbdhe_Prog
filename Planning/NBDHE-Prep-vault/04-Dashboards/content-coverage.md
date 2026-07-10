# Content Coverage Dashboard

Live views over the question notes in `02-Content/`. Requires the **Dataview** plugin.
(These read frontmatter written by the Templater question template.)

> The authoritative quality gate is `npm run content:check` (run from the repo root): it validates
> every note's structure — exactly one correct option, 3–5 options, a rationale for the key and each
> distractor — and confirms the `area`/`domain`/`subdomain` tags resolve against the seeded
> taxonomy. The Dataview tables below are a convenience view; `content:check` is what blocks a bad
> import. As of 2026-07-10 there are 33 notes, all `review`, covering all 13 score areas.

## Counts by area
```dataview
TABLE length(rows) AS "Questions"
FROM "02-Content"
WHERE type = "question"
GROUP BY area
SORT length(rows) DESC
```

## Counts by domain / subdomain
```dataview
TABLE length(rows) AS "Questions"
FROM "02-Content"
WHERE type = "question"
GROUP BY area + " › " + domain + " › " + subdomain
SORT length(rows) DESC
```

## Authoring status breakdown
```dataview
TABLE length(rows) AS "Count"
FROM "02-Content"
WHERE type = "question"
GROUP BY status
```

## Draft / review queue (needs work before going live)
```dataview
TABLE status, area, domain, difficulty, format
FROM "02-Content"
WHERE type = "question" AND status != "live"
SORT status ASC, area ASC
```

## Thin coverage — areas with fewer than 5 live questions
```dataview
TABLE length(rows) AS "Live"
FROM "02-Content"
WHERE type = "question" AND status = "live"
GROUP BY area
WHERE length(rows) < 5
SORT length(rows) ASC
```

## Missing rationale (quality gate)
```dataview
TABLE area, domain
FROM "02-Content"
WHERE type = "question" AND (rationale = null OR rationale = "")
```

## Local Anesthesia depth (the priority niche)
```dataview
TABLE status, difficulty, format
FROM "02-Content"
WHERE type = "question" AND contains(subdomain, "Local Anesthesia")
SORT status ASC
```
