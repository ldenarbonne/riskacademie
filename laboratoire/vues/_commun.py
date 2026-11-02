
def fmt(x, d=0):
    """Format français : espace insécable pour les milliers, virgule décimale."""
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s

def pct(x, d=1):
    return fmt(100 * x, d) + " %"
