# n8n Visual Language — Key Observations

## Node Cards
- Rounded-rect cards with clear border (light gray border on dark bg)
- Square aspect ratio for icon nodes (~80x80px feel), rectangular for labeled nodes
- Each node has a colored icon in the center (brand colors of the integration)
- Node name label BELOW the card (not inside)
- Sub-label below name in smaller gray text (e.g., "invite: channel", "getAll: user")
- Trigger nodes have a small lightning bolt icon to the left (coral/orange)
- Connection ports: small circles on left (input) and right (output) edges

## Connections
- Clean curved bezier lines between ports
- Solid white/gray lines for main connections
- Dashed lines for sub-connections (tools, memory, model)
- Arrow indicator at the receiving end
- Lines are thin (~2px) and clean

## Dark Theme Colors
- Background: very dark gray (#1a1a1a to #2a2a2a)
- Node card bg: slightly lighter dark (#2d2d2d to #3a3a3a)
- Node border: subtle gray (#4a4a4a)
- Text: white for names, gray for sub-labels
- Connections: white/light gray
- Trigger indicator: coral/orange lightning bolt
- Execution highlight: green glow around active nodes

## Layout
- Left-to-right flow
- Clear spacing between nodes
- Branching (true/false) goes up/down from a decision node
- Clean, minimal, professional

## For IAC Hero
- Use a simplified 5-node workflow: Webhook Trigger → Transform Data → API Call → Database Write → Send Notification
- Make it construction/ops themed: "New Job Submitted" → "Validate & Route" → "Update CRM" → "Log to Database" → "Notify Team"
- Tilt the whole plane ~25-30° in 3D for dramatic perspective
- Add execution cascade animation (green highlight flowing left to right)
- Frosted glass material on cards for premium feel
