import subprocess
from datetime import datetime
import os

def run_git_command(cmd, desc=""):
    try:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if desc:
            print(f"[OK] {desc}")
        if result.stdout.strip():
            print(result.stdout.strip())
        if result.stderr.strip():
            print("STDERR:", result.stderr.strip())
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {desc}: {e.stderr.strip()}")
        return None

def has_unstaged_changes():
    # Check if working directory has any changes (tracked/untracked/deleted)
    status = run_git_command(["git", "status", "--porcelain"], "Checking for unstaged changes")
    return bool(status)

def has_staged_changes():
    # Check if staging area has any changes (ready to commit)
    # git diff --cached --quiet returns 0 if no changes, 1 if changes
    try:
        subprocess.run(["git", "diff", "--cached", "--quiet"], check=True)
        return False  # no staged changes
    except subprocess.CalledProcessError:
        return True  # staged changes present

def auto_commit():
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Changing directory to repo: {repo_dir}")
    os.chdir(repo_dir)

    if not has_unstaged_changes():
        print("Nothing to commit. Working directory clean.")
        return

    # Stage all changes including deletions
    run_git_command(["git", "add", "-A"], "Staging all changes including deletions")

    if not has_staged_changes():
        print("Nothing staged. Nothing to commit.")
        return

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"Auto commit on {timestamp}"

    run_git_command(["git", "commit", "-m", commit_msg], "Committing")
    run_git_command(["git", "push", "origin", "master"], "Pushing to GitHub")

    print("✅ Auto commit and push complete.")

if __name__ == "__main__":
    auto_commit()
