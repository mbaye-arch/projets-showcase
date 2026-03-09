#!/bin/bash
echo "Test configuration de l'environnement de développement..."
# verification de zsh
if command -v zsh ; then
    echo "Test Zsh : OK"
else
    echo "Test Zsh : ÉCHEC"
fi
# verification de Oh-My-Zsh
if [ -d "$HOME/.oh-my-zsh" ]; then
    echo "Test Oh-My-Zsh : OK"
else
    echo "Test Oh-My-Zsh : ÉCHEC"
fi
# verification de la configuration du prompt git
if command -v git ; then
    echo "Test Git : OK"
else
    echo "Test Git : ÉCHEC"
fi
# verification de micro
if command -v micro ; then
    echo "Test Micro : OK"
else
    echo "Test Micro : ÉCHEC"
fi
# verification de la configuration des dotfiles
if grep -q "SETUP_ENV_CONFIGURED=true" ~/.zshrc; then
    echo "Test Dotfiles : OK"
else
    echo "Test Dotfiles : ÉCHEC"
fi
# verfication de wget
if command -v wget ; then
    echo "Test Wget : OK"
else
    echo "Test Wget : ÉCHEC"
fi
#verification de htop
if command -v htop ; then
    echo "Test Htop : OK"
else
    echo "Test Htop : ÉCHEC"
fi
#verification de curl
if command -v curl ; then
    echo "Test Curl : OK"
else
    echo "Test Curl : ÉCHEC"
fi
#verification de zip et unzip
if command -v zip && command -v unzip ; then
    echo "Test Zip/Unzip : OK"
else
    echo "Test Zip/Unzip : ÉCHEC"
fi
#verification de ohmyzsh
if [ -d "$HOME/.oh-my-zsh" ]; then
    echo "Test Oh My Zsh : OK"
else
    echo "Test Oh My Zsh : ÉCHEC"
fi
echo "Fin des tests."
