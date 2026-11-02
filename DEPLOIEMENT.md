# RiskAcadémie : mise en ligne

Ce dossier contient deux éléments à déposer dans le dépôt `ldenarbonne/ldenarbonne.github.io` :

| Élément | Contenu | Adresse finale |
|---|---|---|
| Plateforme de cours | `index.html`, `config.js`, `content.js`, `content2.js`, `app.js` | https://ldenarbonne.github.io/riskacademie/ |
| Laboratoire Python | dossier `laboratoire/` (Streamlit) | https://riskacademie-lab.streamlit.app (adresse à choisir) |

---

## Étape 1 : publier la plateforme sur GitHub Pages

1. Ouvre https://github.com/ldenarbonne/ldenarbonne.github.io
2. Clique sur **Add file → Upload files**.
3. Glisse-dépose le dossier **`riskacademie`** entier (celui qui contient ce fichier). GitHub conserve l'arborescence.
4. Message de commit : `Ajout de RiskAcadémie`, puis **Commit changes**.
5. Après une à deux minutes, la plateforme est en ligne à l'adresse https://ldenarbonne.github.io/riskacademie/

En ligne de commande, l'équivalent est :

```bash
git clone https://github.com/ldenarbonne/ldenarbonne.github.io.git
cp -r riskacademie ldenarbonne.github.io/
cd ldenarbonne.github.io
git add riskacademie
git commit -m "Ajout de RiskAcadémie"
git push
```

Pense à ajouter un lien vers `/riskacademie/` depuis la page d'accueil de ton site.

## Étape 2 : déployer le laboratoire sur Streamlit Community Cloud

1. Va sur https://share.streamlit.io et connecte-toi **avec ton compte GitHub**.
2. Clique sur **Create app → Deploy a public app from GitHub**.
3. Renseigne :
   - **Repository** : `ldenarbonne/ldenarbonne.github.io`
   - **Branch** : `main` (ou `master`, selon ton dépôt)
   - **Main file path** : `riskacademie/laboratoire/streamlit_app.py`
   - **App URL** : `riskacademie-lab` (soit `riskacademie-lab.streamlit.app`)
4. Dans **Advanced settings**, choisis **Python 3.12**.
5. Clique sur **Deploy**. Le premier déploiement prend quelques minutes (installation des bibliothèques de `requirements.txt`).

Si l'adresse `riskacademie-lab` est déjà prise, choisis-en une autre et reporte-la dans `config.js` (champ `labUrl`), puis publie à nouveau ce fichier.

À savoir : une application Streamlit gratuite se met en veille après une période sans visite. Le premier visiteur voit alors un bouton pour la réveiller, ce qui prend environ une minute. Ouvre le laboratoire quelques minutes avant une session en direct.

## Étape 3 : l'espace formateur

- Accès : https://ldenarbonne.github.io/riskacademie/#formateur
- Le code formateur t'a été communiqué séparément. Seule son empreinte (SHA-256) figure dans `config.js`.
- Pour changer de code : `echo -n "NouveauCode" | sha256sum` (macOS : `echo -n "NouveauCode" | shasum -a 256`), puis remplace `trainerHash` dans `config.js`.
- Ce code évite qu'un apprenant arrive par hasard dans l'espace formateur. Ce n'est pas une protection forte : le contenu pédagogique est de toute façon public. Les résultats des apprenants, eux, ne sont stockés que dans **ton** navigateur.

## Fonctionnement pour les apprenants

1. Tu leur envoies le lien https://ldenarbonne.github.io/riskacademie/ : aucun compte n'est nécessaire.
2. Leur progression est enregistrée dans leur navigateur.
3. Depuis **Ma progression**, ils génèrent un code et te l'envoient (e-mail, LinkedIn, WhatsApp).
4. Tu colles ce code dans **Espace formateur → Tableau de bord → Importer**. Utilise toujours le même navigateur pour conserver ton tableau de bord.

## Mettre à jour le contenu

- Les leçons et quiz des modules 1 à 4 sont dans `content.js`, ceux des modules 5 à 7 dans `content2.js`.
- Les calculs du laboratoire sont dans `laboratoire/risklab/calculs.py`. Les tests se lancent avec `python -m pytest laboratoire/tests` depuis le dossier `riskacademie`.
- Chaque `git push` met à jour la plateforme et le laboratoire automatiquement.
