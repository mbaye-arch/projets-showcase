#!/bin/bash
# Installation d'Oh My Zsh et configuration des plugins
echo "Demarrage de la configuration de oh-my-zsh..."

# Vérifier que curl et git sont disponibles
if ! command -v curl > /dev/null 2>&1; then
    echo "Erreur : curl n'est pas installé" >&2
    exit 1
fi

if ! command -v git > /dev/null 2>&1; then
    echo "Erreur : git n'est pas installé" >&2
    exit 1
fi

# Vérifier si oh-my-zsh est déjà installé
if [ -d "$HOME/.oh-my-zsh" ]; then
    echo "oh-my-zsh est deja installe."
else
    echo "Installation de oh-my-zsh..."
    # Utiliser RUNZSH=no pour éviter de changer le shell immédiatement
    # Utiliser KEEP_ZSHRC=yes pour ne pas écraser .zshrc
    export RUNZSH=no
    export KEEP_ZSHRC=yes
    if timeout 60 bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" > /dev/null 2>&1; then
        echo "Installation d'oh-my-zsh terminée."
    else
        echo "Attention : Installation d'oh-my-zsh incomplète ou timeout" >&2
    fi
fi

echo "Installation des plugins..."

# Installer zsh-autosuggestions
if [ -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" ]; then
    echo "Le plugin zsh-autosuggestions est deja installe."
else
    echo "Installation de zsh-autosuggestions..."
    if git clone https://github.com/zsh-users/zsh-autosuggestions.git \
        "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" > /dev/null 2>&1; then
        echo "Plugin zsh-autosuggestions installe avec succes !"
    else
        echo "Erreur lors de l'installation de zsh-autosuggestions" >&2
    fi
fi

# Installer zsh-syntax-highlighting
if [ -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting" ]; then
    echo "Le plugin zsh-syntax-highlighting est deja installe."
else
    echo "Installation de zsh-syntax-highlighting..."
    if git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
        "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting" > /dev/null 2>&1; then
        echo "Plugin zsh-syntax-highlighting installe avec succes !"
    else
        echo "Erreur lors de l'installation de zsh-syntax-highlighting" >&2
    fi
fi

# Vérifier que .zshrc existe
if [ ! -f "$HOME/.zshrc" ]; then
    echo "Erreur : .zshrc introuvable" >&2
    exit 1
fi

echo "Configuration des plugins dans .zshrc..."

# Modifier la ligne plugins dans .zshrc si ce n'est pas déjà fait
if grep -q "plugins=(git sudo zsh-autosuggestions zsh-syntax-highlighting)" "$HOME/.zshrc"; then
    echo "Les plugins sont deja configures dans .zshrc."
else
    # Remplacer la ligne plugins existante
    sed -i 's/plugins=(.*)/plugins=(git sudo zsh-autosuggestions zsh-syntax-highlighting)/' "$HOME/.zshrc"
    if [ $? -eq 0 ]; then
        echo "Plugins configurés dans .zshrc."
    else
        echo "Attention : Configuration des plugins échouée" >&2
    fi
fi

echo "Configuration d'oh-my-zsh terminée."
