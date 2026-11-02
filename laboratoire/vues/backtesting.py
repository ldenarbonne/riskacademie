import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Backtesting de la VaR")
st.caption("VaR historique glissante, exceptions, tests de Kupiec et de Christoffersen, zones de Bâle.")

c1, c2, c3 = st.columns(3)
alpha = c1.select_slider("Confiance", [0.95, 0.975, 0.99], value=0.99)
fenetre = c2.number_input("Fenêtre d'estimation (jours)", 60, 1000, 250, 10)
n_test = c3.number_input("Période de test (jours)", 100, 2000, 250, 10)
f = st.file_uploader("Série de P&L ou de prix (CSV, facultatif)", type=["csv"])
if f:
    df = pd.read_csv(f, sep=None, engine="python", index_col=0, parse_dates=True, decimal=",")
    serie = pd.to_numeric(df.iloc[:, 0], errors="coerce").dropna()
    if st.radio("La colonne contient", ["des prix", "des P&L"], horizontal=True) == "des prix":
        serie = serie.pct_change().dropna() * st.number_input("Valeur du portefeuille (€)", value=10_000_000.0)
else:
    st.info("Données simulées : régime calme puis choc de volatilité, pour illustrer le regroupement des exceptions.")
    rng = np.random.default_rng(5)
    n = int(fenetre + n_test)
    vol = np.where(np.arange(n) < n - n_test // 2, 0.01, 0.022)
    serie = pd.Series(rng.standard_t(5, n) / np.sqrt(5 / 3) * vol * 10_000_000,
                      index=pd.bdate_range("2024-01-01", periods=n))

var = c.var_historique_glissante(serie, alpha, int(fenetre))
d = pd.DataFrame({"P&L": serie, "VaR": var}).dropna().tail(int(n_test))
d["exception"] = (-d["P&L"] > d["VaR"]).astype(int)
x = int(d["exception"].sum())
k = c.test_kupiec(len(d), x, alpha); ch = c.test_christoffersen(d["exception"].to_numpy())
m = st.columns(4)
m[0].metric("Exceptions", x, f"{fmt(k['attendu'], 1)} attendues", delta_color="off")
m[1].metric("Kupiec (p-value)", fmt(k["p_value"], 3), "rejet" if k["p_value"] < 0.05 else "non rejet", delta_color="off")
m[2].metric("Christoffersen (p-value)", fmt(ch["p_value"], 3), "exceptions groupées" if ch["p_value"] < 0.05 else "indépendance non rejetée", delta_color="off")
if alpha == 0.99:
    x250 = int(d["exception"].tail(250).sum())
    m[3].metric("Zone de Bâle (250 derniers jours)", c.zone_bale(x250).capitalize(), f"{x250} exceptions", delta_color="off")

fig = go.Figure()
fig.add_bar(x=d.index, y=d["P&L"], marker_color=np.where(d["exception"] == 1, "#b03a2e", "#9fb3c8"), name="P&L")
fig.add_scatter(x=d.index, y=-d["VaR"], line=dict(color="#16202e", width=2), name="−VaR")
fig.update_layout(height=380, margin=dict(t=20, b=20), yaxis_title="€", legend=dict(orientation="h"))
st.plotly_chart(fig, use_container_width=True)
st.caption("Kupiec teste la fréquence des exceptions ; Christoffersen teste leur indépendance dans le temps. "
           "Une VaR historique à fenêtre longue réagit lentement aux changements de régime.")
