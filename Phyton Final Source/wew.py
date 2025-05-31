import os
from datetime import datetime

LOG_FILE = "toggle_log.txt"
THIS_FILE = os.path.basename(__file__)
EXCLUDE_NAMES = ["wew.txt", "wew.py", THIS_FILE, LOG_FILE]

def log(message):
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    print(f"{timestamp} {message}")
    with open(LOG_FILE, "a", encoding="utf-8") as log_file:
        log_file.write(f"{timestamp} {message}\n")

def toggle_extensions():
    files = os.listdir()

    txt_files = [f for f in files if f.endswith(".txt") and f not in EXCLUDE_NAMES]
    py_files = [f for f in files if f.endswith(".py") and f not in EXCLUDE_NAMES]

    if txt_files:
        log("Found .txt files. Renaming to .py...")
        for f in txt_files:
            new_name = f[:-4] + ".py"
            os.rename(f, new_name)
            log(f"Renamed: {f} → {new_name}")
    elif py_files:
        log("Found .py files. Renaming to .txt...")
        for f in py_files:
            new_name = f[:-3] + ".txt"
            os.rename(f, new_name)
            log(f"Renamed: {f} → {new_name}")
    else:
        log("No .txt or .py files found to toggle.")

if __name__ == "__main__":
    log("=== TOGGLE SCRIPT STARTED ===")
    toggle_extensions()
    log("=== TOGGLE SCRIPT FINISHED ===")
