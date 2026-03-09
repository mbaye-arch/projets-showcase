#!/bin/bash
set -euo pipefail

# Configuration de git
#variable pour la configuration de git $USER_NAME et $USER_EMAIL
echo "Configuration de git..."
# generation d'une clé SSH et ajout à l'agent avec ssh-keygen et ssh-add
# ne pas refaire la clé SSH si elle existe déjà
if [ -f ~/.ssh/id_ed25519 ]; then
    echo "git dejà configuré, clé SSH existante trouvée. Configuration de git terminée avec succès !"
else
read -r -p "Entrez votre nom d'utilisateur git: " USER_NAME
read -r -p "Entrez votre adresse e-mail git: " USER_EMAIL
# commande pour configurer git
while [[ -z "$USER_NAME" || -z "$USER_EMAIL" ]]; do
    echo "Le nom d'utilisateur et l'adresse e-mail ne peuvent pas être vides. Veuillez réessayer."
    read -r -p "Entrez votre nom d'utilisateur git: " USER_NAME
    read -r -p "Entrez votre adresse e-mail git: " USER_EMAIL
done
echo "Configuration de git avec le nom d'utilisateur: $USER_NAME et l'adresse e-mail: $USER_EMAIL en cours..."
git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"
echo "Generation d'une clé SSH et ajoute à l'agent."
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -q
fi
echo "Voici votre clé SSH publique :"
cat ~/.ssh/id_ed25519.pub
echo "Copiez cette clé et ajoutez-la à votre compte GIT pour une authentification sans mot de passe."    
echo "Configuration de git terminée avec succès !"
