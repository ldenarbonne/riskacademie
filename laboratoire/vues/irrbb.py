import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("IRRBB : ΔEVE sous les six scénarios de Bâle")
st.caption("Flux nets de refixation par tranche (actifs moins passifs), actualisés sur une courbe plate. Chocs EUR : parallèle 200 pb, courts 250 pb, longs 100 pb.")
base = pd.DataFrame({
    "Maturité (années)": [0.25, 0.75, 1.5, 3.0, 5.0, 7.0, 10.0, 15.0],
    "Flux nets (M€)": [-350.0, -180.0, 40.0, 120.0, 160.0, 120.0, 90.0, 60.0],
})
c1, c2 = st.columns([1, 2])
with c1:
    gap = st.data_editor(base, num_rows="dynamic", use_container_width=True)
    taux = st.number_input("Taux de base (%)", value=2.5, step=0.25) / 100
    t1 = st.number_input("Fonds propres Tier 1 (M€)", value=80.0, step=5.0)
t = gap["Maturité (années)"].to_numpy(float); cf = gap["Flux nets (M€)"].to_numpy(float)
res = c.delta_eve(t, cf, taux)
pire = res.min()
with c2:
    k = st.columns(3)
    k[0].metric("Scénario le plus défavorable", res.idxmin())
    k[1].metric("ΔEVE", fmt(pire, 1) + " M€")
    k[2].metric("En % du Tier 1", pct(pire / t1), "SOT dépassé" if pire / t1 < -0.15 else "sous le seuil de 15 %", delta_color="inverse" if pire / t1 < -0.15 else "off")
    df = (res / t1).rename("ΔEVE / Tier 1").reset_index().rename(columns={"index": "Scénario"})
    fig = px.bar(df, x="ΔEVE / Tier 1", y="Scénario", orientation="h", color=df["ΔEVE / Tier 1"] < -0.15,
                 color_discrete_map={True: "#b03a2e", False: "#2e6b4f"})
    fig.add_vline(x=-0.15, line_dash="dash", line_color="#b03a2e", annotation_text="SOT −15 %")
    fig.update_layout(height=340, showlegend=False, xaxis_tickformat=".0%", margin=dict(t=20, b=20))
    st.plotly_chart(fig, use_container_width=True)
grille = np.linspace(0, 20, 81)
sc = pd.DataFrame(c.scenarios_bale(grille), index=grille) * 1e4
fig2 = px.line(sc, labels={"index": "Maturité (années)", "value": "Choc (pb)", "variable": "Scénario"})
fig2.update_layout(height=320, margin=dict(t=20, b=20))
st.subheader("Forme des chocs")
st.plotly_chart(fig2, use_container_width=True)
