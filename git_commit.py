import subprocess
from datetime import datetime
import os
import shutil

LOG_FILE = "git_log.txt"

def log(message):
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    entry = f"{timestamp} {message}\n"
    print(entry.strip())
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(entry)

def run_git_command(args, desc=""):
    git_path = shutil.which("git")
    if not git_path:
        log("[ERROR] Git executable not found in PATH.")
        return None

    try:
        full_cmd = [git_path] + args
        log(f"> Running: {' '.join(full_cmd)}")
        result = subprocess.run(full_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.stdout.strip():
            log(result.stdout.strip())
        if result.stderr.strip():
            log("STDERR: " + result.stderr.strip())
        log(f"[OK] {desc}")
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        log(f"[ERROR] {desc}: {e.stderr.strip()}")
        return None

def has_changes():
    result = run_git_command(["status", "--porcelain"], "Checking for changes")
    return bool(result)

def has_staged_changes():
    try:
        subprocess.run(["git", "diff", "--cached", "--quiet"], check=True)
        return False
    except subprocess.CalledProcessError:
        return True

def auto_commit():
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo_dir)
    log(f"Working directory: {repo_dir}")
    log("=== Starting Git Auto Commit ===")

    if not has_changes():
        log("Nothing to commit. Working directory clean.")
        return

    run_git_command(["add", "-A"], "Staging all changes")

    if not has_staged_changes():
        log("Nothing staged after git add. Exiting.")
        return

    commit_msg = f"Auto commit on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    run_git_command(["commit", "-m", commit_msg], "Committing changes")
    run_git_command(["push", "origin", "master"], "Pushing to remote")

    log("✅ Auto commit and push complete.\n")

if __name__ == "__main__":
    auto_commit()
