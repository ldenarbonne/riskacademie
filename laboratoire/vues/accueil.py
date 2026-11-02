import streamlit as st

st.title("Laboratoire RiskAcadémie")
st.markdown(
    "Ce laboratoire complète les [cours en ligne RiskAcadémie](https://ldenarbonne.github.io/riskacademie/) "
    "avec des outils Python plus avancés : simulation Monte-Carlo, analyse de vos propres séries de prix, "
    "backtesting statistique, profils d'exposition simulés et scénarios IRRBB du Comité de Bâle."
)
c1, c2, c3 = st.columns(3)
c1.markdown("**Risque de marché**\n\n- VaR paramétrique, historique et Monte-Carlo\n- Import de prix (CSV)\n- Backtesting : Kupiec, Christoffersen, zones de Bâle")
c2.markdown("**Crédit et ALM**\n\n- Formule IRB\n- EE, PFE et CVA d'un contrat à terme simulé\n- ΔEVE sous les six scénarios de Bâle\n- LCR")
c3.markdown("**Autres risques**\n\n- Capital opérationnel (BIC)\n- Choc carbone\n- Validation de modèle : ROC, Gini, tests binomial et de Jeffreys")
st.info("Le code source est ouvert : chaque calcul est implémenté dans `risklab/calculs.py` et couvert par des tests automatisés.")
