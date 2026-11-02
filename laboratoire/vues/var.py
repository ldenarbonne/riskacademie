import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("VaR et Expected Shortfall")
st.caption("Comparer les méthodes paramétrique, historique et Monte-Carlo sur un portefeuille linéaire.")

source = st.radio("Données", ["Portefeuille simulé", "Importer des prix (CSV)"], horizontal=True)
alpha = st.slider("Niveau de confiance", 0.90, 0.995, 0.99, 0.005, format="%.3f")
horizon = st.number_input("Horizon (jours ouvrés, règle de la racine du temps)", 1, 250, 10)

if source == "Portefeuille simulé":
    st.subheader("Portefeuille")
    actifs = pd.DataFrame({
        "Actif": ["Actions Europe", "Obligations souveraines", "Crédit IG"],
        "Position (€)": [5_000_000.0, 3_000_000.0, 2_000_000.0],
        "Volatilité annuelle (%)": [20.0, 6.0, 9.0],
    })
    actifs = st.data_editor(actifs, num_rows="dynamic", use_container_width=True)
    n = len(actifs)
    rho = st.slider("Corrélation uniforme entre actifs", -0.5, 0.95, 0.30, 0.05)
    loi = st.radio("Loi des rendements", ["normale", "student"], horizontal=True,
                   format_func=lambda x: "Normale" if x == "normale" else "Student (queues épaisses)")
    ddl = st.slider("Degrés de liberté (Student)", 3, 30, 4) if loi == "student" else 4
    pos = actifs["Position (€)"].to_numpy(float)
    vols = actifs["Volatilité annuelle (%)"].to_numpy(float) / 100 / np.sqrt(252)
    correl = np.full((n, n), rho); np.fill_diagonal(correl, 1.0)
    try:
        np.linalg.cholesky(correl)
    except np.linalg.LinAlgError:
        st.error("La matrice de corrélation n'est pas définie positive : augmente la corrélation."); st.stop()
    histo = c.simuler_rendements(500, vols, correl, loi, ddl, graine=1) @ pos
    mc = c.var_monte_carlo(pos, vols, correl, alpha, 50_000, loi, ddl)
    sd = np.std(histo, ddof=1)
    res = {
        "Paramétrique": c.var_es_parametrique(np.sqrt(pos @ (np.outer(vols, vols) * correl) @ pos), alpha, 1.0),
        "Historique (500 j simulés)": c.var_es_empirique(histo, alpha),
        "Monte-Carlo (50 000 tirages)": (mc["var"], mc["es"]),
    }
    pnl_graph = mc["pnl"]
else:
    st.markdown("Fichier CSV : une colonne de dates, puis une colonne de prix par actif (séparateur `,` ou `;`).")
    f = st.file_uploader("Fichier de prix", type=["csv"])
    if not f:
        st.stop()
    prix = pd.read_csv(f, sep=None, engine="python", index_col=0, parse_dates=True, decimal=",")
    prix = prix.apply(pd.to_numeric, errors="coerce").dropna(how="all")
    rend = c.rendements_depuis_prix(prix).dropna()
    st.write(f"{len(rend)} rendements journaliers pour {rend.shape[1]} actif(s).")
    pos = np.array([st.number_input(f"Position sur {col} (€)", value=1_000_000.0, key=col) for col in rend.columns])
    pnl = (np.exp(rend) - 1).to_numpy() @ pos
    sd = np.std(pnl, ddof=1)
    res = {"Paramétrique (volatilité empirique)": c.var_es_parametrique(sd, alpha, 1.0),
           "Historique": c.var_es_empirique(pnl, alpha)}
    pnl_graph = pnl

tab = pd.DataFrame({m: {"VaR 1 j (€)": v, "ES 1 j (€)": e, f"VaR {horizon} j (€)": v * np.sqrt(horizon),
                        f"ES {horizon} j (€)": e * np.sqrt(horizon)} for m, (v, e) in res.items()}).T
st.subheader("Résultats")
st.dataframe(tab.style.format(lambda x: fmt(x)), use_container_width=True)

var_ref = list(res.values())[-1][0]
fig = go.Figure()
fig.add_histogram(x=pnl_graph, nbinsx=120, marker_color="#1f4e79", opacity=0.75, name="P&L")
fig.add_vline(x=-var_ref, line_dash="dash", line_color="#b03a2e", annotation_text="−VaR")
fig.update_layout(height=340, margin=dict(t=20, b=20), xaxis_title="P&L journalier (€)", yaxis_title="Fréquence", showlegend=False)
st.plotly_chart(fig, use_container_width=True)
kurt = pd.Series(pnl_graph).kurt()
st.caption(f"Kurtosis en excès de la distribution : {fmt(kurt, 2)} (0 pour une loi normale). "
           "Plus elle est élevée, plus la VaR paramétrique sous-estime le risque de queue.")
