import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Choc carbone sur une contrepartie")
a, b = st.columns(2)
em = a.number_input("Émissions retenues (tCO2e / an)", value=2_000_000.0, step=100_000.0)
dp = a.slider("Hausse du prix du carbone (€/t)", 0, 300, 100, 5)
rep = a.slider("Part répercutée sur les clients", 0.0, 1.0, 0.3, 0.05)
eb = b.number_input("EBITDA (M€)", value=600.0, step=10.0)
dn = b.number_input("Dette nette (M€)", value=2_100.0, step=50.0)
it = b.number_input("Charges d'intérêts (M€)", value=90.0, step=5.0)
r = c.choc_carbone(em, dp, rep, eb, dn, it)
k = st.columns(3)
k[0].metric("Coût carbone net", fmt(r["cout"], 1) + " M€", pct(r["cout"] / eb) + " de l'EBITDA", delta_color="off")
k[1].metric("Levier après choc", fmt(r["levier_apres"], 1) + "×" if np.isfinite(r["levier_apres"]) else "EBITDA ≤ 0", f"avant {fmt(r['levier_avant'], 1)}×", delta_color="off")
k[2].metric("Couverture des intérêts", fmt(r["couverture_apres"], 1) + "×" if r["ebitda"] > 0 else "—")
g = pd.DataFrame({"Prix (€/t)": np.arange(0, 301, 5)})
g["Levier"] = [c.choc_carbone(em, p, rep, eb, dn, it)["levier_apres"] for p in g["Prix (€/t)"]]
fig = px.line(g[g["Levier"] < 15], x="Prix (€/t)", y="Levier")
fig.add_hline(y=6, line_dash="dash", line_color="#b03a2e", annotation_text="6×")
fig.update_layout(height=320, margin=dict(t=20, b=20))
st.plotly_chart(fig, use_container_width=True)
st.caption("Impact direct uniquement, sans effet volume ni investissement de décarbonation.")
