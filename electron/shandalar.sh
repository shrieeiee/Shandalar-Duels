#!/bin/bash
# SteamOS / Steam Deck launcher: add to Steam as a Non-Steam Game.
cd "$(dirname "$(readlink -f "$0")")"
exec ./"Shandalar Duels" --no-sandbox --fullscreen "$@"
