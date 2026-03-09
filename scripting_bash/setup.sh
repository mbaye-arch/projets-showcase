#!/bin/bash
set -euo pipefail

read -r -p "Ce script modifie le systeme (apt, zsh, git, dotfiles). Continuer ? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Installation annulee."
  exit 0
fi

# Vérifier si l'utilisateur est root
if [ "$EUID" -ne 0 ]; then
  echo "Ce script doit être exécuté avec sudo. Relance en cours..." 
  exec sudo "$0" "$@"
fi
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        echo "Connexion Internet détectée. Démarrage du setup..."
else
    echo "Pas de connexion Internet"
    exit 1
fi
SCRIPTS="utils"
mkdir -p log
echo "==================================Setup_ENV================================"
echo "Ce script est conçu pour permettre une automatisation complete du setup"
echo "de votre systéme sous linux que sa soit Debian ou Ubuntu"
echo "==================================Setup_ENV================================"
echo "Demarrage du Setup......"
# Mise a jour du systeme et des paquets
./$SCRIPTS/update.sh | tee -a log/setup.log
# Installation des outils necessaires pour le setup_env
./$SCRIPTS/install_tools.sh | tee -a log/setup.log
# configuration de git 
./$SCRIPTS/config_git.sh | tee -a log/setup.log
#setup de zsh et ohmyzsh
./$SCRIPTS/setup_ohmyzsh.sh | tee -a log/setup.log
#customisation du prompt git pour afficher les infos de branche et de statut
./$SCRIPTS/customize_git_prompt.sh | tee -a log/setup.log
# generation des dotfiles et configuration de l'environnement de dev
./$SCRIPTS/config_dotfiles.sh | tee -a log/setup.log
# veifification de la configuration de l'environnement de dev
./$SCRIPTS/test_configuration.sh | tee -a log/setup.log
# changement du shell par defaut pour zsh sur l'utilisateur initial si disponible
TARGET_USER="${SUDO_USER:-$USER}"
chsh -s "$(which zsh)" "$TARGET_USER"
echo "==================================Setup_ENV====================================="
echo "Vous pouvez maintenant profiter de votre environnement de développement "
echo "Tout ce que vous avez à faire est de redémarrer votre terminal pour que les"
echo "changements prennent effet."
echo "==================================Setup_ENV==================================="
