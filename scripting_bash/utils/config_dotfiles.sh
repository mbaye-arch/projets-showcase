#!/bin/bash
echo "Installation environnement dev..." 
#  fonction qui verifie pour empecher la reecriture de toutes les configuration
#1 ajout d'une variable sur le fichier zsrc pour savoir si le setup a deja été effectué ou pas
if grep -q "SETUP_ENV_CONFIGURED=true" ~/.zshrc; then
    echo "L'environnement de développement est déjà configuré. Aucune action nécessaire."
    exit 0
else
echo "Configuration de l'environnement de développement en cours..."
# dossiers utiles
echo "Création des dossiers utiles..."
mkdir -p ~/projects
mkdir -p ~/scripts
mkdir -p ~/tmp
mkdir -p ~/workspace
# ==========================
# CONFIGURATION ZSH
#1.determine le nombre de commande stcoké en memoire
#2.detremiine le nombre de commande sauvegarde sur le disque 
#3.detremine le fichier de l'historique
#4.ajoute acces dossier sans cd
#5.ignorer les commandes dupliquées dans l'historique
#6.partager l'historique entre les différentes sessions
#7.activer la correction automatique des commandes
# ==========================
cat >> ~/.zshrc << 'EOF'
# HISTORIQUE
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history
setopt autocd
setopt hist_ignore_dups
setopt share_history
setopt correct
EOF
echo "Configuration de ZSH terminée."

echo "Configuration des Alias..."
# ==========================
# ALIAS BASE
# ==========================
cat >> ~/.zshrc << 'EOF'
alias cls="clear"
alias ll="ls -lah"
alias la="ls -A"
alias l="ls -CF"
# navigation
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
# sécurité
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"
EOF
echo "Configuration des Alias de base terminée."
echo "Configuration des Alias Systeme..."
# ==========================
# git
# ==========================
cat >> ~/.zshrc << 'EOF'
alias gs="git status"
alias ga="git add"
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline --graph --decorate"
alias gco="git checkout"
alias gb="git branch"
alias gd="git diff"
alias gcl="git clone"
alias gacp="git add . && git commit -m && git push"
EOF
# ==========================
# Systeme
# ==========================
cat >> ~/.zshrc << 'EOF'
alias update="sudo apt update && sudo apt upgrade -y"
alias install="sudo apt install -y"
alias remove="sudo apt remove -y"
alias search="apt search"
alias clean="sudo apt autoremove -y && sudo apt autoclean -y"
alias h="history"
alias c="clear"
alias path="echo $PATH"
alias mem="free -h"
alias cpu="lscpu"
alias disk="df -h"
EOF
echo "Configuration des Alias systemes terminée."
echo "Configuration des Alias de processus..."
# ==========================
# PROCESS
#1.affiche tous les processus en cours d'execution
#2.recherche un processus spécifique
#3.affiche les ports ouverts et les processus associés
#4.affiche l'adresse IP publique
# ==========================
cat >> ~/.zshrc << 'EOF'
alias psa="ps aux"
alias psg="ps aux | grep"
alias ports="ss -tulnp"
alias myip="curl ifconfig.me"
EOF
echo "Configuration des Alias de processus terminée."

echo "Configuration des Alias de fichiers..."
# ==========================
# FICHIERS
#1.Affiche toutes les tailles des dossiers/fichiers dans le dossier courant.
#2.Affiche l'espace disque utilisé et disponible
#3.Affiche la structure des dossiers jusqu'à une profondeur de 2
#4.recherche un fichier ou dossier par son nom
# ==========================
cat >> ~/.zshrc << 'EOF'
alias duh="du -sh *"
alias dfh="df -h"
alias tree="tree -L 2"
# recherche
alias f="find . -name"
EOF
echo "Configuration des Alias de fichiers terminée."
# ==========================
# CONFIG ROLE MICRO
# je n'utilise pas vim ou nano pour l'édition de fichiers, je préfère micro qui est plus simple et plus moderne
#1.definis micro comme editeur par defaut
#2.definis les touches de sauvegarde et de sortie rapide
#3.le pager par défaut pour visualiser du texte page par page. si tu fais man ls, ou git log, le texte passe par le pager.
# ==========================
echo "Configuration des roles de  micro..."
cat >> ~/.zshrc << 'EOF'
export EDITOR=micro
export VISUAL=micro
export PAGER=less
EOF
echo "Configuration des roles de  micro terminée."

# ==========================
# FONCTIONS UTILES
# ==========================
cat >> ~/.zshrc << 'EOF'
# créer dossier + entrer
mkcd () { mkdir -p "$1" && cd "$1" }
# taille dossier
size () { du -sh "${1:-.}" ; }

# chercher texte dans fichiers
srch () {
    grep --color=auto -rnw . -e "$*" --exclude-dir={node_modules,.git}
}
# monitor rapide
sysinfo () {
 echo "------ SYSTEM INFO ------"
 echo ""
 echo "CPU:"
 lscpu | grep "Model name"
 echo ""
 echo "RAM:"
 free -h
 echo ""
 echo "DISK:"
 df -h
}
# ports ouverts
openports () { ss -tulnp; }
# kill processus par nom
killp () { pkill -f "$1" }
# archivage rapide avec zip
zipit () {
  if [ -d "$1" ]; then
    zip -r "$1.zip" "$1" && echo "Archive $1.zip créée avec succès."
  else
    echo "Dossier introuvable"
  fi
}
# dezip rapide
unzipit () {
 if [ -f "$1" ] ; then
  unzip "$1"
 else
  echo "fichier introuvable"
 fi
}    
EOF
echo "Configuration des fonctions utiles terminée."
# ==========================
# CONFIG MICRO
# ==========================
echo "Configuration de micro..."
mkdir -p ~/.config/micro
cat >> ~/.config/micro/settings.json << 'EOF'
{
 "autosave": true,
 "tabsize": 4,
 "softwrap": true,
 "syntax": true,
 "lineNumbers": true,
 "cursorline": true,
 "tabstospaces": true
}
EOF
echo "SETUP_ENV_CONFIGURED=true" >> ~/.zshrc
echo "Configuration de micro terminée."
echo "Configuration des dotfiles terminée."
echo "Rechargement du shell pour appliquer les changements..."
echo "Setup de l'environnement de développement terminé avec succès!"
fi
