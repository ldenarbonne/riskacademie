import plotly.graph_objects as go
import streamlit as st
from vues._commun import fmt, pct
from risklab import calculs as c

st.title("Exposition simulée et CVA")
st.caption("Achat à terme (devise ou action) simulé par Monte-Carlo : profils EE et PFE, puis CVA unilatérale.")
a, b, d = st.columns(3)
nominal = a.number_input("Nominal (unités de sous-jacent)", value=10_000_000.0, step=1_000_000.0)
s0 = a.number_input("Cours initial", value=1.10, step=0.01, format="%.4f")
strike = b.number_input("Prix à terme convenu", value=1.10, step=0.01, format="%.4f")
vol = b.slider("Volatilité annuelle", 0.02, 0.60, 0.10, 0.01)
mat = d.slider("Maturité (années)", 0.5, 10.0, 5.0, 0.5)
taux = d.number_input("Taux sans risque (%)", value=2.5, step=0.25) / 100
e, f_ = st.columns(2)
spread = e.number_input("Spread de CDS de la contrepartie (pb)", value=150.0, step=10.0) / 1e4
lgd = f_.slider("LGD de marché", 0.1, 1.0, 0.6, 0.05)

prof = c.profil_exposition_forward(nominal, s0, strike, vol, taux, mat)
valeur_cva, det = c.cva(prof, spread, lgd, taux)
k = st.columns(3)
k[0].metric("CVA", fmt(valeur_cva) + " €"); k[1].metric("EE maximale", fmt(prof["EE"].max()) + " €"); k[2].metric("PFE 95 % maximale", fmt(prof["PFE95"].max()) + " €")
fig = go.Figure()
fig.add_scatter(x=prof["t"], y=prof["EE"], name="EE", line=dict(color="#1f4e79", width=3))
fig.add_scatter(x=prof["t"], y=prof["PFE95"], name="PFE 95 %", line=dict(color="#9a5b13", dash="dash"))
fig.update_layout(height=360, xaxis_title="Années", yaxis_title="€", margin=dict(t=20, b=20), legend=dict(orientation="h"))
st.plotly_chart(fig, use_container_width=True)
with st.expander("Détail du calcul de la CVA"):
    st.dataframe(det.style.format({"t": "{:.2f}", "EE": "{:,.0f}", "PFE95": "{:,.0f}", "PD_marginale": "{:.4%}", "actualisation": "{:.4f}", "contribution": "{:,.0f}"}), use_container_width=True)
st.caption("Pour un contrat à terme, l'exposition croît avec la racine du temps : il n'y a pas d'amortissement comme pour un swap.")
