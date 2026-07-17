# The Doors to Netherwhere — Project Instructions

## Research Priority

Before answering any technical question, follow this order strictly:

1. **Workspace files first.** Search `js/plugins/` for the relevant plugin `.js` file and read it directly. Prefer concrete findings from source over assumptions.
2. **Web search second.** If a plugin is obfuscated (e.g. VisuStella), check its readme/header comments first, then look it up online. VisuStella plugin docs follow this URL pattern:
   `https://www.yanfly.moe/wiki/[Plugin_Name]_VisuStella_MZ`
   Example: `https://www.yanfly.moe/wiki/Events_and_Movement_Core_VisuStella_MZ`
3. **General knowledge last.** Only apply if concrete answers aren't available from steps 1–2. Label it explicitly as general knowledge when doing so.

## Project Context

- Engine: RPG Maker MZ
- Platform target: Steam (PC)
- Studio: Overhill Games
- Plugins live in: `js/plugins/`

## File Access — Use Direct Tools, Not the Shell

**Erroneous practice (do not repeat):** Reading or editing this project's files through the shell/bash tool. The shell operates on a separate mount that can lag or serve stale/truncated reads of this project's files, distinct from the real, live files. This previously caused a false "corrupted JSON" diagnosis (truncated/null-padded map files that were actually fine) and at least one file rename + JSON edit that appeared to succeed in the shell but never applied to the real project files at all.

**Correct practice:**
- Use the direct file tools (Read / Edit / Write / Grep) for all reads and edits of this project's files — `.json` data files, `js/plugins/*.js`, etc. These reliably reflect the true, current, live state of the project.
- After any edit, re-read the file with the direct tool (not the shell) before reporting it as done.
- Reserve the shell for work that doesn't depend on this project's live file state (e.g., calculations on data already pulled in via Read/Grep).
- Binary files (images, etc.) can't be rewritten/renamed through the direct tools — for those, ask the user to do the rename/move themselves (e.g. in Explorer or RPG Maker's resource manager), then verify the result with a direct Read afterward rather than assuming it worked.
- If file contents reported back don't match what the user sees in their own editor, treat that as a sign of desync — re-check via the direct tool rather than trusting the shell's view.
