import plotly.graph_objects as go
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Validation d'un modèle de notation")
t1, t2 = st.tabs(["Discrimination (ROC, Gini)", "Calibration (binomial, Jeffreys)"])
with t1:
    a, b = st.columns(2)
    n = a.number_input("Nombre d'emprunteurs simulés", 500, 200_000, 20_000, 500)
    td = a.slider("Taux de défaut", 0.005, 0.2, 0.03, 0.005)
    sep = b.slider("Pouvoir séparateur (écart de score moyen, en écarts-types)", 0.0, 3.0, 1.2, 0.1)
    df = c.simuler_scores(int(n), td, sep)
    r = c.roc_gini(df["score"], df["defaut"])
    k = st.columns(2); k[0].metric("AUC", fmt(r["auc"], 3)); k[1].metric("Gini", pct(r["gini"]))
    fig = go.Figure()
    fig.add_scatter(x=r["fpr"], y=r["tpr"], name="Modèle", line=dict(color="#2f5f73", width=3))
    fig.add_scatter(x=[0, 1], y=[0, 1], name="Aléatoire", line=dict(color="#999", dash="dash"))
    fig.update_layout(height=380, xaxis_title="Taux de faux positifs", yaxis_title="Taux de vrais positifs", margin=dict(t=20, b=20))
    st.plotly_chart(fig, use_container_width=True)
with t2:
    a, b, d = st.columns(3)
    n = a.number_input("Emprunteurs de la classe", 1, 1_000_000, 1000)
    p = b.number_input("PD prévue (%)", 0.01, 99.0, 1.0, 0.1) / 100
    dd = d.number_input("Défauts observés", 0, int(n), 16)
    r = c.test_binomial(int(n), p, int(dd))
    k = st.columns(3)
    k[0].metric("Taux observé", pct(dd / n, 2), f"PD prévue {pct(p, 2)}", delta_color="off")
    k[1].metric("p-value binomiale", fmt(r["binomial"], 4), "rejet à 5 %" if r["binomial"] < 0.05 else "non rejet", delta_color="off")
    k[2].metric("p-value de Jeffreys", fmt(r["jeffreys"], 4), "rejet à 5 %" if r["jeffreys"] < 0.05 else "non rejet", delta_color="off")
    st.caption("Tests unilatéraux de sous-estimation de la PD, sous hypothèse d'indépendance des défauts.")
