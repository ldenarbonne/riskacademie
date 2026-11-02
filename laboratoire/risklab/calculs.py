"""Fonctions de calcul du laboratoire RiskAcadémie.

Toutes les fonctions sont pures (sans dépendance à Streamlit) afin d'être
testables et réutilisables dans un notebook.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats

# ---------------------------------------------------------------------------
# Risque de marché
# ---------------------------------------------------------------------------

def var_es_parametrique(sigma_jour: float, alpha: float, valeur: float) -> tuple[float, float]:
    """VaR et ES gaussiennes à 1 jour (montants positifs = pertes)."""
    z = stats.norm.ppf(alpha)
    var = z * sigma_jour * valeur
    es = sigma_jour * stats.norm.pdf(z) / (1 - alpha) * valeur
    return var, es


def var_es_empirique(pnl: np.ndarray, alpha: float) -> tuple[float, float]:
    """VaR et ES historiques à partir d'un vecteur de P&L (gains positifs)."""
    pertes = np.sort(-np.asarray(pnl, dtype=float))[::-1]
    k = max(1, int(np.floor(len(pertes) * (1 - alpha))))
    return float(pertes[k - 1]), float(pertes[:k].mean())


def simuler_rendements(n_jours: int, vols: np.ndarray, correl: np.ndarray,
                       loi: str = "normale", ddl: int = 4, graine: int = 42) -> np.ndarray:
    """Rendements journaliers corrélés, loi normale ou Student (queues épaisses)."""
    rng = np.random.default_rng(graine)
    chol = np.linalg.cholesky(correl)
    z = rng.standard_normal((n_jours, len(vols)))
    if loi == "student":
        w = rng.chisquare(ddl, size=(n_jours, 1)) / ddl
        z = z / np.sqrt(w) * np.sqrt((ddl - 2) / ddl)  # variance unitaire
    return (z @ chol.T) * vols


def var_monte_carlo(positions: np.ndarray, vols: np.ndarray, correl: np.ndarray, alpha: float,
                    n_sim: int = 50_000, loi: str = "normale", ddl: int = 4, graine: int = 7) -> dict:
    """VaR et ES Monte-Carlo à 1 jour d'un portefeuille linéaire."""
    r = simuler_rendements(n_sim, vols, correl, loi, ddl, graine)
    pnl = r @ positions
    var, es = var_es_empirique(pnl, alpha)
    sd = np.sqrt(positions @ (np.outer(vols, vols) * correl) @ positions)
    var_n, es_n = var_es_parametrique(sd, alpha, 1.0)
    return {"pnl": pnl, "var": var, "es": es, "var_param": var_n, "es_param": es_n}


def rendements_depuis_prix(prix: pd.DataFrame) -> pd.DataFrame:
    """Rendements logarithmiques journaliers à partir d'un tableau de prix."""
    return np.log(prix / prix.shift(1)).dropna(how="all")


def var_historique_glissante(pnl: pd.Series, alpha: float, fenetre: int) -> pd.Series:
    """VaR historique estimée chaque jour sur les `fenetre` jours précédents."""
    pertes = -pnl
    return pertes.rolling(fenetre).quantile(alpha, interpolation="higher").shift(1)


def test_kupiec(n_obs: int, n_exc: int, alpha: float) -> dict:
    """Test de proportion des exceptions (POF) de Kupiec."""
    p = 1 - alpha
    x, n = n_exc, n_obs
    phat = x / n if n else 0.0
    def ll(q):
        q = min(max(q, 1e-12), 1 - 1e-12)
        return (n - x) * np.log(1 - q) + x * np.log(q)
    lr = max(0.0, -2 * (ll(p) - ll(phat)))
    return {"lr": float(lr), "p_value": float(1 - stats.chi2.cdf(lr, 1)), "taux": phat, "attendu": n * p}


def test_christoffersen(exceptions: np.ndarray) -> dict:
    """Test d'indépendance des exceptions (Christoffersen)."""
    e = np.asarray(exceptions, dtype=int)
    n00 = np.sum((e[:-1] == 0) & (e[1:] == 0)); n01 = np.sum((e[:-1] == 0) & (e[1:] == 1))
    n10 = np.sum((e[:-1] == 1) & (e[1:] == 0)); n11 = np.sum((e[:-1] == 1) & (e[1:] == 1))
    def sl(a, q):
        return a * np.log(q) if a > 0 and q > 0 else 0.0
    pi0 = n01 / (n00 + n01) if n00 + n01 else 0.0
    pi1 = n11 / (n10 + n11) if n10 + n11 else 0.0
    pi = (n01 + n11) / (n00 + n01 + n10 + n11)
    l0 = sl(n00 + n10, 1 - pi) + sl(n01 + n11, pi)
    l1 = sl(n00, 1 - pi0) + sl(n01, pi0) + sl(n10, 1 - pi1) + sl(n11, pi1)
    lr = max(0.0, -2 * (l0 - l1))
    return {"lr": float(lr), "p_value": float(1 - stats.chi2.cdf(lr, 1)), "n11": int(n11)}


def zone_bale(n_exc_250: int) -> str:
    """Zone « feux tricolores » pour 250 observations à 99 %."""
    return "verte" if n_exc_250 <= 4 else "jaune" if n_exc_250 <= 9 else "rouge"


# ---------------------------------------------------------------------------
# Crédit et contrepartie
# ---------------------------------------------------------------------------

def irb_entreprise(pd_: float, lgd: float, m: float) -> dict:
    """Formule IRB pour les entreprises (sans ajustement PME)."""
    pd_ = max(pd_, 0.0005)
    e = (1 - np.exp(-50 * pd_)) / (1 - np.exp(-50))
    r = 0.12 * e + 0.24 * (1 - e)
    b = (0.11852 - 0.05478 * np.log(pd_)) ** 2
    k = (lgd * stats.norm.cdf((stats.norm.ppf(pd_) + np.sqrt(r) * stats.norm.ppf(0.999)) / np.sqrt(1 - r))
         - pd_ * lgd) * (1 + (m - 2.5) * b) / (1 - 1.5 * b)
    return {"K": float(k), "RW": float(k * 12.5), "R": float(r), "b": float(b)}


def profil_exposition_forward(nominal: float, s0: float, strike: float, vol: float, taux: float,
                              maturite: float, pas_par_an: int = 12, n_sim: int = 20_000,
                              graine: int = 11) -> pd.DataFrame:
    """EE et PFE 95 % d'un achat à terme (change ou action) simulé par mouvement brownien géométrique."""
    rng = np.random.default_rng(graine)
    dt = 1 / pas_par_an
    t = np.arange(1, int(round(maturite * pas_par_an)) + 1) * dt
    z = rng.standard_normal((n_sim, len(t)))
    log_s = np.log(s0) + np.cumsum((taux - 0.5 * vol ** 2) * dt + vol * np.sqrt(dt) * z, axis=1)
    s = np.exp(log_s)
    v = nominal * (s - strike * np.exp(-taux * (maturite - t)))  # valeur du terme à la date t
    expo = np.maximum(v, 0)
    return pd.DataFrame({"t": t, "EE": expo.mean(axis=0), "PFE95": np.quantile(expo, 0.95, axis=0)})


def cva(profil: pd.DataFrame, spread: float, lgd: float, taux: float) -> tuple[float, pd.DataFrame]:
    """CVA unilatérale avec intensité constante λ = spread / LGD."""
    lam = spread / lgd
    t = profil["t"].to_numpy()
    t_prec = np.concatenate([[0.0], t[:-1]])
    pd_marg = np.exp(-lam * t_prec) - np.exp(-lam * t)
    df = np.exp(-taux * t)
    contrib = lgd * profil["EE"].to_numpy() * df * pd_marg
    detail = profil.assign(PD_marginale=pd_marg, actualisation=df, contribution=contrib)
    return float(contrib.sum()), detail


# ---------------------------------------------------------------------------
# ALM et liquidité
# ---------------------------------------------------------------------------

CHOCS_EUR = {"parallele": 0.02, "court": 0.025, "long": 0.01}


def scenarios_bale(t: np.ndarray, chocs: dict = CHOCS_EUR) -> dict[str, np.ndarray]:
    """Les six scénarios de choc IRRBB du Comité de Bâle (BCBS d368)."""
    x = 4.0
    court = chocs["court"] * np.exp(-t / x)
    long_ = chocs["long"] * (1 - np.exp(-t / x))
    par = np.full_like(t, chocs["parallele"], dtype=float)
    return {
        "Hausse parallèle": par,
        "Baisse parallèle": -par,
        "Pentification": -0.65 * np.abs(court) + 0.9 * np.abs(long_),
        "Aplatissement": 0.8 * np.abs(court) - 0.6 * np.abs(long_),
        "Hausse des taux courts": court,
        "Baisse des taux courts": -court,
    }


def delta_eve(maturites: np.ndarray, flux_nets: np.ndarray, taux_base: float,
              chocs: dict = CHOCS_EUR) -> pd.Series:
    """Variation de la valeur économique des fonds propres pour chaque scénario."""
    t = np.asarray(maturites, dtype=float)
    cf = np.asarray(flux_nets, dtype=float)
    pv0 = np.sum(cf * np.exp(-taux_base * t))
    out = {nom: float(np.sum(cf * np.exp(-(taux_base + d) * t)) - pv0)
           for nom, d in scenarios_bale(t, chocs).items()}
    return pd.Series(out, name="ΔEVE")


def lcr(n1: float, n2a: float, n2b: float, decote_2b: float, sorties: float, entrees: float) -> dict:
    """LCR simplifié (méthodologie de Bâle, plafonds 40 % et 15 %)."""
    l1, l2a, l2b = n1, n2a * 0.85, n2b * (1 - decote_2b)
    adj15 = max(l2b - 15 / 85 * (l1 + l2a), l2b - 15 / 60 * l1, 0.0)
    adj40 = max(l2a + l2b - adj15 - 2 / 3 * l1, 0.0)
    hqla = l1 + l2a + l2b - adj15 - adj40
    nettes = sorties - min(entrees, 0.75 * sorties)
    return {"HQLA": hqla, "sorties_nettes": nettes, "LCR": hqla / nettes if nettes else np.inf,
            "ajustement_15": adj15, "ajustement_40": adj40}


# ---------------------------------------------------------------------------
# Risque opérationnel, climat, risque de modèle
# ---------------------------------------------------------------------------

def bic(bi: float) -> float:
    """Composante BIC (en mêmes unités que le BI, tranches en millions d'euros)."""
    tranches = [(0, 1_000, 0.12), (1_000, 30_000, 0.15), (30_000, np.inf, 0.18)]
    return float(sum(max(0.0, min(bi, b) - a) * c for a, b, c in tranches))


def choc_carbone(emissions_t: float, hausse_prix: float, repercussion: float,
                 ebitda: float, dette_nette: float, interets: float) -> dict:
    """Impact direct d'une hausse du prix du carbone (montants en M€)."""
    cout = emissions_t * hausse_prix * (1 - repercussion) / 1e6
    eb = ebitda - cout
    return {"cout": cout, "ebitda": eb, "levier_avant": dette_nette / ebitda,
            "levier_apres": dette_nette / eb if eb > 0 else np.inf,
            "couverture_apres": eb / interets if interets else np.inf}


def test_binomial(n: int, pd_: float, d: int) -> dict:
    """p-values binomiale et de Jeffreys (test unilatéral de sous-estimation)."""
    return {"binomial": float(stats.binom.sf(d - 1, n, pd_)),
            "jeffreys": float(stats.beta.cdf(pd_, d + 0.5, n - d + 0.5))}


def simuler_scores(n: int, taux_defaut: float, separation: float, graine: int = 3) -> pd.DataFrame:
    """Scores simulés : les défauts ont un score moyen plus élevé de `separation` écarts-types."""
    rng = np.random.default_rng(graine)
    defaut = rng.random(n) < taux_defaut
    score = rng.standard_normal(n) + separation * defaut
    return pd.DataFrame({"score": score, "defaut": defaut.astype(int)})


def roc_gini(scores: np.ndarray, defauts: np.ndarray) -> dict:
    """Courbe ROC, AUC (statistique de Mann-Whitney) et indice de Gini."""
    s = np.asarray(scores, dtype=float); y = np.asarray(defauts, dtype=int)
    rangs = stats.rankdata(s)
    n1, n0 = y.sum(), len(y) - y.sum()
    auc = (rangs[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)
    ordre = np.argsort(-s)
    tpr = np.concatenate([[0], np.cumsum(y[ordre]) / n1])
    fpr = np.concatenate([[0], np.cumsum(1 - y[ordre]) / n0])
    return {"auc": float(auc), "gini": float(2 * auc - 1), "fpr": fpr, "tpr": tpr}
