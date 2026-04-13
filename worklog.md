---
Task ID: 1
Agent: Main
Task: Copy toornament.com layout concept for brackets, leaderboard, and participants

Work Log:
- Studied toornament.com layout via browser automation and web reader
- Read current dashboard.tsx (793 lines), tournament-view.tsx (408 lines), useDivisionTheme hook
- Redesigned dashboard.tsx with toornament-style layout:
  - New SectionCard component with full-width header and bottom border (toornament pattern)
  - New MatchRow component with team1/team2 rows, score boxes, status indicators
  - New BracketMatch component for bracket tree with connector lines
  - New ParticipantRow component for clean participant list
  - Standings tab: Added Players/Clubs sub-tabs (toornament-style toggle), Show More/Less buttons
  - Matches tab: Added horizontal scrolling bracket view with round columns (QF/SF/Final)
  - Participants tab: Added search bar, list/grid view toggle, filtered search
- Redesigned tournament-view.tsx with:
  - Toornament-style section headers (full width, bordered bottom, uppercase tracking)
  - Horizontal bracket layout with progressive spacing between rounds
  - Connector lines between rounds
  - Winner indicator and score display
  - Inline scoring buttons within bracket cards
  - Compact player/team lists
- Added CSS for bracket connector lines and toornament-style hover effects
- All color scheme preserved: dt.casinoCard, dt.casinoBar, dt.neonText, dt.casinoBadge etc unchanged
- Lint passes clean, dev server compiles successfully

Stage Summary:
- Toornament-style layout applied to: bracket (horizontal scrolling tree with round columns), leaderboard (sub-tabs + show more/less), participants (search + list/grid toggle)
- All color scheme completely preserved - only layout/structure changed
- Both dashboard.tsx and tournament-view.tsx updated
