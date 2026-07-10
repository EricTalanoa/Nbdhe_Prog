---
type: question
id: q-<% await tp.system.prompt("Short id (e.g. anat-0001)") %>
created: <% tp.date.now("YYYY-MM-DD") %>
status: draft
format: <% tp.system.suggester(["completion","question","negative"], ["completion","question","negative"]) %>
difficulty: <% tp.system.suggester(["easy","medium","hard"], ["easy","medium","hard"]) %>
area: "<% tp.system.prompt("Area (exact string from blueprint-mapping.md)") %>"
domain: "<% tp.system.prompt("Domain") %>"
subdomain: "<% tp.system.prompt("Subdomain") %>"
reference: "<% tp.system.prompt("Reference (text + topic/edition)") %>"
case: ""       # slug of parent case, if this is a case-linked item
testlet: ""    # slug of parent testlet, if community-health testlet item
---

# Stem
<!-- For 'negative' format, capitalize EXCEPT / NOT in the stem. One concept per item. -->


# Options
<!-- 3–5 options, exactly one correct. Mark the key with (correct). -->
- A) 
- B) 
- C) 
- D) 

# Correct answer
<!-- e.g. B -->


# Rationale
<!-- Why the key is correct. -->

**Why the distractors are wrong**
- A) 
- C) 
- D) 

---
<!-- Rule 0: original item, written to the blueprint from published references.
     Never a real/remembered NBDHE question. -->
