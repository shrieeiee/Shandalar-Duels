# Shandalar Duels

Classic-rules Magic duels with a Shandalar-style adventure mode, deck builder, procedural 2D art and friend duels. One self-contained HTML file runs everywhere.

- `web/index.html` – the whole game (open in any browser)
- `electron/` – Windows + Linux / SteamOS / Steam Deck wrapper
- `android/` – Android WebView wrapper
- `.github/workflows/build.yml` – builds the Windows, SteamOS and Android packages (Actions → *Build all platforms* → artifacts; also attaches zips to releases)

Steam Deck: unzip the Linux build, add `shandalar.sh` as a Non-Steam Game, use the Keyboard (WASD) + Mouse Steam Input template.
Friend duels: one-code rooms only work on the claude.ai-hosted version; elsewhere use *Manual codes*.

## Card art (desktop builds)

The game has its own built-in artwork. In the Windows/Linux/SteamOS builds, open **Adventure → Menu → Card art** (or the *Card art* tab) and press **Download** to fetch real card pictures from Scryfall into the game's data folder. They are for your own use and are never bundled or committed. Cards without a picture keep the built-in art. The web and Android builds use the built-in art only.

## Licence and disclaimer

The code is released under the **GNU General Public License v3.0** (see `LICENSE`). Copyright (C) 2026 shrieeiee.

This is an unofficial, non-commercial fan project, not affiliated with or endorsed by Wizards of the Coast or MicroProse. *Magic: The Gathering*, its card names and rules text are the property of Wizards of the Coast. The card artwork in the game is procedurally generated and original. The GPL covers the code only, not any Wizards of the Coast intellectual property.
