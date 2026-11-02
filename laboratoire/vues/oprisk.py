import pandas as pd
import plotly.express as px
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Capital pour risque opérationnel (CRR3)")
st.caption("Approche standard avec ILM = 1 (choix européen) : exigence = BIC.")
a, b, d = st.columns(3)
ildc = a.number_input("ILDC (M€)", value=2_400.0, step=100.0)
sc = b.number_input("SC (M€)", value=1_800.0, step=100.0)
fc = d.number_input("FC (M€)", value=800.0, step=100.0)
bi = ildc + sc + fc
v = c.bic(bi)
k = st.columns(3)
k[0].metric("BI", fmt(bi) + " M€"); k[1].metric("BIC = exigence", fmt(v, 1) + " M€"); k[2].metric("RWA", fmt(v * 12.5) + " M€")
df = pd.DataFrame({"BI (M€)": [x * 500 for x in range(1, 121)]})
df["Taux effectif"] = [c.bic(x) / x for x in df["BI (M€)"]]
fig = px.line(df, x="BI (M€)", y="Taux effectif")
fig.add_vline(x=bi, line_dash="dot", line_color="#9a5b13")
fig.update_layout(height=320, yaxis_tickformat=".1%", margin=dict(t=20, b=20))
st.plotly_chart(fig, use_container_width=True)
