import subprocess
from datetime import datetime
import os

def run_git_command(cmd, desc=""):
    try:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if desc:
            print(f"[OK] {desc}")
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {desc}: {e.stderr.strip()}")
        return None

def has_changes():
    status = run_git_command(["git", "status", "--porcelain"], "Checking for changes")
    return bool(status)

def auto_commit():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))  # Ensure script runs from repo directory

    if not has_changes():
        print("Nothing to commit. Working directory clean.")
        return

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"Auto commit on {timestamp}"

    run_git_command(["git", "add", "."], "Staging changes")
    run_git_command(["git", "commit", "-m", commit_msg], "Committing")
    run_git_command(["git", "push", "origin", "master"], "Pushing to GitHub")

    print("✅ Auto commit and push complete.")

if __name__ == "__main__":
    auto_commit()
