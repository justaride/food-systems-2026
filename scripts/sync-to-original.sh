#!/bin/bash
set -e

# Configuration
COPY_DIR="/Users/gabrielfreeman/Downloads/Antiggravity 15.06.26 Food Systems 2026"
ORIGINAL_DIR="/Users/gabrielfreeman/Documents/Food Systems 2026"

echo "========================================="
echo "   Food Systems 2026 Sync Helper Tool"
echo "========================================="
echo "Copy Repo (Source):      $COPY_DIR"
echo "Original Repo (Target):  $ORIGINAL_DIR"
echo "========================================="

# Step 1: Ensure we are in the copy repo
if [ "$PWD" != "$COPY_DIR" ]; then
  echo "Switching to copy directory: $COPY_DIR"
  cd "$COPY_DIR"
fi

# Step 2: Check status of copy repo
STATUS=$(git status --porcelain)
if [ -n "$STATUS" ]; then
  echo "Uncommitted changes detected in the copy repo:"
  git status -s
  echo ""
  read -p "Would you like to commit these changes in the copy repo first? (y/n): " commit_choice
  if [[ "$commit_choice" =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_msg
    if [ -z "$commit_msg" ]; then
      commit_msg="wip: sync developed work"
    fi
    git add -A
    git commit -m "$commit_msg"
    echo "Changes successfully committed in copy repo."
  else
    echo "Proceeding without committing current changes."
  fi
else
  echo "Copy repo is clean (no uncommitted changes)."
fi

# Get current branch name in copy repo
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch in copy repo: $BRANCH_NAME"

echo ""
echo "Select Sync Method:"
echo "1) Git-based Sync (Recommended - safe, tracks history, merges branches)"
echo "2) Direct File Sync (rsync - fast copy of files, bypasses git history)"
echo "3) Dual Sync (Commits/Git merge + rsync to catch untracked/unstaged files)"
echo "4) Cancel"
read -p "Enter choice (1-4): " sync_choice

case $sync_choice in
  1)
    echo "Performing Git-based sync..."
    # Go to original directory
    cd "$ORIGINAL_DIR"
    
    # Check if remote exists
    if ! git remote | grep -q "^copy-repo$"; then
      echo "Adding remote 'copy-repo' pointing to $COPY_DIR..."
      git remote add copy-repo "$COPY_DIR"
    fi
    
    echo "Fetching from copy-repo..."
    git fetch copy-repo
    
    # Check if branch exists in original repo
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
      echo "Branch $BRANCH_NAME exists in original repo. Checking out and merging..."
      git checkout "$BRANCH_NAME"
      git merge "copy-repo/$BRANCH_NAME"
    else
      echo "Creating and checking out branch $BRANCH_NAME in original repo..."
      git checkout -b "$BRANCH_NAME" "copy-repo/$BRANCH_NAME"
    fi
    echo "Git-based sync complete!"
    ;;
  2)
    echo "Performing Direct File Sync..."
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='tsconfig.tsbuildinfo' "$COPY_DIR/" "$ORIGINAL_DIR/"
    echo "File sync complete!"
    ;;
  3)
    echo "Performing Git-based sync first..."
    cd "$ORIGINAL_DIR"
    if ! git remote | grep -q "^copy-repo$"; then
      git remote add copy-repo "$COPY_DIR"
    fi
    git fetch copy-repo
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
      git checkout "$BRANCH_NAME"
      git merge "copy-repo/$BRANCH_NAME"
    else
      git checkout -b "$BRANCH_NAME" "copy-repo/$BRANCH_NAME"
    fi
    
    echo "Running rsync to capture any other uncommitted/untracked files..."
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='tsconfig.tsbuildinfo' "$COPY_DIR/" "$ORIGINAL_DIR/"
    echo "Dual sync complete!"
    ;;
  *)
    echo "Sync cancelled."
    exit 0
    ;;
esac
