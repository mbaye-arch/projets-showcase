# 🎨 Assets Nivah - Guide d'utilisation

## 📁 Fichiers disponibles

### 1. **logo.svg** (200x200)
Logo complet avec texte "NIVAH"
- Utilisation: Site web, emails, documents
- Format: SVG (redimensionnable sans perte)

### 2. **logo-icon.svg** (100x100)
Icône seule sans texte
- Utilisation: App icon, favicon, réseaux sociaux
- Format: SVG

### 3. **splash-screen.svg** (1080x1920)
Écran de démarrage complet
- Utilisation: Splash screen app mobile
- Format: SVG (adapter selon besoin)

## 🎨 Couleurs du logo

```
Rose vif:    #FF1B6B
Violet:      #8B5CF6
Orange:      #FF6B35
Blanc:       #FFFFFF
```

### Dégradé principal
```css
background: linear-gradient(135deg, #FF1B6B 0%, #8B5CF6 50%, #FF6B35 100%);
```

## 📱 Conversion en PNG (si nécessaire)

### Méthode 1: En ligne (gratuit)
1. Aller sur https://svgtopng.com/
2. Uploader le fichier SVG
3. Télécharger en PNG aux tailles suivantes:
   - **App Icon iOS**: 1024x1024
   - **App Icon Android**: 512x512
   - **Logo web**: 512x512
   - **Favicon**: 32x32, 64x64

### Méthode 2: Inkscape (logiciel gratuit)
```bash
# Installer Inkscape
sudo apt install inkscape  # Linux
brew install inkscape      # Mac

# Convertir SVG -> PNG
inkscape logo.svg --export-filename=logo-1024.png --export-width=1024
```

### Méthode 3: ImageMagick
```bash
# Installer ImageMagick
sudo apt install imagemagick

# Convertir
convert -background none logo.svg -resize 1024x1024 logo-1024.png
```

## 📱 Intégration React Native

### 1. Copier les logos dans le projet

```bash
# iOS - Générer toutes les tailles d'icônes requises
# Aller sur: https://appicon.co/
# Uploader logo-icon.svg converti en PNG 1024x1024
# Télécharger et remplacer ios/Nivah/Images.xcassets/AppIcon.appiconset/

# Android - Générer les icônes adaptatives
# Aller sur: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
# Uploader logo-icon.svg
# Télécharger et extraire dans android/app/src/main/res/
```

### 2. Splash Screen

**iOS (ios/Nivah/LaunchScreen.storyboard):**
```xml
<!-- Ajouter l'image du splash screen -->
<imageView>
  <image name="splash-screen"/>
</imageView>
```

**Android (android/app/src/main/res/drawable/splash_screen.xml):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splash_background"/>
  <item>
    <bitmap
      android:gravity="center"
      android:src="@drawable/splash_logo"/>
  </item>
</layer-list>
```

### 3. Utiliser le logo dans l'app

```tsx
// src/assets/Logo.tsx
import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const Logo = ({ size = 100 }) => (
  <Image 
    source={require('../assets/logo-icon.png')} 
    style={[styles.logo, { width: size, height: size }]}
  />
);

const styles = StyleSheet.create({
  logo: {
    resizeMode: 'contain',
  },
});
```

## 🌐 Intégration Web

### HTML
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/logo-icon.svg">

<!-- Logo dans la page -->
<img src="/logo.svg" alt="Nivah Logo" width="200">
```

### React
```jsx
import logo from './assets/logo.svg';

function Header() {
  return <img src={logo} alt="Nivah" width="150" />;
}
```

## 📤 Upload sur le serveur

```bash
# Via FTP vers example.invalid
# Uploader dans: /htdocs/assets/

# Structure finale:
/htdocs/
├── assets/
│   ├── logo.svg
│   ├── logo-icon.svg
│   ├── logo.png (diverses tailles)
│   └── favicon.ico
└── api/
```

## 🎯 Tailles recommandées

### App Mobile
- **iOS App Icon**: 1024x1024 (PNG)
- **Android App Icon**: 512x512 (PNG)
- **Splash Screen**: 1080x1920 (PNG/SVG)

### Web
- **Logo principal**: 512x512
- **Logo header**: 200x200
- **Favicon**: 32x32, 64x64

### Réseaux sociaux
- **Facebook**: 1200x630
- **Twitter**: 1024x512
- **Instagram**: 1080x1080

## 🔧 Outils utiles

1. **SVGOMG** - Optimiser SVG: https://jakearchibald.github.io/svgomg/
2. **App Icon Generator**: https://appicon.co/
3. **Favicon Generator**: https://realfavicongenerator.net/
4. **Remove.bg** - Supprimer fond: https://remove.bg/

## 📝 Checklist d'intégration

- [ ] Convertir SVG en PNG (1024x1024)
- [ ] Générer toutes les tailles d'icônes iOS
- [ ] Générer toutes les tailles d'icônes Android
- [ ] Créer favicon.ico pour le web
- [ ] Intégrer splash screen iOS
- [ ] Intégrer splash screen Android
- [ ] Uploader logo.svg sur example.invalid
- [ ] Tester affichage sur différents appareils
- [ ] Mettre à jour package.json avec le logo
- [ ] Configurer PayDunya avec le logo

---

**🎉 Votre branding Nivah est prêt!**
