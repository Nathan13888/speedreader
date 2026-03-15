"use client";

import { useEffect } from "react";
import { useRSVPPlayer } from "../../hooks/useRSVPPlayer";
import { getFontById } from "../../lib/fonts";
import { loadWpm } from "../../lib/session";
import { PlaybackControls } from "./PlaybackControls";
import styles from "./ReaderZone.module.css";
import { RSVPDisplay } from "./RSVPDisplay";
import { StatsBar } from "./StatsBar";

interface ReaderZoneProps {
  text: string;
  startIndex: number;
  onClose: () => void;
  fontId: string;
  onFontChange: (id: string) => void;
}

export function ReaderZone({ text, startIndex, onClose, fontId, onFontChange }: ReaderZoneProps) {
  const savedWpm = loadWpm() ?? 250;
  const player = useRSVPPlayer(savedWpm);

  const font = getFontById(fontId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: player.load is stable; re-running on text/startIndex change is intentional
  useEffect(() => {
    player.load(text, startIndex);
  }, [text, startIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (player.isPlaying) player.pause();
          else player.play();
          break;
        case "ArrowLeft":
          e.preventDefault();
          player.seekDelta(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          player.seekDelta(10);
          break;
        case "[":
          player.setWpm(player.wpm - 25);
          break;
        case "]":
          player.setWpm(player.wpm + 25);
          break;
        case "Escape":
          player.pause();
          onClose();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, onClose]);

  const currentWord = player.words[player.index] ?? "";

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => {
            player.pause();
            onClose();
          }}
          title="Close  Esc"
        >
          ← Back
        </button>
        <StatsBar
          index={player.index}
          total={player.words.length}
          wpm={player.wpm}
          elapsedMs={player.elapsedMs}
          estimatedRemainingMs={player.estimatedRemainingMs}
        />
      </div>

      <div className={styles.displayArea}>
        <RSVPDisplay word={currentWord} isPlaying={player.isPlaying} fontFamily={font.fontFamily} />
      </div>

      <div className={styles.controlsArea}>
        <PlaybackControls
          isPlaying={player.isPlaying}
          progress={player.progress}
          wpm={player.wpm}
          totalWords={player.words.length}
          currentIndex={player.index}
          onPlay={player.play}
          onPause={player.pause}
          onSeekDelta={player.seekDelta}
          onSeek={player.seek}
          onWpmChange={player.setWpm}
          fontId={fontId}
          onFontChange={onFontChange}
        />
      </div>

      <div className={styles.shortcutHint}>
        <kbd>Space</kbd> play/pause &nbsp;·&nbsp;
        <kbd>←</kbd>
        <kbd>→</kbd> seek &nbsp;·&nbsp;
        <kbd>[</kbd>
        <kbd>]</kbd> WPM &nbsp;·&nbsp;
        <kbd>Esc</kbd> back
      </div>
    </div>
  );
}
