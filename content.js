/* Contenu pédagogique — RiskAcadémie (niveau intermédiaire, français) */
window.MODULES = [
{
  id: "marche",
  num: 1,
  titre: "Risque de marché",
  accroche: "Mesurer, tester et capitaliser le risque des portefeuilles de négociation : de la VaR à la FRTB.",
  couleur: "#1f4e79",
  calcs: ["var"],
  lecons: [
  {
    id: "m1-l1",
    titre: "Mesures de risque : sensibilités, VaR et Expected Shortfall",
    duree: 25,
    objectifs: ["Distinguer mesures locales (sensibilités) et mesures globales (VaR, ES)", "Comparer les trois grandes méthodes de calcul de la VaR", "Comprendre pourquoi l'ES est une mesure cohérente"],
    sections: [
      { h: "Des sensibilités aux mesures globales", html: `
        <p>La première ligne de mesure du risque de marché est constituée des <strong>sensibilités</strong> : la variation de valeur d'un portefeuille pour un petit mouvement d'un facteur de risque. On parle de delta et de gamma (sous-jacent), de vega (volatilité), de thêta (temps) et, pour les taux, de <strong>DV01</strong> ou PV01 (variation de valeur pour 1 point de base).</p>
        <p>Les sensibilités sont indispensables au pilotage quotidien des desks et à la fixation de limites, mais elles ne s'additionnent pas entre facteurs de nature différente et ne disent rien de la probabilité d'une perte. D'où le besoin de <strong>mesures globales</strong>, exprimées en euros et associées à une probabilité.</p>` },
      { h: "La Value-at-Risk (VaR)", html: `
        <p>La VaR au niveau de confiance α et à l'horizon h est la perte qui ne sera pas dépassée avec une probabilité α sur cet horizon. C'est un <strong>quantile</strong> de la distribution des pertes et profits (P&amp;L).</p>
        <div class="f">P( Perte<sub>h</sub> &gt; VaR<sub>α,h</sub> ) = 1 − α</div>
        <p>Exemple : une VaR 99 % à 1 jour de 2 M€ signifie qu'en moyenne, un jour sur cent, la perte devrait dépasser 2 M€. La VaR ne dit rien de l'ampleur de la perte au-delà de ce seuil.</p>
        <p>Sous l'hypothèse de rendements indépendants et identiquement distribués, on passe d'un horizon à un autre par la <strong>règle de la racine du temps</strong> : VaR<sub>10j</sub> ≈ VaR<sub>1j</sub> × √10.</p>` },
      { h: "Trois méthodes de calcul", html: `
        <table class="t"><thead><tr><th>Méthode</th><th>Principe</th><th>Forces</th><th>Limites</th></tr></thead><tbody>
        <tr><td><strong>Paramétrique</strong> (variance-covariance)</td><td>P&amp;L supposé normal ; VaR = z<sub>α</sub> · σ<sub>P</sub> · V</td><td>Rapide, analytique, décomposable</td><td>Sous-estime les queues épaisses, mal adaptée aux options</td></tr>
        <tr><td><strong>Historique</strong></td><td>Réévaluation du portefeuille sur les variations observées (souvent 250 à 500 jours)</td><td>Aucune hypothèse de loi, capture corrélations et non-linéarités</td><td>Dépend de la fenêtre ; « effet fantôme » à la sortie d'un choc</td></tr>
        <tr><td><strong>Monte-Carlo</strong></td><td>Simulation de milliers de scénarios selon un modèle stochastique</td><td>Flexible, produits complexes</td><td>Coûteuse en calcul, risque de modèle</td></tr>
        </tbody></table>` },
      { h: "L'Expected Shortfall (ES)", html: `
        <p>L'ES (ou CVaR) est la <strong>perte moyenne au-delà de la VaR</strong> :</p>
        <div class="f">ES<sub>α</sub> = E[ Perte | Perte ≥ VaR<sub>α</sub> ]</div>
        <p>Contrairement à la VaR, l'ES est une mesure <strong>cohérente</strong> au sens d'Artzner et al. (1999) : elle respecte notamment la <strong>sous-additivité</strong> (le risque d'un portefeuille agrégé n'excède pas la somme des risques), ce qui valorise la diversification. Elle tient compte de la forme de la queue de distribution.</p>
        <p>Sous loi normale, l'ES 97,5 % est très proche de la VaR 99 % (≈ 2,34σ contre 2,33σ) : c'est ce qui a guidé le calibrage de la FRTB. Avec des queues épaisses, l'ES devient nettement supérieure.</p>` }
    ],
    points: ["La VaR est un quantile ; l'ES est une moyenne conditionnelle de la queue", "La VaR n'est pas toujours sous-additive ; l'ES l'est", "Le choix de la méthode dépend du portefeuille (linéaire ou optionnel) et des données disponibles"]
  },
  {
    id: "m1-l2",
    titre: "Backtesting et stress tests",
    duree: 20,
    objectifs: ["Mettre en œuvre un backtesting de VaR", "Interpréter les zones de Bâle", "Concevoir un programme de stress tests"],
    sections: [
      { h: "Le backtesting", html: `
        <p>Le backtesting compare chaque jour la VaR prévue avec le P&amp;L réalisé. Une <strong>exception</strong> survient lorsque la perte dépasse la VaR. Sur 250 jours, une VaR 99 % bien calibrée devrait produire environ 2,5 exceptions.</p>
        <p>On distingue le P&amp;L <strong>hypothétique</strong> (positions figées, variations de marché seules) et le P&amp;L <strong>réel</strong> (incluant l'intra-journalier et les nouvelles opérations). Le régulateur exige les deux.</p>` },
      { h: "Les zones « feux tricolores » de Bâle", html: `
        <table class="t"><thead><tr><th>Exceptions (250 j, VaR 99 %)</th><th>Zone</th><th>Conséquence</th></tr></thead><tbody>
        <tr><td>0 à 4</td><td><span class="tag ok">Verte</span></td><td>Modèle jugé acceptable</td></tr>
        <tr><td>5 à 9</td><td><span class="tag warn">Jaune</span></td><td>Majoration progressive du multiplicateur de capital</td></tr>
        <tr><td>10 et plus</td><td><span class="tag ko">Rouge</span></td><td>Modèle présumé défaillant, majoration maximale, revue du modèle</td></tr>
        </tbody></table>
        <p>Des tests statistiques complètent l'analyse : le test de <strong>Kupiec</strong> (fréquence des exceptions) et celui de <strong>Christoffersen</strong> (indépendance des exceptions, qui ne doivent pas être groupées).</p>` },
      { h: "Stress tests et stressed VaR", html: `
        <p>La VaR décrit des conditions « normales ». Les <strong>stress tests</strong> mesurent l'impact de scénarios extrêmes mais plausibles :</p>
        <ul>
          <li><strong>Historiques</strong> : rejouer 2008, la crise de la dette souveraine de 2011, mars 2020 ou le choc de taux de 2022 ;</li>
          <li><strong>Hypothétiques</strong> : scénarios construits par la banque (choc géopolitique, crise d'un secteur) ;</li>
          <li><strong>Inversés</strong> (reverse stress tests) : identifier les scénarios qui rendraient la banque non viable.</li>
        </ul>
        <p>Sous Bâle 2.5, la <strong>stressed VaR</strong> calcule la VaR du portefeuille actuel sur une période de 12 mois de tension significative. La FRTB remplace ce couple VaR / sVaR par une ES calibrée sur une période de stress.</p>` }
    ],
    points: ["Environ 2,5 exceptions attendues sur 250 jours pour une VaR 99 %", "Zones : 0-4 verte, 5-9 jaune, 10+ rouge", "Les stress tests complètent la VaR, ils ne la remplacent pas"]
  },
  {
    id: "m1-l3",
    titre: "La FRTB (Fundamental Review of the Trading Book)",
    duree: 30,
    objectifs: ["Connaître l'architecture de l'approche standard (SA)", "Comprendre les exigences de l'approche par modèles internes (IMA)", "Situer le calendrier européen"],
    sections: [
      { h: "Pourquoi la FRTB ?", html: `
        <p>La crise de 2008 a montré les faiblesses de Bâle 2.5 : frontière poreuse entre portefeuille de négociation et portefeuille bancaire (arbitrage réglementaire), VaR insensible aux queues, horizon de 10 jours uniforme quelle que soit la liquidité des actifs.</p>
        <p>La FRTB, finalisée par le Comité de Bâle en janvier 2019 (BCBS d457), répond par trois axes : une <strong>frontière</strong> plus stricte entre trading book et banking book, une <strong>approche standard</strong> sensible au risque et une <strong>approche modèles internes</strong> fondée sur l'ES avec des horizons de liquidité différenciés.</p>` },
      { h: "L'approche standard (SA)", html: `
        <p>Le capital SA est la somme de trois blocs :</p>
        <div class="f">Capital SA = SbM + DRC + RRAO</div>
        <ul>
          <li><strong>SbM</strong> (Sensitivities-based Method) : agrégation des sensibilités <em>delta</em>, <em>vega</em> et <em>curvature</em> par classe de risque (taux, spread de crédit non titrisé, titrisation, actions, matières premières, change), avec pondérations et corrélations réglementaires, calculées sous trois scénarios de corrélation (bas, moyen, élevé) ;</li>
          <li><strong>DRC</strong> (Default Risk Charge) : risque de défaut soudain des émetteurs (crédit et actions) ;</li>
          <li><strong>RRAO</strong> (Residual Risk Add-On) : risques résiduels des produits exotiques non captés par les sensibilités.</li>
        </ul>` },
      { h: "L'approche modèles internes (IMA)", html: `
        <ul>
          <li><strong>ES 97,5 %</strong> calibrée sur une période de stress, avec des <strong>horizons de liquidité</strong> de 10, 20, 40, 60 ou 120 jours selon le facteur de risque ;</li>
          <li>Approbation <strong>desk par desk</strong>, conditionnée à un backtesting et au test d'<strong>attribution du P&amp;L</strong> (PLA), qui compare le P&amp;L hypothétique au P&amp;L théorique du modèle de risque via la corrélation de Spearman et la statistique de Kolmogorov-Smirnov ;</li>
          <li>Les facteurs de risque <strong>non modélisables</strong> (NMRF), faute d'observations de prix réelles suffisantes, sont capitalisés par un scénario de stress dédié (SES) ;</li>
          <li>Un modèle <strong>DRC interne</strong> remplace l'IRC de Bâle 2.5.</li>
        </ul>` },
      { h: "Calendrier européen", html: `
        <p>Dans l'Union européenne, la quasi-totalité du paquet bancaire CRR3/CRD6 s'applique depuis le 1<sup>er</sup> janvier 2025, mais l'application de la FRTB pour le calcul des exigences de fonds propres a été reportée à deux reprises par actes délégués de la Commission, jusqu'au <strong>1<sup>er</sup> janvier 2027</strong>, afin de préserver l'équité de concurrence avec les autres juridictions.</p>
        <p>En juin 2026, la Commission a adopté un nouvel acte délégué introduisant des <strong>aménagements ciblés et temporaires</strong> (pour une durée de trois ans) de l'application de la FRTB, sans modifier les règles elles-mêmes. Les États-Unis et le Royaume-Uni suivent leur propre calendrier.</p>
        <p class="note">Point de vigilance : ce calendrier évolue ; vérifie toujours les textes en vigueur (CRR, actes délégués, publications de l'EBA) avant une décision opérationnelle.</p>` }
    ],
    points: ["Capital SA = SbM + DRC + RRAO", "IMA : ES 97,5 %, horizons de liquidité, PLA et backtesting par desk, NMRF", "UE : application de la FRTB au 1er janvier 2027"]
  }],
  quiz: [
    { q: "Une VaR 99 % à 1 jour de 2 M€ signifie que :", o: ["La perte maximale possible sur un jour est de 2 M€", "Dans 99 % des cas, la perte sur un jour n'excédera pas 2 M€", "La perte moyenne au-delà du seuil de 1 % est de 2 M€", "La perte attendue sur un jour est de 2 M€"], c: 1, e: "La VaR est un quantile : elle borne la perte avec une probabilité de 99 %, mais ne dit rien de son ampleur au-delà. La perte moyenne dans la queue correspond à l'Expected Shortfall." },
    { q: "Sous l'hypothèse de rendements i.i.d., comment passer d'une VaR 1 jour à une VaR 10 jours ?", o: ["Multiplier par 10", "Multiplier par √10", "Multiplier par ln(10)", "Multiplier par 10/252"], c: 1, e: "La variance croît linéairement avec le temps pour des rendements indépendants ; l'écart-type, donc la VaR, croît comme la racine carrée de l'horizon." },
    { q: "Pourquoi la FRTB remplace-t-elle la VaR 99 % par l'ES 97,5 % ?", o: ["L'ES est plus simple à calculer", "L'ES capture la sévérité des pertes extrêmes et est sous-additive", "L'ES produit toujours moins de capital", "L'ES ne nécessite pas de backtesting"], c: 1, e: "L'ES mesure la perte moyenne dans la queue et respecte la sous-additivité (mesure cohérente). Sous loi normale, l'ES 97,5 % est proche de la VaR 99 %, d'où le choix du niveau." },
    { q: "Sur 250 jours, une VaR 99 % a été dépassée 7 fois. Dans quelle zone de Bâle se situe le modèle ?", o: ["Verte", "Jaune", "Rouge", "Aucune : le test n'est pas applicable"], c: 1, e: "La zone jaune couvre 5 à 9 exceptions et entraîne une majoration progressive du multiplicateur de capital. La zone rouge débute à 10 exceptions." },
    { q: "Dans l'approche standard FRTB, quelle composante capte le risque de défaut soudain des émetteurs ?", o: ["La curvature", "Le RRAO", "La DRC", "Le SES"], c: 2, e: "La Default Risk Charge (DRC) capitalise le risque de défaut (jump-to-default). Le RRAO couvre les risques résiduels des produits exotiques ; le SES concerne les facteurs non modélisables en IMA." }
  ]
},
{
  id: "credit",
  num: 2,
  titre: "Crédit et contrepartie",
  accroche: "Des paramètres PD/LGD/EAD à la formule IRB, puis du risque de contrepartie aux ajustements xVA.",
  couleur: "#7a3e1d",
  calcs: ["irb", "cva"],
  lecons: [
  {
    id: "m2-l1",
    titre: "Paramètres de risque et approche IRB",
    duree: 30,
    objectifs: ["Définir PD, LGD, EAD et M", "Distinguer perte attendue et perte inattendue", "Lire la formule de pondération IRB"],
    sections: [
      { h: "Les paramètres de risque", html: `
        <ul>
          <li><strong>PD</strong> (Probability of Default) : probabilité de défaut à un an de l'emprunteur ;</li>
          <li><strong>LGD</strong> (Loss Given Default) : part de l'exposition perdue en cas de défaut, après recouvrements et sûretés ;</li>
          <li><strong>EAD</strong> (Exposure at Default) : exposition au moment du défaut, y compris la part tirée des engagements hors bilan (via un facteur de conversion, CCF) ;</li>
          <li><strong>M</strong> (Maturité effective) : plus la maturité est longue, plus le risque de migration de notation est élevé.</li>
        </ul>` },
      { h: "Perte attendue et perte inattendue", html: `
        <div class="f">EL = PD × LGD × EAD</div>
        <p>La <strong>perte attendue</strong> (EL) est un coût du métier : elle doit être couverte par la tarification et les provisions (IFRS 9). Les <strong>fonds propres</strong> couvrent la <strong>perte inattendue</strong> (UL), c'est-à-dire l'écart entre une perte extrême (quantile 99,9 %) et la perte attendue.</p>
        <p>Exemple : PD 2 %, LGD 45 %, EAD 10 M€ → EL = 0,02 × 0,45 × 10 M€ = 90 000 €.</p>` },
      { h: "La formule IRB (modèle ASRF de Vasicek)", html: `
        <p>La pondération IRB repose sur un modèle à un facteur de risque systématique (Asymptotic Single Risk Factor). L'exigence de capital par unité d'EAD vaut :</p>
        <div class="f">K = [ LGD · N( (G(PD) + √R · G(0,999)) / √(1 − R) ) − PD · LGD ] × (1 + (M − 2,5)·b) / (1 − 1,5·b)</div>
        <p>où N est la fonction de répartition de la loi normale centrée réduite, G son inverse, R la corrélation d'actifs (de 12 % à 24 % pour les entreprises, décroissante avec la PD) et b l'ajustement de maturité. On obtient ensuite <strong>RWA = K × 12,5 × EAD</strong>.</p>
        <p>Le calculateur IRB de cette application te permet d'explorer l'effet de chaque paramètre.</p>` },
      { h: "IRB fondation, IRB avancé et CRR3", html: `
        <p>En <strong>IRB fondation</strong> (F-IRB), la banque estime seulement la PD ; LGD et CCF sont réglementaires. En <strong>IRB avancé</strong> (A-IRB), elle estime aussi LGD, EAD/CCF et M.</p>
        <p>CRR3 restreint l'usage des modèles internes : suppression de l'A-IRB pour certaines classes (grandes entreprises, institutions financières), <strong>planchers de paramètres</strong> (input floors, par exemple PD minimale de 0,05 %) et <strong>output floor</strong>, abordé au module 4.</p>` }
    ],
    points: ["EL = PD × LGD × EAD, couverte par les provisions et la tarification", "Les fonds propres couvrent la perte inattendue (quantile 99,9 %)", "RWA = K × 12,5 × EAD"]
  },
  {
    id: "m2-l2",
    titre: "Risque de contrepartie : expositions, SA-CCR et collatéral",
    duree: 25,
    objectifs: ["Définir les métriques d'exposition (EE, EPE, PFE, EEPE)", "Comprendre la structure de SA-CCR", "Mesurer l'effet du netting et du collatéral"],
    sections: [
      { h: "Spécificité du risque de contrepartie", html: `
        <p>Sur un dérivé, l'exposition est <strong>bilatérale et aléatoire</strong> : elle dépend de la valeur de marché future du contrat, positive ou négative. On ne perd que si la contrepartie fait défaut alors que la valeur du contrat est positive pour soi.</p>
        <table class="t"><thead><tr><th>Métrique</th><th>Définition</th></tr></thead><tbody>
          <tr><td><strong>EE(t)</strong></td><td>Exposition attendue : moyenne de max(V<sub>t</sub>, 0) à la date t</td></tr>
          <tr><td><strong>PFE(t)</strong></td><td>Exposition potentielle future : quantile élevé (95 % ou 99 %) de l'exposition</td></tr>
          <tr><td><strong>EPE</strong></td><td>Moyenne temporelle de l'EE sur un horizon</td></tr>
          <tr><td><strong>EEPE</strong></td><td>Moyenne de l'EE « effective » (non décroissante) sur la première année ; base de l'approche modèle interne (IMM), avec EAD = α × EEPE</td></tr>
        </tbody></table>` },
      { h: "L'approche standard SA-CCR", html: `
        <div class="f">EAD = α × (RC + PFE), avec α = 1,4</div>
        <ul>
          <li><strong>RC</strong> (Replacement Cost) : coût de remplacement actuel, net du collatéral ; pour un ensemble non margé, RC = max(V − C, 0) ;</li>
          <li><strong>PFE</strong> = multiplicateur × AddOn agrégé. Les add-ons sont calculés par classe d'actifs (taux, change, crédit, actions, matières premières) et par ensemble de couverture ; le multiplicateur reconnaît partiellement la sur-collatéralisation ou une valeur négative du portefeuille.</li>
        </ul>
        <p>SA-CCR a remplacé la méthode de l'exposition courante (CEM) et la méthode standard (SM) dans l'UE depuis CRR2.</p>` },
      { h: "Netting et collatéral", html: `
        <p>Un <strong>accord de compensation</strong> (ISDA Master Agreement) permet de raisonner sur la valeur nette du portefeuille, et non contrat par contrat. Le <strong>CSA</strong> (Credit Support Annex) organise les échanges de collatéral :</p>
        <ul>
          <li><strong>Marge de variation</strong> (VM) : suit la valeur de marché ; paramétrée par le seuil (threshold), le montant minimal de transfert (MTA) et les décotes ;</li>
          <li><strong>Marge initiale</strong> (IM) : couvre la variation potentielle de valeur pendant la période de liquidation ; obligatoire pour les dérivés non compensés centralement des grandes contreparties (règlement EMIR) ;</li>
          <li><strong>MPOR</strong> (Margin Period of Risk) : période entre le dernier échange de collatéral réussi et la clôture ou le remplacement des positions après défaut (10 jours minimum par défaut pour les dérivés bilatéraux margés).</li>
        </ul>` }
    ],
    points: ["Le risque de contrepartie est bilatéral et dépend de la valeur future", "SA-CCR : EAD = 1,4 × (RC + PFE)", "Le collatéral ne supprime pas l'exposition pendant la MPOR"]
  },
  {
    id: "m2-l3",
    titre: "Les ajustements de valorisation xVA",
    duree: 25,
    objectifs: ["Calculer une CVA simplifiée", "Distinguer CVA, DVA, FVA, MVA et KVA", "Connaître le cadre de capital CVA sous CRR3"],
    sections: [
      { h: "La CVA", html: `
        <p>La <strong>CVA</strong> (Credit Valuation Adjustment) est la valeur de marché du risque de défaut de la contrepartie. Elle diminue la juste valeur du portefeuille de dérivés :</p>
        <div class="f">CVA ≈ LGD × Σ<sub>i</sub> EE(t<sub>i</sub>) × DF(t<sub>i</sub>) × [ S(t<sub>i−1</sub>) − S(t<sub>i</sub>) ]</div>
        <p>où S(t) est la probabilité de survie de la contrepartie, souvent extraite du spread de CDS par l'approximation λ ≈ spread / LGD, avec S(t) = e<sup>−λt</sup>, et DF le facteur d'actualisation.</p>
        <p>La CVA augmente avec l'exposition attendue, la maturité et l'élargissement du spread de crédit de la contrepartie.</p>` },
      { h: "La famille xVA", html: `
        <table class="t"><thead><tr><th>Ajustement</th><th>Ce qu'il mesure</th></tr></thead><tbody>
          <tr><td><strong>DVA</strong></td><td>Symétrique de la CVA : bénéfice lié à son propre risque de défaut (exposition négative)</td></tr>
          <tr><td><strong>FVA</strong></td><td>Coût (ou bénéfice) du financement des positions non collatéralisées</td></tr>
          <tr><td><strong>MVA</strong></td><td>Coût de financement de la marge initiale déposée</td></tr>
          <tr><td><strong>KVA</strong></td><td>Coût du capital réglementaire immobilisé sur la durée de vie de l'opération</td></tr>
          <tr><td><strong>ColVA</strong></td><td>Effets des clauses de collatéral (taux de rémunération, options de choix du collatéral)</td></tr>
        </tbody></table>
        <p>Ces ajustements sont généralement pilotés par un <strong>desk xVA</strong> centralisé qui facture leur coût aux desks commerciaux.</p>` },
      { h: "Le capital pour risque de CVA", html: `
        <p>Pendant la crise de 2008, une part importante des pertes sur dérivés provenait des <strong>variations de CVA</strong> (dégradation du crédit des contreparties) et non des défauts eux-mêmes. Bâle III a donc introduit une exigence de fonds propres dédiée.</p>
        <p>Depuis CRR3, deux approches coexistent : l'approche de base <strong>BA-CVA</strong> (réduite ou complète, cette dernière reconnaissant les couvertures) et l'approche standard <strong>SA-CVA</strong>, fondée sur les sensibilités de la CVA comptable et soumise à approbation. L'approche par modèles internes n'est plus autorisée pour le risque de CVA.</p>` }
    ],
    points: ["CVA ≈ LGD × Σ EE × DF × PD marginale", "DVA, FVA, MVA, KVA complètent la valorisation", "CRR3 : BA-CVA ou SA-CVA, plus de modèles internes"]
  }],
  quiz: [
    { q: "PD = 2 %, LGD = 45 %, EAD = 10 M€. Quelle est la perte attendue ?", o: ["9 000 €", "90 000 €", "450 000 €", "900 000 €"], c: 1, e: "EL = 0,02 × 0,45 × 10 000 000 = 90 000 €." },
    { q: "En approche IRB fondation, la banque estime elle-même :", o: ["La PD uniquement", "La PD et la LGD", "La LGD et l'EAD", "Tous les paramètres"], c: 0, e: "En F-IRB, seule la PD est estimée en interne ; LGD et CCF sont fixés par la réglementation. L'A-IRB étend l'estimation à la LGD, à l'EAD et à la maturité." },
    { q: "Dans SA-CCR, quelle est la valeur du facteur α ?", o: ["1,0", "1,25", "1,4", "1,5"], c: 2, e: "EAD = α × (RC + PFE) avec α = 1,4, valeur reprise de l'approche modèle interne." },
    { q: "La MPOR (Margin Period of Risk) désigne :", o: ["La fréquence des appels de marge prévue au CSA", "La période entre le dernier échange de collatéral réussi et la clôture des positions après défaut", "La maturité résiduelle moyenne du portefeuille", "Le délai de règlement-livraison des titres remis en collatéral"], c: 1, e: "Pendant la MPOR, l'exposition n'est plus couverte par de nouveaux appels de marge : c'est la période de risque résiduel malgré le collatéral." },
    { q: "Toutes choses égales par ailleurs, la CVA augmente lorsque :", o: ["Le spread de CDS de la contrepartie se resserre", "Le spread de CDS de la contrepartie s'élargit", "Le seuil du CSA est réduit à zéro", "La maturité du portefeuille diminue"], c: 1, e: "Un spread plus large implique une probabilité de défaut plus élevée, donc une CVA plus importante. Un seuil nul et une maturité plus courte réduisent au contraire l'exposition." }
  ]
},
{
  id: "alm",
  num: 3,
  titre: "ALM et liquidité",
  accroche: "Piloter le risque de taux du portefeuille bancaire (IRRBB) et le risque de liquidité (LCR, NSFR).",
  couleur: "#2e6b4f",
  calcs: ["eve", "lcr"],
  lecons: [
  {
    id: "m3-l1",
    titre: "Le risque de taux du portefeuille bancaire (IRRBB)",
    duree: 25,
    objectifs: ["Identifier les sources de l'IRRBB", "Distinguer approche EVE et approche NII", "Connaître les scénarios et les tests prudentiels (SOT)"],
    sections: [
      { h: "Sources du risque de taux", html: `
        <ul>
          <li><strong>Risque de gap</strong> (ou de révision) : décalage des dates de refixation entre actifs et passifs ; c'est le risque de la transformation ;</li>
          <li><strong>Risque de base</strong> : actifs et passifs indexés sur des références différentes (€STR, Euribor 3 mois, taux réglementés) ;</li>
          <li><strong>Risque d'option</strong> : options explicites (caps, floors) ou comportementales (remboursements anticipés de crédits immobiliers, retraits de dépôts à vue).</li>
        </ul>` },
      { h: "Deux angles complémentaires : EVE et NII", html: `
        <table class="t"><thead><tr><th></th><th>EVE (Economic Value of Equity)</th><th>NII (Net Interest Income)</th></tr></thead><tbody>
          <tr><td>Question</td><td>Que vaut le bilan si les taux bougent ?</td><td>Que devient la marge d'intérêts ?</td></tr>
          <tr><td>Horizon</td><td>Durée de vie totale des flux</td><td>Généralement 1 à 3 ans</td></tr>
          <tr><td>Nature</td><td>Valeur actuelle des flux (vision liquidative)</td><td>Résultat comptable (vision de continuité)</td></tr>
        </tbody></table>
        <p>Les deux mesures n'ont pas nécessairement le même signe : une hausse des taux peut réduire l'EVE d'une banque de transformation tout en améliorant sa marge à court terme.</p>` },
      { h: "Scénarios et tests prudentiels (SOT)", html: `
        <p>Six scénarios de choc du Comité de Bâle sont utilisés pour l'EVE : <strong>hausse parallèle, baisse parallèle, pentification, aplatissement, hausse des taux courts, baisse des taux courts</strong>. Pour l'euro, l'amplitude est de 200 pb pour le choc parallèle, 250 pb pour les taux courts et 100 pb pour les taux longs.</p>
        <p>Dans l'UE, les normes techniques de l'EBA définissent deux <strong>tests prudentiels de valeurs aberrantes</strong> (SOT) :</p>
        <ul>
          <li><strong>SOT EVE</strong> : baisse de l'EVE supérieure à <strong>15 % des fonds propres Tier 1</strong> sous l'un des six scénarios ;</li>
          <li><strong>SOT NII</strong> : baisse importante du NII à un an sous les scénarios parallèles, seuil fixé à <strong>5 % du Tier 1</strong>.</li>
        </ul>
        <p>Le dépassement déclenche un examen dans le cadre du SREP et peut conduire à des mesures prudentielles.</p>` },
      { h: "Les dépôts sans échéance (NMD)", html: `
        <p>Les dépôts à vue n'ont pas d'échéance contractuelle, mais une part est stable et peu sensible aux taux. Leur <strong>modélisation comportementale</strong> (part stable, écoulement, élasticité de la rémunération) est l'hypothèse la plus structurante de l'ALM. Le régulateur l'encadre, notamment en plafonnant la maturité moyenne de révision des dépôts modélisés (5 ans dans le cadre de l'EBA).</p>` }
    ],
    points: ["Trois sources : gap, base, option", "EVE = vision valeur ; NII = vision marge", "SOT : EVE −15 % du Tier 1, NII −5 % du Tier 1"]
  },
  {
    id: "m3-l2",
    titre: "Gaps de taux et duration",
    duree: 20,
    objectifs: ["Construire et lire un gap de taux", "Estimer la sensibilité de l'EVE par la duration", "Mettre en place une couverture"],
    sections: [
      { h: "Le gap (impasse) de taux", html: `
        <p>Le gap de taux répartit actifs et passifs par <strong>date de refixation</strong> (et non par échéance de liquidité) dans des tranches de maturité. Pour chaque tranche :</p>
        <div class="f">Gap(tranche) = Actifs à taux fixe − Passifs à taux fixe</div>
        <p>Un gap positif (excédent d'actifs à taux fixe) expose à une <strong>hausse</strong> des taux en valeur ; un gap négatif expose à une baisse. L'impact sur la marge d'une tranche courte s'approxime par ΔNII ≈ Gap<sub>taux variable</sub> × Δr × durée restante.</p>` },
      { h: "Duration et sensibilité de l'EVE", html: `
        <p>La <strong>duration modifiée</strong> D mesure la sensibilité relative d'une valeur à un mouvement parallèle de taux : ΔV/V ≈ −D × Δy. Appliquée au bilan :</p>
        <div class="f">ΔEVE ≈ −( D<sub>A</sub> × A − D<sub>P</sub> × P ) × Δy</div>
        <p>Exemple : A = 1 000 M€ de duration 4,5 ; P = 920 M€ de duration 1,8 ; choc +200 pb → ΔEVE ≈ −(4 500 − 1 656) × 0,02 ≈ −56,9 M€. Avec un Tier 1 de 80 M€, la baisse représente 71 % du Tier 1, très au-delà du seuil SOT de 15 %.</p>
        <p class="note">La duration reste une approximation au premier ordre : la convexité et les options comportementales doivent être prises en compte pour les chocs importants.</p>` },
      { h: "Couvrir le risque de taux", html: `
        <p>L'instrument principal est le <strong>swap de taux</strong> : une banque dont les actifs sont longs à taux fixe paie le fixe et reçoit le variable pour réduire sa duration d'actif. On le documente souvent en <strong>macro-couverture</strong> de juste valeur (carve-out IAS 39 en Europe). Caps et floors couvrent le risque optionnel.</p>
        <p>La gouvernance repose sur des <strong>limites</strong> de sensibilité (EVE, NII), un <strong>comité ALM</strong> (ALCO) et des tests réguliers des hypothèses comportementales.</p>` }
    ],
    points: ["Le gap se construit par date de refixation", "ΔEVE ≈ −(D_A·A − D_P·P)·Δy", "Swaps payeurs de fixe pour réduire une exposition à la hausse des taux"]
  },
  {
    id: "m3-l3",
    titre: "Le risque de liquidité : LCR, NSFR et ILAAP",
    duree: 25,
    objectifs: ["Calculer un LCR", "Comprendre le NSFR", "Situer l'ILAAP et le plan de financement d'urgence"],
    sections: [
      { h: "Le ratio de liquidité à court terme (LCR)", html: `
        <div class="f">LCR = Stock d'actifs liquides de haute qualité (HQLA) / Sorties nettes de trésorerie sur 30 jours de stress ≥ 100 %</div>
        <p>Les HQLA sont classés en trois niveaux :</p>
        <ul>
          <li><strong>Niveau 1</strong> : réserves en banque centrale, titres souverains de qualité, sans décote ni plafond ;</li>
          <li><strong>Niveau 2A</strong> : décote de 15 % (par exemple certaines obligations sécurisées) ;</li>
          <li><strong>Niveau 2B</strong> : décotes de 25 % à 50 % (titrisations éligibles, obligations d'entreprises, actions).</li>
        </ul>
        <p>Les actifs de niveau 2 sont plafonnés à 40 % du stock (le niveau 2B à 15 %). Les entrées de trésorerie sont plafonnées à <strong>75 % des sorties</strong>, sauf exemptions.</p>` },
      { h: "Le ratio de financement stable net (NSFR)", html: `
        <div class="f">NSFR = Financement stable disponible (ASF) / Financement stable requis (RSF) ≥ 100 %</div>
        <p>Le NSFR, horizon un an, limite la transformation de maturité. Chaque passif reçoit un facteur ASF selon sa stabilité (100 % pour les fonds propres, 90 à 95 % pour les dépôts de détail stables) ; chaque actif reçoit un facteur RSF selon sa liquidité (0 % pour les réserves en banque centrale, 65 % pour les prêts immobiliers résidentiels éligibles, 85 % pour la plupart des autres prêts). Il s'applique dans l'UE depuis juin 2021 (CRR2).</p>` },
      { h: "ILAAP, stress tests et plan d'urgence", html: `
        <p>Les ratios réglementaires ne suffisent pas. L'<strong>ILAAP</strong> (Internal Liquidity Adequacy Assessment Process) est le processus interne par lequel la banque démontre au superviseur que sa liquidité et son financement sont adéquats : appétit pour le risque de liquidité, stress tests internes (idiosyncratiques, systémiques, combinés), horizon de survie, coussin de liquidité, prix de transfert interne de la liquidité (FTP).</p>
        <p>Le <strong>plan de financement d'urgence</strong> (CFP) définit les indicateurs d'alerte, la gouvernance de crise et les mesures mobilisables (mise en pension, mobilisation de créances auprès de la banque centrale, cession d'actifs).</p>` }
    ],
    points: ["LCR = HQLA / sorties nettes 30 jours ≥ 100 %", "Entrées plafonnées à 75 % des sorties ; niveau 2 ≤ 40 %, 2B ≤ 15 %", "NSFR = ASF / RSF ≥ 100 % sur un an"]
  }],
  quiz: [
    { q: "Une banque finance des crédits immobiliers longs à taux fixe par des ressources courtes. Une hausse parallèle des taux :", o: ["Augmente son EVE", "Réduit son EVE", "N'a aucun effet sur l'EVE", "N'affecte que son LCR"], c: 1, e: "La duration de l'actif étant supérieure à celle du passif, la valeur des actifs baisse davantage que celle des passifs : l'EVE diminue." },
    { q: "Selon les normes de l'EBA, le SOT EVE est déclenché lorsque l'EVE baisse de plus de :", o: ["5 % du Tier 1", "10 % des fonds propres totaux", "15 % du Tier 1", "20 % du CET1"], c: 2, e: "Le seuil SOT EVE est de 15 % du Tier 1 (l'ancien critère de 20 % des fonds propres a été abandonné). Le SOT NII est fixé à 5 % du Tier 1." },
    { q: "Quel est l'horizon de stress du LCR ?", o: ["7 jours", "30 jours calendaires", "90 jours", "1 an"], c: 1, e: "Le LCR mesure la capacité à faire face à 30 jours calendaires de stress de liquidité. L'horizon d'un an correspond au NSFR." },
    { q: "Dans le LCR, les entrées de trésorerie sont en principe plafonnées à :", o: ["50 % des sorties", "75 % des sorties", "100 % des sorties", "Aucun plafond"], c: 1, e: "Le plafond de 75 % garantit qu'une banque détient toujours un stock minimal de HQLA couvrant au moins 25 % des sorties." },
    { q: "Le NSFR rapporte :", o: ["Les HQLA aux sorties de trésorerie", "Le financement stable disponible au financement stable requis", "Les fonds propres Tier 1 à l'exposition totale", "Les dépôts aux crédits"], c: 1, e: "NSFR = ASF / RSF ≥ 100 %. Le rapport Tier 1 / exposition totale est le ratio de levier ; le rapport crédits / dépôts est un indicateur de gestion, non un ratio réglementaire." }
  ]
},
{
  id: "regl",
  num: 4,
  titre: "Réglementation et gouvernance",
  accroche: "Bâle III et CRR3, reporting et BCBS 239, appétit pour le risque et organisation de la fonction risques.",
  couleur: "#5a3d7a",
  calcs: [],
  lecons: [
  {
    id: "m4-l1",
    titre: "Bâle III et le paquet bancaire CRR3/CRD6",
    duree: 30,
    objectifs: ["Connaître les trois piliers et les exigences de fonds propres", "Comprendre l'output floor", "Identifier les principaux changements de CRR3"],
    sections: [
      { h: "Les trois piliers", html: `
        <ul>
          <li><strong>Pilier 1</strong> : exigences minimales de fonds propres pour les risques de crédit, de marché, opérationnel et de CVA ;</li>
          <li><strong>Pilier 2</strong> : processus de surveillance prudentielle (SREP), ICAAP/ILAAP, exigences additionnelles (P2R) et recommandations (P2G) ;</li>
          <li><strong>Pilier 3</strong> : discipline de marché par la publication d'informations normalisées.</li>
        </ul>` },
      { h: "Ratios et coussins", html: `
        <table class="t"><thead><tr><th>Exigence (en % des RWA)</th><th>Niveau</th></tr></thead><tbody>
          <tr><td>CET1 minimum (Pilier 1)</td><td>4,5 %</td></tr>
          <tr><td>Tier 1 minimum</td><td>6 %</td></tr>
          <tr><td>Fonds propres totaux minimum</td><td>8 %</td></tr>
          <tr><td>Coussin de conservation (CET1)</td><td>2,5 %</td></tr>
          <tr><td>Coussin contracyclique</td><td>0 à 2,5 % (fixé par chaque pays)</td></tr>
          <tr><td>Coussins systémiques (G-SII, O-SII, risque systémique)</td><td>Selon l'établissement</td></tr>
        </tbody></table>
        <p>S'y ajoutent le <strong>ratio de levier</strong> (Tier 1 / exposition totale ≥ 3 %, avec un coussin supplémentaire pour les G-SII), les ratios de liquidité (module 3) et, en résolution, les exigences MREL/TLAC.</p>` },
      { h: "L'output floor", html: `
        <p>L'output floor limite l'avantage procuré par les modèles internes : les RWA totaux ne peuvent descendre sous <strong>72,5 % des RWA calculés en approches standard</strong>.</p>
        <div class="f">RWA = max( RWA<sub>modèles internes</sub> ; x × RWA<sub>standard</sub> )</div>
        <p>Dans l'UE, le facteur x monte progressivement : <strong>50 % en 2025</strong>, 55 % en 2026, 60 % en 2027, 65 % en 2028, 70 % en 2029 et <strong>72,5 % à partir de 2030</strong>. Des dispositions transitoires (article 465 du CRR) atténuent l'impact, notamment un plafonnement de la hausse à 125 % des RWA non planchers jusqu'à fin 2029.</p>` },
      { h: "Autres changements majeurs de CRR3", html: `
        <ul>
          <li><strong>Risque de crédit</strong> : approche standard plus granulaire (immobilier, notations externes, financements spécialisés) et restrictions des modèles internes ;</li>
          <li><strong>Risque opérationnel</strong> : une approche standard unique fondée sur l'indicateur d'activité (Business Indicator Component), en remplacement des approches antérieures, y compris l'AMA ;</li>
          <li><strong>CVA</strong> : approches BA-CVA et SA-CVA (module 2) ;</li>
          <li><strong>Risque de marché</strong> : FRTB, dont l'application est reportée au 1<sup>er</sup> janvier 2027 (module 1) ;</li>
          <li><strong>ESG</strong> : intégration des risques environnementaux, sociaux et de gouvernance dans la gestion des risques et les publications.</li>
        </ul>` }
    ],
    points: ["CET1 4,5 % ; Tier 1 6 % ; total 8 % ; conservation 2,5 %", "Output floor : 50 % en 2025, 72,5 % en 2030", "Levier ≥ 3 % du Tier 1"]
  },
  {
    id: "m4-l2",
    titre: "Reporting réglementaire et BCBS 239",
    duree: 20,
    objectifs: ["Situer COREP, FINREP et le Pilier 3", "Connaître les principes BCBS 239", "Identifier les attentes actuelles du superviseur"],
    sections: [
      { h: "Le reporting prudentiel", html: `
        <ul>
          <li><strong>COREP</strong> (Common Reporting) : fonds propres, exigences par risque, grands risques, levier, liquidité (LCR, NSFR, ALMM) ;</li>
          <li><strong>FINREP</strong> (Financial Reporting) : informations financières détaillées selon les normes comptables ;</li>
          <li><strong>Pilier 3</strong> : publications au marché, harmonisées par les normes techniques de l'EBA.</li>
        </ul>
        <p>Les formats et la taxonomie sont définis par l'EBA (cadre de reporting, format XBRL), et transmis en France à l'ACPR ou, pour les grandes banques de la zone euro, via le mécanisme de supervision unique (MSU) de la BCE.</p>` },
      { h: "BCBS 239 : 14 principes", html: `
        <p>Publiés par le Comité de Bâle en janvier 2013, les principes pour l'agrégation efficace des données de risque et le reporting des risques (« RDARR ») sont regroupés en quatre catégories :</p>
        <table class="t"><thead><tr><th>Catégorie</th><th>Principes</th></tr></thead><tbody>
          <tr><td>Gouvernance et infrastructure</td><td>1. Gouvernance ; 2. Architecture des données et infrastructure informatique</td></tr>
          <tr><td>Capacités d'agrégation des données</td><td>3. Exactitude et intégrité ; 4. Exhaustivité ; 5. Rapidité ; 6. Adaptabilité</td></tr>
          <tr><td>Pratiques de reporting</td><td>7. Exactitude ; 8. Exhaustivité ; 9. Clarté et utilité ; 10. Fréquence ; 11. Diffusion</td></tr>
          <tr><td>Surveillance prudentielle</td><td>12. Revue ; 13. Mesures correctrices ; 14. Coopération entre autorités</td></tr>
        </tbody></table>` },
      { h: "Les attentes du superviseur", html: `
        <p>La mise en conformité reste incomplète dans de nombreuses banques. La BCE a publié en 2024 un guide sur l'agrégation des données de risque et le reporting, qui insiste sur la <strong>responsabilité de l'organe de direction</strong>, le périmètre (rapports de gestion, réglementaires et financiers clés), le <strong>lignage des données</strong> de bout en bout, la qualité des données mesurée par des indicateurs et la capacité à produire des rapports en situation de crise.</p>
        <p>Concrètement, cela se traduit par des dictionnaires de données, des contrôles de réconciliation (risques, finance, comptabilité), des propriétaires de données identifiés et des tableaux de bord de qualité.</p>` }
    ],
    points: ["COREP, FINREP, Pilier 3 : formats harmonisés par l'EBA", "BCBS 239 : 14 principes en 4 catégories", "Priorités : gouvernance, lignage, qualité des données"]
  },
  {
    id: "m4-l3",
    titre: "Appétit pour le risque et gouvernance",
    duree: 20,
    objectifs: ["Construire un dispositif d'appétit pour le risque", "Comprendre le modèle des trois lignes", "Articuler ICAAP, stress tests et SREP"],
    sections: [
      { h: "Le cadre d'appétit pour le risque (RAF)", html: `
        <p>Le <strong>RAF</strong> (Risk Appetite Framework) relie la stratégie au niveau de risque accepté. On distingue :</p>
        <ul>
          <li>la <strong>capacité</strong> de risque : le maximum supportable compte tenu des fonds propres, de la liquidité et des contraintes réglementaires ;</li>
          <li>l'<strong>appétit</strong> : le niveau de risque que la banque choisit de prendre pour atteindre ses objectifs ;</li>
          <li>la <strong>tolérance</strong> : l'écart acceptable autour de l'appétit, souvent matérialisé par des seuils d'alerte ;</li>
          <li>les <strong>limites</strong> : la déclinaison opérationnelle par métier, desk, contrepartie ou secteur.</li>
        </ul>
        <p>La <strong>déclaration d'appétit</strong> (RAS), validée par le conseil d'administration, combine indicateurs quantitatifs (CET1, LCR, VaR, concentration) et énoncés qualitatifs (risque de réputation, conformité).</p>` },
      { h: "Le modèle des trois lignes", html: `
        <ol>
          <li><strong>Première ligne</strong> : les métiers, propriétaires des risques qu'ils prennent, avec leurs contrôles permanents de premier niveau ;</li>
          <li><strong>Deuxième ligne</strong> : la fonction gestion des risques (sous l'autorité du CRO) et la conformité, qui définissent le cadre, mesurent, challengent et contrôlent de manière indépendante ;</li>
          <li><strong>Troisième ligne</strong> : l'audit interne, qui évalue périodiquement l'efficacité de l'ensemble du dispositif.</li>
        </ol>
        <p>Le <strong>CRO</strong> doit disposer d'une indépendance réelle, d'un accès direct au conseil et au comité des risques, et ne peut être révoqué sans information préalable de l'organe de surveillance.</p>` },
      { h: "ICAAP, stress tests et SREP", html: `
        <p>L'<strong>ICAAP</strong> est l'évaluation interne de l'adéquation du capital, selon une perspective <strong>normative</strong> (respect des exigences réglementaires sur plusieurs années) et une perspective <strong>économique</strong> (couverture de tous les risques matériels par le capital interne).</p>
        <p>Les <strong>stress tests</strong> de l'EBA et de la BCE projettent bilan, résultat et ratios de solvabilité sur trois ans sous un scénario central et un scénario adverse. Leurs résultats alimentent le <strong>SREP</strong>, au terme duquel le superviseur fixe notamment l'exigence de Pilier 2 (P2R) et la recommandation (P2G).</p>` }
    ],
    points: ["Capacité ≥ tolérance ≥ appétit → limites", "Trois lignes : métiers, risques et conformité, audit interne", "ICAAP normatif et économique ; stress tests et SREP"]
  }],
  quiz: [
    { q: "Quelle est l'exigence minimale de CET1 au titre du Pilier 1 ?", o: ["2,5 % des RWA", "4,5 % des RWA", "6 % des RWA", "8 % des RWA"], c: 1, e: "4,5 % pour le CET1, 6 % pour le Tier 1 et 8 % pour les fonds propres totaux, auxquels s'ajoutent les coussins (dont la conservation à 2,5 %)." },
    { q: "Dans l'UE, l'output floor atteint son niveau définitif de 72,5 % :", o: ["Dès le 1er janvier 2025", "Le 1er janvier 2027", "Le 1er janvier 2030", "Il n'est pas appliqué dans l'UE"], c: 2, e: "Le facteur progresse de 50 % (2025) à 72,5 % (2030), par paliers annuels de 5 points jusqu'à 70 % en 2029." },
    { q: "BCBS 239 porte sur :", o: ["Le traitement prudentiel des crypto-actifs", "L'agrégation des données de risque et le reporting des risques", "Les exigences de marge pour les dérivés non compensés", "Le risque de taux du portefeuille bancaire"], c: 1, e: "Les 14 principes BCBS 239 (2013) visent la gouvernance, l'infrastructure, l'agrégation des données de risque et la qualité du reporting." },
    { q: "Dans le modèle des trois lignes, la deuxième ligne correspond à :", o: ["Les métiers et leurs contrôles de premier niveau", "La fonction gestion des risques et la conformité", "L'audit interne", "Le commissaire aux comptes"], c: 1, e: "La deuxième ligne définit le cadre et contrôle de façon indépendante. L'audit interne est la troisième ligne ; les commissaires aux comptes sont externes au dispositif." },
    { q: "Quel est le niveau minimal du ratio de levier au titre du Pilier 1 ?", o: ["1 %", "3 %", "5 %", "8 %"], c: 1, e: "Le ratio de levier (Tier 1 / exposition totale) doit être d'au moins 3 %, avec un coussin supplémentaire pour les établissements d'importance systémique mondiale." }
  ]
}];

window.CALCS = {
  var: { titre: "VaR et Expected Shortfall", module: "marche", desc: "VaR paramétrique et historique, Expected Shortfall et règle de la racine du temps." },
  irb: { titre: "Formule IRB (entreprises)", module: "credit", desc: "Pondération en risque, exigence de capital et perte attendue selon la formule de Bâle." },
  cva: { titre: "CVA simplifiée", module: "credit", desc: "CVA unilatérale à partir d'un profil d'exposition attendue et d'un spread de CDS." },
  eve: { titre: "Sensibilité de l'EVE", module: "alm", desc: "Approximation par la duration et comparaison au seuil SOT de 15 % du Tier 1." },
  lcr: { titre: "Ratio LCR", module: "alm", desc: "Stock de HQLA après décotes et plafonds, sorties nettes et ratio LCR." }
};
