#!/bin/bash
ZSHRC="$HOME/.zshrc"
THEME="agnoster"
POWERLINE_REPO="https://github.com/powerline/fonts.git"
POWERLINE_DIR="/tmp/powerline-fonts"

# Vérifie que .zshrc existe
if [ ! -f "$ZSHRC" ]; then
    echo "Erreur : $ZSHRC introuvable"
    exit 1
fi

echo "Configuration du thème Git Prompt Agnoster..."

# Essayer d'installer les polices Powerline pour Agnoster
if [ -d "$POWERLINE_DIR" ]; then
    rm -rf "$POWERLINE_DIR"
fi

if timeout 30 git clone --depth=1 "$POWERLINE_REPO" "$POWERLINE_DIR" > /dev/null 2>&1; then
    if command -v fc-cache > /dev/null 2>&1; then
        mkdir -p ~/.fonts
        cp "$POWERLINE_DIR/fonts"/* ~/.fonts/ 2>/dev/null || true
        if fc-cache -fv ~/.fonts > /dev/null 2>&1; then
            echo "Polices Powerline installées avec succès."
        fi
    else
        echo "fc-cache non disponible, polices copiées mais pas compilées."
    fi
    rm -rf "$POWERLINE_DIR"
else
    echo "Note : Polices Powerline non disponibles. Utilisez une police Nerd Fonts dans votre terminal."
fi

# Configurer le thème Agnoster dans .zshrc
if grep -q "^ZSH_THEME=" "$ZSHRC"; then
    echo "Modification du thème existant vers $THEME"
    sed -i "s/^ZSH_THEME=.*/ZSH_THEME=\"$THEME\"/" "$ZSHRC"
else
    echo "Ajout de la variable ZSH_THEME avec $THEME"
    echo "ZSH_THEME=\"$THEME\"" >> "$ZSHRC"
fi

echo "Configuration du thème terminée."
echo "Pour un meilleur rendu, utilisez une police Nerd Fonts dans votre terminal (Fira Code, Hack, etc.)"