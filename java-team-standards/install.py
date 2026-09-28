#!/usr/bin/env python3
"""Install project rules and a shared review skill; Python 3.10+, stdlib only."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile

PACKAGE = Path(__file__).resolve().parent
VERSION = "1.0.0"
SKILL = "multi-center-code-review"
CANONICAL = f".agents/skills/{SKILL}"
STATE = f"{CANONICAL}/.install-state.json"
BEGIN = "<!-- java-team-standards:begin -->"
END = "<!-- java-team-standards:end -->"
PATTERN = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_path(root, relative):
    path = root / relative
    if not path.resolve().is_relative_to(root):
        raise ValueError(f"Path escapes target: {relative}")
    for item in (path, *path.parents):
        if item == root:
            break
        if item.is_symlink() or getattr(item, "is_junction", lambda: False)():
            raise ValueError(f"Symlink/junction requires manual handling: {relative}")
        if item != path and item.exists() and not item.is_dir():
            raise ValueError(f"Parent is not a directory: {relative}")
    if path.exists() and not path.is_file():
        raise ValueError(f"Destination is not a regular file: {relative}")
    return path


def read_optional(path):
    return path.read_bytes() if path.exists() else None


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".java-team-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def adapter(tool):
    return f"""---
name: {SKILL}
description: 审查 Java/Spring 多中台的指定代码、Git 变更或 PR/MR，输出证据和验证边界。用于代码审查、合并前检查、变更复核；普通实现和文档润色不自动触发。
---

# 多中台代码审查入口

这是 {tool} 的兼容入口。使用文件读取工具读取 [主 Skill](../../../{CANONICAL}/SKILL.md)，按其流程执行；不是再次按技能名调用，避免递归。

主 Skill 的 references 相对主 Skill 文件定位，源码和项目指令相对目标项目定位。用户仅要求审查时不修改；已授权修复按原范围执行。读取失败时说明缺失，不能假装加载。同名入口只执行一次。
""".encode("utf-8")


def build_plan(agents):
    # Only these fixed paths can be written; never follow paths from the manifest.
    plan = {
        "AGENTS.md": ("block", (PACKAGE / "rules.md").read_text(encoding="utf-8")),
        f"{CANONICAL}/SKILL.md": ("file", (PACKAGE / SKILL / "SKILL.md").read_bytes()),
        f"{CANONICAL}/references/standards.md": (
            "file", (PACKAGE / SKILL / "references/standards.md").read_bytes()
        ),
    }
    if "claude-code" in agents:
        plan["CLAUDE.md"] = ("block", "@AGENTS.md\n")
        plan[f".claude/skills/{SKILL}/SKILL.md"] = ("file", adapter("Claude Code"))
    if {"workbuddy", "codebuddy"} & set(agents):
        plan[".codebuddy/CODEBUDDY.md"] = (
            "block",
            "读取项目根目录的 [AGENTS.md](../AGENTS.md)，按其中规则执行。"
            "代码审查使用项目的 multi-center-code-review 技能；保持用户指定范围。\n",
        )
        plan[f".codebuddy/skills/{SKILL}/SKILL.md"] = ("file", adapter("WorkBuddy/CodeBuddy"))
    return plan


def render_block(old, content):
    text = (old or b"").decode("utf-8")
    newline = "\r\n" if "\r\n" in text else "\n"
    body = content.replace("\r\n", "\n").strip().replace("\n", newline)
    block = BEGIN + newline + body + newline + END
    matches = list(PATTERN.finditer(text))
    if text.count(BEGIN) != len(matches) or text.count(END) != len(matches) or len(matches) > 1:
        raise ValueError("Malformed or duplicate managed block markers")
    if matches:
        match = matches[0]
        previous = match.group().encode("utf-8")
        result = text[:match.start()] + block + text[match.end():]
    else:
        previous = None
        separator = "" if not text else (newline if text.endswith("\n") else newline * 2)
        result = text + separator + block + newline
    return result.encode("utf-8"), block.encode("utf-8"), previous


def run(args):
    root = Path(args.target).expanduser().resolve()
    if not root.is_dir():
        raise ValueError("--target must be an existing project directory")
    override = root / "AGENTS.override.md"
    if override.is_file() and override.read_bytes().strip():
        raise ValueError("AGENTS.override.md takes precedence over AGENTS.md; merge its rules manually before installing")
    state_path = safe_path(root, STATE)
    old_state = read_optional(state_path)
    state = json.loads(old_state) if old_state is not None else {"entries": {}}
    if not isinstance(state, dict) or not isinstance(state.get("entries"), dict):
        raise ValueError("Invalid install state; inspect it before reinstalling")
    records = dict(state["entries"])
    changes = []
    conflicts = []
    statuses = []

    for relative, (kind, content) in build_plan(args.agents).items():
        path = safe_path(root, relative)
        old = read_optional(path)
        try:
            if kind == "block":
                desired, owned, previous = render_block(old, content)
            else:
                desired = owned = content
                previous = old
        except (UnicodeError, ValueError) as error:
            conflicts.append(f"{relative}: {error}")
            continue
        record = records.get(relative, {})
        if previous is not None and previous != owned:
            if not isinstance(record, dict) or record.get("kind") != kind or record.get("sha256") != digest(previous):
                conflicts.append(f"{relative}: existing content is unmanaged or locally edited")
                continue
            if not args.update:
                conflicts.append(f"{relative}: newer package content; rerun with --update after review")
                continue
        records[relative] = {"kind": kind, "sha256": digest(owned)}
        if old == desired:
            statuses.append(f"UNCHANGED {relative}")
        else:
            changes.append((path, old, desired))
            action = "CREATE" if old is None else ("MERGE" if kind == "block" else "UPDATE")
            statuses.append(f"{action} {relative}")

    if conflicts:
        raise ValueError("No files written. Resolve these conflicts first:\n- " + "\n- ".join(conflicts))
    new_state = (json.dumps({"version": VERSION, "entries": records}, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    if new_state != old_state:
        changes.append((state_path, old_state, new_state))
        statuses.append("UPDATE " + STATE if old_state is not None else "CREATE " + STATE)
    print("Target: " + str(root))
    for status in statuses:
        print(status)
    if args.dry_run:
        print(f"DRY RUN: {len(changes)} file(s) would change; no writes.")
        return

    written = []
    try:
        for path, old, desired in changes:
            # Detect concurrent changes after preflight; this is not a file lock.
            safe_path(root, str(path.relative_to(root)))
            if read_optional(path) != old:
                raise ValueError(f"File changed during install: {path.relative_to(root)}")
            atomic_write(path, desired)
            written.append((path, old, desired))
    except Exception:
        for path, old, desired in reversed(written):
            try:
                safe_path(root, str(path.relative_to(root)))
                if read_optional(path) != desired:
                    print(f"ROLLBACK SKIPPED (concurrent edit): {path}", file=sys.stderr)
                elif old is None:
                    path.unlink()
                else:
                    atomic_write(path, old)
            except Exception as rollback_error:
                print(f"ROLLBACK FAILED: {path}: {rollback_error}", file=sys.stderr)
        raise
    print(f"DONE: {len(changes)} file(s) changed. No global settings, Git operations or network calls.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", required=True, help="Existing destination project directory")
    parser.add_argument("--agents", nargs="+", choices=["codex", "claude-code", "cursor", "workbuddy", "codebuddy"],
                        default=["codex", "claude-code", "cursor", "workbuddy"], help="Compatibility entries to generate")
    parser.add_argument("--dry-run", action="store_true", help="Validate and preview without writing")
    parser.add_argument("--update", action="store_true", help="Update only unchanged, previously managed content")
    args = parser.parse_args()
    try:
        run(args)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
