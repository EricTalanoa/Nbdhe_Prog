---
type: case
id: case-<% await tp.system.prompt("Short id (e.g. perio-0001)") %>
created: <% tp.date.now("YYYY-MM-DD") %>
status: draft
title: "<% await tp.system.prompt("Case title") %>"
patient_type: <% tp.system.suggester(["adult","pediatric","geriatric","special_needs","medically_compromised"], ["adult","pediatric","geriatric","special_needs","medically_compromised"]) %>
reference: "<% tp.system.prompt("Reference (text + topic/edition)") %>"
---

# Demographics
<!-- Age, sex, relevant medical history flags. Invent the patient — never a real case. -->


# Chief Complaint
<!-- In the patient's own words where natural. -->


# Background / History
<!-- Dental/medical history relevant to the case. -->


# Current Findings
<!-- Clinical/radiographic findings that the linked items will draw on. -->


# Notes
<!-- Optional: authoring notes, media plan, etc. -->


---
<!-- Rule 0: original case, invented patient, written to the blueprint from published
     references. Never a real/remembered NBDHE case. -->
