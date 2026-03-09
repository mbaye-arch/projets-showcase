#!/bin/bash
set -euo pipefail

echo "Setup-ENV demo mode"
echo "==================="
echo "Ce mode ne modifie pas le systeme."
echo ""

echo "Scripts detectes:"
find utils -maxdepth 1 -type f -name "*.sh" | sort
echo ""

echo "Verification syntaxique:"
for script in setup.sh utils/*.sh; do
  bash -n "$script"
  echo "OK - $script"
done
echo ""

echo "Fonctionnalites couvertes:"
echo "- update systeme Debian/Ubuntu"
echo "- installation outils CLI"
echo "- configuration Git et SSH"
echo "- configuration Zsh / Oh My Zsh"
echo "- alias, fonctions et dotfiles"
echo "- tests de verification"
