"""Tests de non-régression : valeurs de référence des leçons RiskAcadémie."""
import numpy as np
import pytest
from risklab import calculs as c


def test_var_parametrique():
    var, es = c.var_es_parametrique(0.20 / np.sqrt(252), 0.99, 10_000_000)
    assert var == pytest.approx(293_092, rel=1e-4)
    assert es / var == pytest.approx(1.1456, rel=1e-3)


def test_irb_reference_bale():
    assert c.irb_entreprise(0.01, 0.45, 2.5)["RW"] == pytest.approx(0.9232, abs=5e-4)


def test_bic_quiz():
    assert c.bic(5_000) == pytest.approx(720)


def test_binomial_et_jeffreys():
    r = c.test_binomial(1000, 0.01, 16)
    assert r["binomial"] == pytest.approx(0.04787, abs=1e-4)
    assert r["jeffreys"] == pytest.approx(0.03577, abs=1e-4)


def test_lcr_exemple():
    r = c.lcr(600, 250, 150, 0.5, 900, 400)
    assert r["HQLA"] == pytest.approx(887.5) and r["LCR"] == pytest.approx(1.775)


def test_kupiec_zone():
    assert c.zone_bale(7) == "jaune"
    assert c.test_kupiec(250, 3, 0.99)["p_value"] > 0.05


def test_eve_hausse_parallele_negative_pour_banque_de_transformation():
    t = np.array([0.5, 5.0, 10.0]); cf = np.array([-900, 600, 500])
    d = c.delta_eve(t, cf, 0.02)
    assert d["Hausse parallèle"] < 0 < d["Baisse parallèle"]


def test_auc_aleatoire_proche_de_un_demi():
    df = c.simuler_scores(20_000, 0.05, 0.0)
    assert c.roc_gini(df.score, df.defaut)["auc"] == pytest.approx(0.5, abs=0.03)
