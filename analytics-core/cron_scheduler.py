import logging
import time
from typing import List, Union

# ─── Logger Setup ─────────────────────────────────────────────────────────────
logger = logging.getLogger("transaction_monitor")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(handler)

# ─── Configuration ───────────────────────────────────────────────────────────
MIN_SUSPICIOUS_LENGTH = 5
UNKNOWN_WALLET_THRESHOLD = 2

IMMEDIATE_RISK_TX_DENSITY = 300
IMMEDIATE_RISK_TOKEN_AGE = 5
IMMEDIATE_RISK_ALERTS = 2

WATCHLIST_TX_DENSITY = 150


# ─── Core Detection Functions ─────────────────────────────────────────────────
def dark_track(tx_path: List[str]) -> str:
    """
    Analyze a transaction path for signs of obfuscation or suspicious behavior.
    - If path longer than MIN_SUSPICIOUS_LENGTH and contains at least UNKNOWN_WALLET_THRESHOLD 'unknown_wallet',
      flag as Suspicious Movement.
    - If path length exceeds half of MIN_SUSPICIOUS_LENGTH, flag as Obscured Trail.
    - Otherwise, mark as Normal Flow.
    """
    length = len(tx_path)
    unknown_count = tx_path.count("unknown_wallet")

    if length > MIN_SUSPICIOUS_LENGTH and unknown_count >= UNKNOWN_WALLET_THRESHOLD:
        return "Suspicious Movement Detected"
    if length > (MIN_SUSPICIOUS_LENGTH // 2):
        return "Obscured Transaction Trail"
    return "Normal Flow"


def risk_alert(tx_density: float, token_age_days: float, recent_alerts: int) -> str:
    """
    Determine risk level based on:
    - tx_density: transactions per hour
    - token_age_days: days since token launch
    - recent_alerts: count of alerts in the past 24h
    """
    if (
        tx_density > IMMEDIATE_RISK_TX_DENSITY
        and token_age_days < IMMEDIATE_RISK_TOKEN_AGE
        and recent_alerts >= IMMEDIATE_RISK_ALERTS
    ):
        return "Immediate Risk Alert"
    if tx_density > WATCHLIST_TX_DENSITY:
        return "Watchlist"
    return "Stable"


# ─── Tracing / Logging ─────────────────────────────────────────────────────────
def log_trace(event: str, metadata: Union[str, dict]) -> None:
    """
    Log a trace event with timestamp and metadata.
    """
    timestamp = time.time()
    logger.debug(f"[TRACE] {event} — {metadata} at {timestamp}")


# ─── Example Usage ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    path = ["walletA", "unknown_wallet", "walletB", "unknown_wallet", "walletC", "walletD"]
    status = dark_track(path)
    logger.info(f"dark_track: {status}")

    alert = risk_alert(tx_density=320, token_age_days=2, recent_alerts=3)
    logger.info(f"risk_alert: {alert}")

    log_trace("TX_PATH_ANALYSIS", {"path": path, "status": status})
