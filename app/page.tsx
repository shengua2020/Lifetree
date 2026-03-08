"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Entry = {
  date: string;
  text: string;
};

type Tree = {
  id: number;
  startDate: string;
  entries: Entry[];
};

type LifeTreeState = {
  startedAt: string;
  entries: Entry[];
};

const STORAGE_KEY = "life-tree-state";
const MAX_LEAVES_PER_TREE = 365;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const groupTrees = (state: LifeTreeState): Tree[] => {
  const trees: Tree[] = [];

  state.entries.forEach((entry, index) => {
    const treeIndex = Math.floor(index / MAX_LEAVES_PER_TREE);

    if (!trees[treeIndex]) {
      trees[treeIndex] = {
        id: treeIndex,
        startDate: entry.date,
        entries: []
      };
    }

    trees[treeIndex].entries.push(entry);
  });

  return trees;
};

const getLeafPosition = (leafIndex: number, totalLeaves: number) => {
  const ratio = leafIndex / Math.max(totalLeaves - 1, 1);
  const angle = ratio * Math.PI * 2.7 + (leafIndex % 3) * 0.22;
  const radius = 38 + (1 - Math.cos(ratio * Math.PI)) * 72;
  const x = 200 + Math.cos(angle) * radius * 1.12;
  const y = 188 - Math.sin(angle) * radius - ratio * 42;

  return { x, y };
};

function TreeCanvas({ tree }: { tree: Tree }) {
  const leaves = tree.entries;

  return (
    <svg
      viewBox="0 0 400 420"
      className="tree-canvas"
      role="img"
      aria-label={`Tree ${tree.id + 1} with ${leaves.length} leaves`}
    >
      <defs>
        <linearGradient id="trunk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6f4d35" />
          <stop offset="100%" stopColor="#40291d" />
        </linearGradient>
        <radialGradient id="groundGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(214, 228, 199, 0.9)" />
          <stop offset="100%" stopColor="rgba(214, 228, 199, 0)" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="360" rx="128" ry="28" fill="url(#groundGlow)" />
      <path
        d="M197 352 C 192 292, 188 262, 190 214 C 191 172, 201 146, 203 112 C 205 82, 199 66, 200 52"
        fill="none"
        stroke="url(#trunk)"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M200 190 C 164 176, 138 148, 122 114"
        fill="none"
        stroke="#62412d"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M202 166 C 236 152, 258 126, 274 92"
        fill="none"
        stroke="#62412d"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M198 230 C 166 224, 132 206, 102 174"
        fill="none"
        stroke="#5c3f2f"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M203 220 C 236 214, 270 194, 304 160"
        fill="none"
        stroke="#5c3f2f"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {leaves.map((leaf, index) => {
        const position = getLeafPosition(index, leaves.length);
        const hue = 110 + (index % 7) * 5;
        const delay = `${index * 0.03}s`;

        return (
          <g
            key={`${leaf.date}-${index}`}
            className="leaf"
            style={{ animationDelay: delay }}
            transform={`translate(${position.x} ${position.y})`}
          >
            <g transform={`rotate(${index % 2 === 0 ? -18 : 18})`}>
              <ellipse
                cx="0"
                cy="0"
                rx="10"
                ry="16"
                fill={`hsl(${hue} 36% ${50 + (index % 4) * 3}%)`}
              />
              <path d="M 0 -10 L 0 9" stroke="rgba(255,255,255,0.32)" strokeWidth="1.2" />
            </g>
            <title>{`${formatDate(leaf.date)} — ${leaf.text}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  const [state, setState] = useState<LifeTreeState | null>(null);
  const [draft, setDraft] = useState("");
  const [selectedTreeId, setSelectedTreeId] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as LifeTreeState;

      if (parsed.startedAt && Array.isArray(parsed.entries)) {
        setState(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const trees = useMemo(() => (state ? groupTrees(state) : []), [state]);

  useEffect(() => {
    if (trees.length === 0) {
      return;
    }

    setSelectedTreeId(trees.length - 1);
  }, [trees.length]);

  const selectedTree = trees[selectedTreeId] ?? trees[trees.length - 1];
  const todayKey = getTodayKey();
  const hasWrittenToday = Boolean(state?.entries.find((entry) => entry.date === todayKey));
  const totalLeaves = state?.entries.length ?? 0;

  const plantSeed = () => {
    const today = todayKey;
    setState({
      startedAt: today,
      entries: []
    });
  };

  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!state || hasWrittenToday) {
      return;
    }

    const text = draft.trim();

    if (!text) {
      return;
    }

    setState({
      ...state,
      entries: [...state.entries, { date: todayKey, text }]
    });
    setDraft("");
  };

  if (!state) {
    return (
      <main className="shell">
        <section className="hero hero-seed">
          <div className="seed-orbit" aria-hidden="true">
            <div className="seed" />
          </div>
          <p className="eyebrow">Life Tree</p>
          <h1>A tree grows with your life.</h1>
          <p className="intro">
            One sentence a day becomes one leaf. A quiet record, growing slowly with time.
          </p>
          <button className="primary-button" onClick={plantSeed}>
            Plant the seed
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Quiet archive</p>
          <h1>Your life is growing into a forest.</h1>
          <p className="intro">
            No edits. No deletions. One sentence each day, carried forward as a leaf.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <span className="stat-label">Leaves</span>
            <strong>{totalLeaves}</strong>
          </div>
          <div>
            <span className="stat-label">Trees</span>
            <strong>{Math.max(trees.length, 1)}</strong>
          </div>
          <div>
            <span className="stat-label">Started</span>
            <strong>{formatDate(state.startedAt)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel panel-tree">
          {selectedTree ? (
            <>
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">Current view</p>
                  <h2>Tree {selectedTree.id + 1}</h2>
                </div>
                <p className="panel-meta">
                  {selectedTree.entries.length} / {MAX_LEAVES_PER_TREE} leaves
                </p>
              </div>
              <TreeCanvas tree={selectedTree} />
            </>
          ) : (
            <div className="empty-tree">
              <p>The first leaf has not arrived yet.</p>
            </div>
          )}
        </div>

        <div className="panel panel-compose">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Today</p>
              <h2>{formatDate(todayKey)}</h2>
            </div>
            <p className="panel-meta">
              {hasWrittenToday ? "Today is already held by a leaf." : "One short sentence."}
            </p>
          </div>

          <form onSubmit={saveEntry} className="composer">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={140}
              placeholder="A moment worth keeping."
              disabled={hasWrittenToday}
            />
            <div className="composer-footer">
              <span>{draft.trim().length} / 140</span>
              <button className="primary-button" type="submit" disabled={hasWrittenToday}>
                Save today&apos;s leaf
              </button>
            </div>
          </form>

          <div className="rules">
            <p>Records cannot be edited.</p>
            <p>Records cannot be deleted.</p>
            <p>The tree grows only once per day.</p>
          </div>
        </div>
      </section>

      <section className="forest">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Forest</p>
            <h2>All trees</h2>
          </div>
        </div>

        <div className="forest-grid">
          {trees.length === 0 ? (
            <article className="forest-card forest-card-empty">
              <p>Tree 1 is waiting for its first leaf.</p>
            </article>
          ) : (
            trees.map((tree) => (
              <button
                key={tree.id}
                className={`forest-card ${tree.id === selectedTreeId ? "active" : ""}`}
                onClick={() => setSelectedTreeId(tree.id)}
                type="button"
              >
                <span>Tree {tree.id + 1}</span>
                <strong>{tree.entries.length} leaves</strong>
                <small>Started {formatDate(tree.startDate)}</small>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="timeline">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Leaves</p>
            <h2>Recent memory</h2>
          </div>
        </div>

        <div className="timeline-list">
          {state.entries.length === 0 ? (
            <article className="timeline-item timeline-empty">
              <p>Write the first sentence to grow the first leaf.</p>
            </article>
          ) : (
            [...state.entries].reverse().map((entry) => (
              <article key={`${entry.date}-${entry.text}`} className="timeline-item">
                <span>{formatDate(entry.date)}</span>
                <p>{entry.text}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
