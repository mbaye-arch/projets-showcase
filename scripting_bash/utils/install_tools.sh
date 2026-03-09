#!/bin/bash
echo "Installation de curl, git, wget, zip, unzip, zsh, micro, htop, tree..."
echo "Installation en cours..."
apt-get install -y curl git wget zip unzip zsh micro htop tree > /dev/null 2>&1
if [ $? -eq 0 ];  then 
    echo "Installation des outils terminés avec succès"
    echo "outils installés : curl, git, wget, zip, unzip, zsh, micro, htop, tree"
else
    echo "probleme d'installation des outils"
fi
