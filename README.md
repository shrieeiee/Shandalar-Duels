# Shandalar Duels

Classic-rules Magic duels with a Shandalar-style adventure mode, deck builder, procedural 2D art and friend duels. One self-contained HTML file runs everywhere.

- `web/index.html` – the whole game (open in any browser)
- `electron/` – Windows + Linux / SteamOS / Steam Deck wrapper
- `android/` – Android WebView wrapper
- `.github/workflows/build.yml` – builds the Windows, SteamOS and Android packages (Actions → *Build all platforms* → artifacts; also attaches zips to releases)

Steam Deck: unzip the Linux build, add `shandalar.sh` as a Non-Steam Game, use the Keyboard (WASD) + Mouse Steam Input template.
Friend duels: one-code rooms only work on the claude.ai-hosted version; elsewhere use *Manual codes*.
