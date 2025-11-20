# Guide Windows

## 1) Pré-requis

- Node.js 20+
- MySQL 8+
- PowerShell

Créer la base MySQL:

```sql
CREATE DATABASE stc_gets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2) Autoriser les scripts PowerShell (session courante)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 3) Configuration `.env`

```powershell
.\scripts\windows\configure-env.ps1 -DbUser stc_user -DbPassword change_me_locally -DbHost 127.0.0.1 -DbName stc_gets
```

## 4) Setup complet + DB

```powershell
.\scripts\windows\setup.ps1 -WithDatabase
```

## 5) Démarrage développement

```powershell
.\scripts\windows\start-dev.ps1
```

Le script ouvre 2 terminaux (backend + frontend).

## 6) Déploiement local production

```powershell
.\scripts\windows\deploy-prod.ps1
```

## Option CMD

```cmd
scripts\windows\setup.cmd
scripts\windows\start-dev.cmd
scripts\windows\deploy-prod.cmd
```
