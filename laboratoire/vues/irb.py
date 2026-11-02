import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Formule IRB (entreprises)")
c1, c2 = st.columns([1, 2])
with c1:
    pd_ = st.number_input("PD (%)", 0.01, 100.0, 1.0, 0.1) / 100
    lgd = st.number_input("LGD (%)", 0.0, 100.0, 45.0, 1.0) / 100
    m = st.slider("Maturité effective (années)", 1.0, 5.0, 2.5, 0.25)
    ead = st.number_input("EAD (€)", 0.0, value=10_000_000.0, step=100_000.0)
r = c.irb_entreprise(pd_, lgd, m)
with c2:
    k = st.columns(3)
    k[0].metric("Pondération", pct(r["RW"])); k[1].metric("RWA", fmt(r["RW"] * ead) + " €"); k[2].metric("Perte attendue", fmt(max(pd_, 0.0005) * lgd * ead) + " €")
    grille = np.geomspace(0.0005, 0.3, 80)
    df = pd.DataFrame([{"PD": p, "Pondération": c.irb_entreprise(p, lgd, mm)["RW"], "Maturité": f"M = {mm:g}"} for mm in (1, 2.5, 5) for p in grille])
    fig = px.line(df, x="PD", y="Pondération", color="Maturité", log_x=True)
    fig.update_layout(height=360, yaxis_tickformat=".0%", xaxis_tickformat=".1%", margin=dict(t=20, b=20))
    st.plotly_chart(fig, use_container_width=True)
st.caption(f"Corrélation d'actifs R = {pct(r['R'], 2)} ; ajustement de maturité b = {fmt(r['b'], 4)}. Plancher de PD de 0,05 % appliqué.")
