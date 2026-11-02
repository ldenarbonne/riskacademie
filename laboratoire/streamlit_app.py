"""Laboratoire RiskAcadémie — point d'entrée Streamlit."""
import streamlit as st

st.set_page_config(page_title="Laboratoire RiskAcadémie", page_icon="📊", layout="wide")

pages = {
    "Laboratoire": [st.Page("vues/accueil.py", title="Accueil", default=True)],
    "Risque de marché": [
        st.Page("vues/var.py", title="VaR et Expected Shortfall"),
        st.Page("vues/backtesting.py", title="Backtesting de la VaR"),
    ],
    "Crédit et contrepartie": [
        st.Page("vues/irb.py", title="Formule IRB"),
        st.Page("vues/cva.py", title="Exposition et CVA"),
    ],
    "ALM et liquidité": [
        st.Page("vues/irrbb.py", title="IRRBB : six scénarios"),
        st.Page("vues/lcr.py", title="Ratio LCR"),
    ],
    "Autres risques": [
        st.Page("vues/oprisk.py", title="Risque opérationnel"),
        st.Page("vues/climat.py", title="Choc carbone"),
        st.Page("vues/modeles.py", title="Validation de modèle"),
    ],
}
nav = st.navigation(pages)

with st.sidebar:
    st.markdown("---")
    st.markdown("[← Retour aux cours RiskAcadémie](https://ldenarbonne.github.io/riskacademie/)")
    st.caption("Conçu par [Laurent Motais de Narbonne](https://www.linkedin.com/in/laurent-motais-de-narbonne/), "
               "Risk Manager Senior. Outil pédagogique : ne remplace pas un moteur de calcul réglementaire.")
nav.run()
