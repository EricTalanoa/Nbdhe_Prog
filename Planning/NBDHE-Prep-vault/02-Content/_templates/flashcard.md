---
type: flashcard
id: fc-<% await tp.system.prompt("Short id (e.g. anes-0001)") %>
created: <% tp.date.now("YYYY-MM-DD") %>
status: draft
area: "<% tp.system.prompt("Score area (exact blueprint string)") %>"
domain: "<% tp.system.prompt("Domain (exact)") %>"
subdomain: "<% tp.system.prompt("Subdomain (exact, or blank)") %>"
reference: "<% tp.system.prompt("Reference (text + topic/edition)") %>"
---

# Front
<!-- The prompt/term. Keep it short — this is quick recall, not a full MCQ. -->


# Back
<!-- The concept/answer. One or two tight sentences. Original, written from published references. -->

<!-- Rule 0: original card written to the blueprint from published references. Never a real
     or remembered NBDHE item. -->
