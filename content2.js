/* Modules complémentaires — RiskAcadémie */
window.MODULES.push(
{
  id: "oprisk",
  num: 5,
  titre: "Risque opérationnel",
  accroche: "Identifier, mesurer et maîtriser les pertes liées aux processus, aux personnes, aux systèmes et aux événements externes, jusqu'à la résilience numérique (DORA).",
  couleur: "#8a4b67",
  calcs: ["opr"],
  lecons: [
  {
    id: "m5-l1",
    titre: "Définition, taxonomie et dispositif de gestion",
    duree: 25,
    objectifs: ["Définir le risque opérationnel et ses frontières", "Connaître la taxonomie bâloise des événements de perte", "Décrire les outils du dispositif : collecte des pertes, RCSA, KRI, scénarios"],
    sections: [
      { h: "Définition", html: `
        <p>Le Comité de Bâle définit le risque opérationnel comme le <strong>risque de pertes résultant de processus internes, de personnes ou de systèmes inadéquats ou défaillants, ou d'événements extérieurs</strong>. Cette définition inclut le risque juridique, mais exclut le risque stratégique et le risque de réputation.</p>
        <p>Contrairement aux risques de crédit ou de marché, le risque opérationnel n'est pas pris volontairement en échange d'une rémunération : il est inhérent à toute activité. Ses pertes sont caractérisées par une distribution très asymétrique, avec de nombreux petits incidents et quelques événements extrêmes (fraudes de trader, amendes pour blanchiment, pannes informatiques majeures).</p>` },
      { h: "La taxonomie bâloise (niveau 1)", html: `
        <table class="t"><thead><tr><th>Catégorie d'événement</th><th>Exemples</th></tr></thead><tbody>
          <tr><td>Fraude interne</td><td>Positions non autorisées, détournement par un salarié</td></tr>
          <tr><td>Fraude externe</td><td>Vol, falsification, piratage, fraude au président</td></tr>
          <tr><td>Pratiques en matière d'emploi et sécurité au travail</td><td>Litiges prud'homaux, discrimination, accidents</td></tr>
          <tr><td>Clients, produits et pratiques commerciales</td><td>Défaut de conseil, ventes abusives, manquements LCB-FT, sanctions</td></tr>
          <tr><td>Dommages aux actifs corporels</td><td>Catastrophes naturelles, incendie, terrorisme</td></tr>
          <tr><td>Interruption d'activité et défaillance des systèmes</td><td>Panne informatique, coupure de télécommunications</td></tr>
          <tr><td>Exécution, livraison et gestion des processus</td><td>Erreur de saisie, défaut de règlement-livraison, erreur de reporting</td></tr>
        </tbody></table>` },
      { h: "Les outils du dispositif", html: `
        <ul>
          <li><strong>Collecte des pertes</strong> : base de données des incidents (montant brut, récupérations, date de survenance, de détection et de comptabilisation), au-delà d'un seuil de collecte ;</li>
          <li><strong>RCSA</strong> (Risk and Control Self-Assessment) : cartographie des risques par processus, évaluation du risque brut, de l'efficacité des contrôles et du risque résiduel ;</li>
          <li><strong>KRI</strong> (Key Risk Indicators) : indicateurs avancés avec seuils d'alerte (taux de rotation du personnel, suspens de rapprochement, incidents informatiques, retards de traitement) ;</li>
          <li><strong>Analyse de scénarios</strong> : estimation à dire d'experts d'événements rares et sévères ;</li>
          <li><strong>Plans d'action</strong> et suivi des recommandations d'audit ;</li>
          <li><strong>Assurance</strong> : transfert d'une partie du risque (polices « globale de banque », cyber, responsabilité civile professionnelle).</li>
        </ul>` }
    ],
    points: ["Processus, personnes, systèmes, événements externes ; risque juridique inclus", "Sept catégories bâloises d'événements de perte", "Collecte des pertes, RCSA, KRI et scénarios forment un dispositif cohérent"]
  },
  {
    id: "m5-l2",
    titre: "Le capital pour risque opérationnel sous CRR3",
    duree: 20,
    objectifs: ["Calculer l'indicateur d'activité (BI)", "Appliquer les coefficients marginaux de la BIC", "Comprendre le choix européen ILM = 1"],
    sections: [
      { h: "D'une pluralité d'approches à une approche unique", html: `
        <p>Jusqu'à fin 2024, les banques européennes utilisaient l'approche de l'indicateur de base, l'approche standard ou les approches de mesure avancées (AMA, fondées sur des modèles internes de distribution des pertes). Bâle III finalisé et CRR3 les remplacent, depuis le 1<sup>er</sup> janvier 2025, par une <strong>nouvelle approche standard unique</strong>. Les modèles internes ne sont plus utilisés pour le Pilier 1 ; ils gardent leur intérêt pour l'ICAAP.</p>` },
      { h: "L'indicateur d'activité (BI)", html: `
        <div class="f">BI = ILDC + SC + FC (moyennes sur trois ans)</div>
        <ul>
          <li><strong>ILDC</strong> (intérêts, locations et dividendes) = min(|produits − charges d'intérêts| ; 2,25 % × actifs productifs) + dividendes ;</li>
          <li><strong>SC</strong> (services) = max(autres produits ; autres charges d'exploitation) + max(commissions reçues ; commissions versées) ;</li>
          <li><strong>FC</strong> (financier) = |P&amp;L net du portefeuille de négociation| + |P&amp;L net du portefeuille bancaire|.</li>
        </ul>` },
      { h: "La composante BIC et le multiplicateur de pertes", html: `
        <p>On applique au BI des <strong>coefficients marginaux</strong> croissants, par tranche :</p>
        <table class="t"><thead><tr><th>Tranche de BI</th><th class="num">Coefficient marginal</th></tr></thead><tbody>
          <tr><td>Jusqu'à 1 Md€</td><td class="num">12 %</td></tr>
          <tr><td>De 1 à 30 Md€</td><td class="num">15 %</td></tr>
          <tr><td>Au-delà de 30 Md€</td><td class="num">18 %</td></tr>
        </tbody></table>
        <div class="f">Exigence (ORC) = BIC × ILM ; RWA = ORC × 12,5</div>
        <p>Le standard de Bâle prévoit un <strong>multiplicateur de pertes internes</strong> (ILM) fondé sur l'historique de pertes à dix ans. Le législateur européen a exercé l'option permettant de fixer l'<strong>ILM à 1 pour toutes les banques</strong> : l'exigence dépend donc uniquement de la taille de l'activité. La qualité de la collecte des pertes reste néanmoins exigée (articles 316 à 322 du CRR) et alimente le Pilier 2.</p>` }
    ],
    points: ["Approche standard unique depuis 2025 ; fin des AMA pour le Pilier 1", "BIC : 12 % / 15 % / 18 % par tranche de BI", "UE : ILM = 1, donc ORC = BIC"]
  },
  {
    id: "m5-l3",
    titre: "Résilience opérationnelle numérique : DORA",
    duree: 25,
    objectifs: ["Connaître les cinq piliers de DORA", "Maîtriser le processus de déclaration des incidents majeurs", "Encadrer le risque lié aux prestataires TIC"],
    sections: [
      { h: "Le règlement DORA", html: `
        <p>Le règlement (UE) 2022/2554 sur la résilience opérationnelle numérique (<strong>DORA</strong>) s'applique depuis le <strong>17 janvier 2025</strong> aux banques, entreprises d'investissement, assureurs, établissements de paiement, infrastructures de marché et gestionnaires d'actifs. Il harmonise cinq domaines :</p>
        <ol>
          <li>la <strong>gestion du risque lié aux TIC</strong> (cadre, gouvernance, responsabilité de l'organe de direction) ;</li>
          <li>la <strong>gestion, la classification et la déclaration des incidents</strong> liés aux TIC ;</li>
          <li>les <strong>tests de résilience</strong>, dont les tests de pénétration fondés sur la menace (TLPT) pour les entités les plus importantes ;</li>
          <li>la <strong>gestion du risque lié aux prestataires tiers de TIC</strong> ;</li>
          <li>le <strong>partage d'informations</strong> sur les cybermenaces.</li>
        </ol>` },
      { h: "Déclaration des incidents majeurs", html: `
        <p>Les incidents sont classés selon des critères harmonisés (clients touchés, durée, services critiques, pertes de données, impact géographique et économique). Un incident jugé <strong>majeur</strong> fait l'objet de trois déclarations successives à l'autorité compétente :</p>
        <table class="t"><thead><tr><th>Étape</th><th>Délai indicatif</th></tr></thead><tbody>
          <tr><td>Notification initiale</td><td>4 heures après la classification comme majeur, et au plus tard 24 heures après la détection</td></tr>
          <tr><td>Rapport intermédiaire</td><td>72 heures après la notification initiale</td></tr>
          <tr><td>Rapport final</td><td>Un mois après le dernier rapport intermédiaire</td></tr>
        </tbody></table>
        <p class="note">Vérifie les délais précis dans les normes techniques applicables : ils peuvent être aménagés selon le jour de survenance et la taille de l'entité.</p>` },
      { h: "Prestataires tiers et registre d'informations", html: `
        <p>Chaque entité tient un <strong>registre d'informations</strong> recensant tous ses contrats de services TIC, transmis aux autorités (première remise au printemps 2025). Les contrats portant sur des fonctions critiques ou importantes doivent comporter des clauses minimales (localisation des données, niveaux de service, droits d'audit, stratégie de sortie).</p>
        <p>DORA instaure aussi une <strong>surveillance directe des prestataires TIC critiques</strong> (grands fournisseurs de cloud notamment) par les autorités européennes de surveillance. Pour le risk manager, cela renforce l'analyse du risque de concentration et la préparation des plans de continuité.</p>` }
    ],
    points: ["DORA s'applique depuis le 17 janvier 2025", "Incident majeur : notification initiale, rapport intermédiaire, rapport final", "Registre d'informations et surveillance des prestataires TIC critiques"]
  }],
  quiz: [
    { q: "Lequel de ces risques est explicitement exclu de la définition bâloise du risque opérationnel ?", o: ["Le risque juridique", "Le risque de réputation", "Le risque de fraude externe", "Le risque de défaillance des systèmes"], c: 1, e: "La définition inclut le risque juridique mais exclut le risque stratégique et le risque de réputation." },
    { q: "Une vente abusive de produits financiers à des clients relève de la catégorie :", o: ["Fraude interne", "Exécution, livraison et gestion des processus", "Clients, produits et pratiques commerciales", "Interruption d'activité"], c: 2, e: "Les manquements aux obligations envers les clients (conseil, adéquation, ventes abusives) relèvent de la catégorie « Clients, produits et pratiques commerciales »." },
    { q: "Une banque a un BI de 5 Md€. Quelle est sa composante BIC ?", o: ["600 M€", "720 M€", "750 M€", "900 M€"], c: 1, e: "BIC = 12 % × 1 Md€ + 15 % × 4 Md€ = 120 + 600 = 720 M€." },
    { q: "Dans l'UE, le multiplicateur de pertes internes (ILM) est :", o: ["Calculé sur dix ans de pertes pour chaque banque", "Fixé à 1 pour toutes les banques", "Réservé aux banques de plus de 30 Md€ de BI", "Remplacé par un modèle AMA"], c: 1, e: "Le législateur européen a exercé l'option bâloise de fixer l'ILM à 1 : l'exigence repose entièrement sur la BIC." },
    { q: "Depuis quand le règlement DORA s'applique-t-il ?", o: ["1er janvier 2024", "17 janvier 2025", "1er janvier 2026", "17 janvier 2027"], c: 1, e: "DORA est entré en application le 17 janvier 2025, sans période de transition." }
  ]
},
{
  id: "climat",
  num: 6,
  titre: "Climat et ESG",
  accroche: "Intégrer les risques climatiques, environnementaux, sociaux et de gouvernance dans la gestion des risques bancaires.",
  couleur: "#3d6e3a",
  calcs: ["clim"],
  lecons: [
  {
    id: "m6-l1",
    titre: "Risques physiques et risques de transition",
    duree: 20,
    objectifs: ["Distinguer les canaux de transmission des risques climatiques", "Relier facteurs ESG et risques financiers traditionnels", "Comprendre le principe de double matérialité"],
    sections: [
      { h: "Deux familles de facteurs de risque", html: `
        <table class="t"><thead><tr><th></th><th>Risque physique</th><th>Risque de transition</th></tr></thead><tbody>
          <tr><td>Origine</td><td>Effets matériels du changement climatique</td><td>Ajustement vers une économie bas carbone</td></tr>
          <tr><td>Sous-types</td><td><strong>Aigus</strong> (inondations, tempêtes, incendies) et <strong>chroniques</strong> (hausse du niveau de la mer, stress hydrique, températures)</td><td>Politiques publiques (prix du carbone, normes), technologie, préférences des consommateurs, contentieux</td></tr>
          <tr><td>Exemple</td><td>Dépréciation de biens immobiliers en zone inondable</td><td>Actifs « échoués » d'un producteur d'énergie fossile</td></tr>
        </tbody></table>` },
      { h: "Des facteurs de risque, pas une nouvelle catégorie", html: `
        <p>Le superviseur considère les risques climatiques et environnementaux comme des <strong>facteurs</strong> qui se transmettent aux catégories existantes :</p>
        <ul>
          <li><strong>Crédit</strong> : hausse des PD des secteurs exposés, baisse de la valeur des sûretés immobilières (LGD) ;</li>
          <li><strong>Marché</strong> : réévaluation brutale des actions et obligations des secteurs carbonés ;</li>
          <li><strong>Liquidité</strong> : retraits de dépôts après une catastrophe, décote des actifs ;</li>
          <li><strong>Opérationnel</strong> : dommages aux sites, contentieux et risque de « greenwashing » ;</li>
          <li><strong>Stratégique et réputation</strong> : viabilité du modèle d'affaires.</li>
        </ul>
        <p>Les facteurs <strong>sociaux</strong> (droits humains, conditions de travail) et de <strong>gouvernance</strong> (corruption, rémunérations) se transmettent de la même façon.</p>` },
      { h: "La double matérialité", html: `
        <p>La <strong>matérialité financière</strong> (vision « outside-in ») mesure l'impact des facteurs ESG sur la banque. La <strong>matérialité d'impact</strong> (« inside-out ») mesure l'impact de la banque, via ses financements, sur l'environnement et la société. Le reporting de durabilité européen (CSRD) retient les deux ; la gestion prudentielle des risques se concentre sur la première, sans ignorer que la seconde peut devenir un risque juridique ou de réputation.</p>` }
    ],
    points: ["Risque physique (aigu, chronique) et risque de transition", "Les facteurs ESG se transmettent aux risques existants", "Double matérialité : financière et d'impact"]
  },
  {
    id: "m6-l2",
    titre: "Attentes prudentielles et orientations de l'EBA",
    duree: 25,
    objectifs: ["Connaître les attentes de la BCE", "Situer les orientations de l'EBA sur la gestion des risques ESG", "Comprendre les plans de transition prudentiels"],
    sections: [
      { h: "Le guide de la BCE", html: `
        <p>Publié en novembre 2020, le guide de la BCE relatif aux risques liés au climat et à l'environnement formule <strong>13 attentes prudentielles</strong> couvrant le modèle d'affaires et la stratégie, la gouvernance et l'appétit pour le risque, la gestion des risques (crédit, opérationnel, marché, liquidité, ICAAP, stress tests) et la publication d'informations. La BCE a fixé des échéances de mise en conformité et n'a pas hésité à utiliser des astreintes pour les banques en retard.</p>` },
      { h: "Les orientations de l'EBA (EBA/GL/2025/01)", html: `
        <p>Publiées le 9 janvier 2025 en application de CRD6, les orientations sur la gestion des risques ESG s'appliquent depuis le <strong>11 janvier 2026</strong> (au plus tard le 11 janvier 2027 pour les établissements petits et non complexes). Elles prévoient :</p>
        <ul>
          <li>une <strong>évaluation régulière de la matérialité</strong> des risques ESG, sur des horizons court, moyen et long terme, ce dernier couvrant au moins 10 ans ;</li>
          <li>des <strong>méthodologies de mesure</strong> : approches par exposition (notation ESG des contreparties), par secteur, par portefeuille (alignement, émissions financées) et par scénario ;</li>
          <li>l'intégration dans la stratégie, l'appétit pour le risque, les politiques de crédit, le suivi par indicateurs et le reporting interne ;</li>
          <li>des <strong>plans prudentiels de transition</strong> (article 76(2) de la CRD) avec objectifs, jalons et indicateurs, cohérents avec les plans publiés au titre d'autres textes européens.</li>
        </ul>` },
      { h: "Publication : Pilier 3 ESG", html: `
        <p>Les grandes banques cotées publient des informations ESG normalisées au titre du Pilier 3 : exposition aux secteurs carbonés, émissions financées, risques physiques par zone géographique, actions d'atténuation et ratio d'actifs verts (GAR) aligné sur la taxonomie européenne. Le cadre de reporting de durabilité a fait l'objet de simplifications européennes en 2025-2026 : vérifie le périmètre applicable à chaque établissement.</p>` }
    ],
    points: ["BCE : 13 attentes prudentielles depuis 2020", "EBA/GL/2025/01 : application au 11 janvier 2026, horizon d'au moins 10 ans", "Plans prudentiels de transition (art. 76(2) CRD)"]
  },
  {
    id: "m6-l3",
    titre: "Scénarios et stress tests climatiques",
    duree: 20,
    objectifs: ["Connaître les scénarios du NGFS", "Décrire la mécanique d'un stress test climatique", "Identifier les limites méthodologiques"],
    sections: [
      { h: "Les scénarios du NGFS", html: `
        <p>Le Network for Greening the Financial System (NGFS), réseau de banques centrales et de superviseurs, publie des scénarios de référence regroupés en grandes familles :</p>
        <ul>
          <li><strong>Transition ordonnée</strong> : politiques climatiques introduites tôt et progressivement (par exemple « Net Zero 2050 ») ; risques de transition et physiques modérés ;</li>
          <li><strong>Transition désordonnée</strong> : action tardive ou brutale ; risques de transition élevés ;</li>
          <li><strong>Monde « hot house »</strong> : politiques insuffisantes ; risques physiques sévères et irréversibles ;</li>
          <li><strong>« Too little, too late »</strong> : transition tardive et insuffisante, cumulant les deux risques.</li>
        </ul>` },
      { h: "Mécanique d'un stress test climatique", html: `
        <ol>
          <li>Choix des <strong>scénarios</strong> et de l'horizon (souvent 10 à 30 ans, bien au-delà des stress tests classiques) ;</li>
          <li><strong>Traduction macroéconomique et sectorielle</strong> : prix du carbone, PIB, prix de l'énergie, valeur ajoutée par secteur ;</li>
          <li><strong>Impact sur les contreparties</strong> : hausse des coûts (émissions × prix du carbone), baisse de l'EBITDA, dégradation des ratios financiers, migration de notation et de PD ;</li>
          <li><strong>Impact sur les sûretés</strong> : valeur des biens immobiliers selon la performance énergétique et l'exposition aux aléas physiques ;</li>
          <li><strong>Agrégation</strong> en pertes de crédit, en RWA et en capital.</li>
        </ol>
        <p>Le calculateur « Choc carbone » de ce module illustre l'étape 3 pour une entreprise.</p>` },
      { h: "Limites et bonnes pratiques", html: `
        <p>Les principaux défis sont la <strong>disponibilité des données</strong> (émissions de scope 3, localisation précise des actifs), l'horizon très long qui rend l'hypothèse de bilan statique peu réaliste, et l'incertitude des scénarios. Les superviseurs (BCE en 2022, EBA avec l'exercice « Fit-for-55 ») ont utilisé ces exercices surtout comme outils d'apprentissage. Les bonnes pratiques consistent à documenter les hypothèses, à utiliser des approximations sectorielles prudentes et à intégrer progressivement les résultats dans l'ICAAP et l'appétit pour le risque.</p>` }
    ],
    points: ["NGFS : ordonné, désordonné, hot house, too little too late", "Chaîne : scénario → secteur → contrepartie → pertes et capital", "Les données sont la première limite"]
  }],
  quiz: [
    { q: "La hausse progressive du niveau de la mer est un exemple de :", o: ["Risque physique aigu", "Risque physique chronique", "Risque de transition technologique", "Risque de transition juridique"], c: 1, e: "Les risques physiques chroniques résultent d'évolutions lentes (niveau de la mer, températures) ; les risques aigus sont des événements extrêmes." },
    { q: "Selon l'approche prudentielle, les risques climatiques sont :", o: ["Une nouvelle catégorie de risque de Pilier 1 avec son propre ratio", "Des facteurs qui se transmettent aux risques existants (crédit, marché, liquidité, opérationnel)", "Un sujet exclusivement extra-financier", "Couverts uniquement par le risque de réputation"], c: 1, e: "Le superviseur les traite comme des facteurs de risque transmis aux catégories existantes, à intégrer dans le dispositif de gestion des risques." },
    { q: "À partir de quelle date les orientations de l'EBA sur la gestion des risques ESG s'appliquent-elles aux grands établissements ?", o: ["9 janvier 2025", "17 janvier 2025", "11 janvier 2026", "11 janvier 2027"], c: 2, e: "Elles s'appliquent depuis le 11 janvier 2026 ; les établissements petits et non complexes ont jusqu'au 11 janvier 2027 au plus tard." },
    { q: "Quel scénario NGFS combine une action tardive et des politiques insuffisantes ?", o: ["Net Zero 2050", "Transition désordonnée", "Too little, too late", "Current policies"], c: 2, e: "« Too little, too late » cumule une transition tardive et insuffisante : risques de transition et physiques élevés." },
    { q: "Une entreprise émet 2 MtCO2e par an. Le prix du carbone augmente de 100 € par tonne sans possibilité de répercussion. L'impact sur son EBITDA est :", o: ["−2 M€", "−20 M€", "−200 M€", "−2 Md€"], c: 2, e: "2 000 000 t × 100 €/t = 200 M€ de coûts supplémentaires, en baisse directe de l'EBITDA." }
  ]
},
{
  id: "modeles",
  num: 7,
  titre: "Risque de modèle",
  accroche: "Gouverner, valider et surveiller les modèles : du cycle de vie au backtesting, jusqu'aux attentes sur l'apprentissage automatique.",
  couleur: "#2f5f73",
  calcs: ["bin"],
  lecons: [
  {
    id: "m7-l1",
    titre: "Gouvernance et cycle de vie des modèles",
    duree: 20,
    objectifs: ["Définir le risque de modèle", "Décrire le cycle de vie d'un modèle", "Organiser l'inventaire et la hiérarchisation des modèles"],
    sections: [
      { h: "Qu'est-ce que le risque de modèle ?", html: `
        <p>Le risque de modèle est le risque de pertes ou de décisions erronées résultant d'un modèle <strong>mal conçu</strong> (erreur de spécification, hypothèses inadaptées, données de mauvaise qualité, erreur d'implémentation) ou <strong>mal utilisé</strong> (hors de son périmètre ou sans tenir compte de ses limites). Il concerne aussi bien les modèles réglementaires (IRB, IMA, CCR) que les modèles de valorisation, de provisionnement IFRS 9, d'octroi, d'ALM ou de lutte contre le blanchiment.</p>
        <p>La référence historique est la guidance américaine <strong>SR 11-7</strong> (Réserve fédérale et OCC, 2011) ; au Royaume-Uni, le PRA a publié le <strong>SS1/23</strong>.</p>` },
      { h: "Le cycle de vie", html: `
        <ol>
          <li><strong>Développement</strong> : besoin métier, données, choix méthodologique, documentation ;</li>
          <li><strong>Validation initiale</strong> indépendante ;</li>
          <li><strong>Approbation</strong> par un comité, et par le superviseur pour les modèles réglementaires ;</li>
          <li><strong>Implémentation</strong> et tests dans les systèmes de production ;</li>
          <li><strong>Utilisation</strong> conforme au périmètre défini (« use test ») ;</li>
          <li><strong>Suivi de la performance</strong> (monitoring) et <strong>revalidation périodique</strong> ;</li>
          <li><strong>Modification</strong> (avec classification matérielle ou non) ou <strong>retrait</strong>.</li>
        </ol>` },
      { h: "Inventaire et hiérarchisation", html: `
        <p>Un dispositif de gestion du risque de modèle (MRM) repose sur un <strong>inventaire exhaustif</strong> des modèles (propriétaire, utilisateur, statut de validation, limites connues) et une <strong>hiérarchisation</strong> (tiering) selon la matérialité, la complexité et l'incertitude. Le niveau de risque détermine la profondeur et la fréquence de la validation.</p>
        <p>Les rôles sont séparés : <strong>propriétaire</strong> (métier, première ligne), <strong>développeur</strong>, <strong>validateur indépendant</strong> (deuxième ligne) et <strong>audit interne</strong> (troisième ligne). Un comité des modèles au niveau de la direction supervise l'ensemble. Le risque de modèle résiduel peut donner lieu à des marges de prudence ou à des ajustements de valeur.</p>` }
    ],
    points: ["Risque de modèle : mauvaise conception ou mauvaise utilisation", "Cycle : développement, validation, approbation, usage, suivi, revalidation", "Inventaire, tiering et séparation des rôles"]
  },
  {
    id: "m7-l2",
    titre: "La validation indépendante",
    duree: 25,
    objectifs: ["Structurer une revue de validation", "Mesurer le pouvoir discriminant d'un modèle de notation", "Tester la calibration d'une PD"],
    sections: [
      { h: "Les axes d'une validation", html: `
        <ul>
          <li><strong>Revue conceptuelle</strong> : pertinence de la méthode, hypothèses, alternatives ;</li>
          <li><strong>Données</strong> : représentativité, qualité, traitements (valeurs manquantes, exclusions) ;</li>
          <li><strong>Réplication</strong> et contrôle de l'implémentation ;</li>
          <li><strong>Performance quantitative</strong> : discrimination, calibration, stabilité ;</li>
          <li><strong>Analyses de sensibilité</strong> et tests de résistance aux hypothèses ;</li>
          <li><strong>Usage</strong> : conformité au périmètre, ajustements manuels (overrides).</li>
        </ul>
        <p>La validation conclut par une opinion graduée et des constats classés par sévérité, assortis d'échéances de remédiation.</p>` },
      { h: "Discrimination : la courbe ROC et le Gini", html: `
        <p>Le <strong>pouvoir discriminant</strong> mesure la capacité d'un modèle à classer les emprunteurs, les futurs défauts recevant les plus mauvaises notes. On l'évalue par l'aire sous la courbe ROC (<strong>AUC</strong>) ou par l'indice de <strong>Gini</strong> (Accuracy Ratio) :</p>
        <div class="f">Gini = 2 × AUC − 1</div>
        <p>Un modèle aléatoire a un Gini de 0, un modèle parfait de 1. Pour un modèle de notation d'entreprises, un Gini de 50 % à 70 % est courant. On suit aussi la <strong>stabilité</strong> de la population (Population Stability Index).</p>` },
      { h: "Calibration : le test binomial", html: `
        <p>La calibration vérifie que les PD prévues correspondent aux taux de défaut observés. Pour une classe de notation de n emprunteurs de PD p, le nombre de défauts suit, sous hypothèse d'indépendance, une <strong>loi binomiale</strong> B(n, p). On rejette la calibration si la probabilité d'observer au moins d défauts est trop faible :</p>
        <div class="f">p-value = P( X ≥ d ) avec X ~ B(n, p)</div>
        <p>Comme les défauts sont corrélés en pratique, ce test est trop sévère en période de crise ; on le complète par le test de <strong>Jeffreys</strong> (approche bayésienne recommandée par la BCE), par des tests multi-classes et par une analyse sur plusieurs années. Le calculateur « Test binomial » te permet de l'appliquer.</p>` }
    ],
    points: ["Validation : conception, données, réplication, performance, usage", "Gini = 2 × AUC − 1", "Calibration : test binomial, complété par Jeffreys"]
  },
  {
    id: "m7-l3",
    titre: "Modèles internes, guide de la BCE et apprentissage automatique",
    duree: 20,
    objectifs: ["Situer le guide de la BCE sur les modèles internes", "Connaître les attentes sur l'apprentissage automatique", "Identifier les enjeux d'explicabilité"],
    sections: [
      { h: "De TRIM au guide de la BCE", html: `
        <p>De 2016 à 2021, la BCE a mené la revue ciblée des modèles internes (<strong>TRIM</strong>) afin de réduire la variabilité injustifiée des RWA entre banques. Son guide sur les modèles internes, issu de cette revue, a été révisé à plusieurs reprises, dont le <strong>28 juillet 2025</strong> pour tenir compte de CRR3. Il couvre des principes transversaux (gestion du risque de modèle, gouvernance des données, validation interne, recours à des tiers) et des chapitres par risque (crédit, marché sous CRR2 et sous CRR3, contrepartie).</p>
        <p>La version de février 2024 précisait déjà comment intégrer les risques climatiques matériels dans les modèles internes.</p>` },
      { h: "Les attentes sur l'apprentissage automatique", html: `
        <p>La révision de 2025 ajoute une section consacrée aux techniques d'<strong>apprentissage automatique</strong> dans les modèles internes, autour de cinq thèmes :</p>
        <ul>
          <li><strong>Gouvernance</strong> : compétences, rôles et intégration dans le dispositif de MRM ;</li>
          <li><strong>Données</strong> : traçabilité et maintenance ;</li>
          <li><strong>Méthodes mathématiques</strong> : justification des choix, prévention du surapprentissage, échantillons de test indépendants ;</li>
          <li><strong>Explicabilité</strong> : capacité à expliquer les résultats au niveau global et individuel (par exemple avec des valeurs de Shapley) ;</li>
          <li><strong>Usage</strong> : compréhension par les utilisateurs et contrôle des ajustements.</li>
        </ul>` },
      { h: "Enjeux pratiques pour le risk manager", html: `
        <p>Les modèles d'apprentissage automatique améliorent souvent la discrimination, mais au prix d'une <strong>complexité</strong> et d'une <strong>instabilité</strong> plus fortes. Le validateur doit vérifier l'absence de biais (y compris discriminatoires pour les modèles d'octroi), la robustesse aux changements de population et la reproductibilité. Le règlement européen sur l'intelligence artificielle classe par ailleurs l'évaluation de la solvabilité des personnes physiques parmi les usages à haut risque, avec des exigences propres.</p>
        <p>Pour les modèles d'IA générative utilisés en appui (rédaction, synthèse), l'inventaire et une évaluation proportionnée des risques restent nécessaires.</p>` }
    ],
    points: ["Guide de la BCE révisé le 28 juillet 2025 (CRR3)", "ML : gouvernance, données, méthodes, explicabilité, usage", "Biais, stabilité et reproductibilité au cœur de la validation"]
  }],
  quiz: [
    { q: "Le risque de modèle couvre :", o: ["Uniquement les erreurs de code informatique", "Les erreurs de conception et la mauvaise utilisation des modèles", "Uniquement les modèles réglementaires de Pilier 1", "Uniquement les modèles de valorisation des dérivés"], c: 1, e: "Il couvre la conception (méthode, hypothèses, données, implémentation) et l'usage, pour tous les modèles utilisés dans la prise de décision." },
    { q: "Un modèle de notation a une AUC de 0,80. Quel est son indice de Gini ?", o: ["40 %", "60 %", "80 %", "64 %"], c: 1, e: "Gini = 2 × AUC − 1 = 2 × 0,80 − 1 = 0,60." },
    { q: "Pourquoi le test binomial est-il souvent trop sévère pour valider une PD ?", o: ["Il ignore la taille de l'échantillon", "Il suppose l'indépendance des défauts, alors qu'ils sont corrélés", "Il ne s'applique qu'aux portefeuilles de détail", "Il impose une PD minimale de 0,03 %"], c: 1, e: "La corrélation des défauts (facteur systématique) élargit la distribution réelle du nombre de défauts ; le test binomial rejette alors trop souvent en période de crise." },
    { q: "Dans un dispositif de MRM, la validation indépendante relève de :", o: ["La première ligne", "La deuxième ligne", "La troisième ligne", "L'auditeur externe"], c: 1, e: "La validation indépendante est une fonction de deuxième ligne ; l'audit interne (troisième ligne) vérifie l'efficacité du dispositif dans son ensemble." },
    { q: "La révision du guide de la BCE sur les modèles internes publiée en juillet 2025 a notamment ajouté :", o: ["Une section sur l'apprentissage automatique", "La suppression des modèles IRB", "Un nouveau ratio de liquidité", "Une approche AMA pour le risque opérationnel"], c: 0, e: "Elle introduit des attentes sur l'usage des techniques d'apprentissage automatique (gouvernance, données, méthodes, explicabilité, usage) et intègre les changements de CRR3." }
  ]
});

Object.assign(window.CALCS, {
  opr: { titre: "Capital pour risque opérationnel", module: "oprisk", desc: "Indicateur d'activité, composante BIC par tranches et RWA selon l'approche standard CRR3." },
  clim: { titre: "Choc carbone sur une entreprise", module: "climat", desc: "Effet d'une hausse du prix du carbone sur l'EBITDA, le levier et la couverture des intérêts d'une contrepartie." },
  bin: { titre: "Test binomial de calibration", module: "modeles", desc: "Comparer les défauts observés à la PD prévue d'une classe de notation." }
});

window.ABOUT = {
  nom: "Laurent Motais de Narbonne",
  titre: "Risk Manager Senior · Formateur en gestion des risques",
  linkedin: "https://www.linkedin.com/in/laurent-motais-de-narbonne/",
  site: "https://ldenarbonne.github.io/",
  email: "ldenarbonne@googlemail.com"
};
