import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Ratio de liquidité à court terme (LCR)")
a, b = st.columns(2)
n1 = a.number_input("Actifs de niveau 1 (M€)", value=600.0, step=10.0)
n2a = a.number_input("Actifs de niveau 2A avant décote (M€)", value=250.0, step=10.0)
n2b = a.number_input("Actifs de niveau 2B avant décote (M€)", value=150.0, step=10.0)
dec = a.radio("Décote niveau 2B", [0.25, 0.5], index=1, format_func=lambda x: pct(x, 0), horizontal=True)
so = b.number_input("Sorties pondérées à 30 jours (M€)", value=900.0, step=10.0)
en = b.number_input("Entrées pondérées à 30 jours (M€)", value=400.0, step=10.0)
r = c.lcr(n1, n2a, n2b, dec, so, en)
k = st.columns(3)
k[0].metric("LCR", pct(r["LCR"], 0), "≥ 100 %" if r["LCR"] >= 1 else "< 100 %", delta_color="normal" if r["LCR"] >= 1 else "inverse")
k[1].metric("HQLA", fmt(r["HQLA"]) + " M€"); k[2].metric("Sorties nettes", fmt(r["sorties_nettes"]) + " M€")
st.caption(f"Ajustements de plafond : 15 % → {fmt(r['ajustement_15'], 1)} M€ ; 40 % → {fmt(r['ajustement_40'], 1)} M€. Entrées plafonnées à 75 % des sorties.")
