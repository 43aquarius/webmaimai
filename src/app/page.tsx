'use client';

/**
 * 舞萌 Web — 主页面（游戏状态机）
 * title → select → game → results
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChartType, Difficulty, GameSettings, PlayResult, SongDef } from '@/lib/maimai/types';
import { MusicSequencer } from '@/lib/audio/sequencer';
import { SFX } from '@/lib/audio/instruments';
import { SONGS, GENRES } from '@/lib/maimai/songs';
import { getSettings, setSettings } from '@/lib/maimai/storage';
import TitleScreen from '@/components/maimai/TitleScreen';
import SongSelect from '@/components/maimai/SongSelect';
import GameScreen from '@/components/maimai/GameScreen';
import ResultsScreen from '@/components/maimai/ResultsScreen';
import SettingsPanel from '@/components/maimai/SettingsPanel';
import HowtoOverlay from '@/components/maimai/HowtoOverlay';

type Screen = 'title' | 'select' | 'game' | 'results';

export default function Page() {
  const [screen, setScreen] = useState<Screen>('title');
  const [song, setSong] = useState<SongDef>(SONGS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('MASTER');
  const [chartType, setChartType] = useState<ChartType>('STD');
  const [genre, setGenre] = useState<string>('全部');
  const [result, setResult] = useState<PlayResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);
  const [settings, setSettingsState] = useState<GameSettings>({ speed: 5, offsetMs: 0, volume: 0.85, autoPlay: false });

  const seqRef = useRef<MusicSequencer | null>(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const seq = useMemo(() => {
    if (!seqRef.current) seqRef.current = new MusicSequencer();
    return seqRef.current;
  }, []);

  /** 首次交互解锁音频 */
  const unlockAudio = useCallback(() => {
    const ctx = seq.init();
    if (ctx) seq.setVolume(settings.volume);
    return ctx;
  }, [seq, settings.volume]);

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      setSettings(next);
      seq.setVolume(next.volume);
      return next;
    });
  }, [seq]);

  /* ---------- 画面流转 ---------- */

  const goTitle = useCallback(() => {
    seq.stop();
    setScreen('title');
  }, [seq]);

  const goSelect = useCallback(() => {
    seq.stop();
    setScreen('select');
  }, [seq]);

  const startGame = useCallback((s: SongDef, d: Difficulty, t: ChartType) => {
    unlockAudio();
    if (seq.I) SFX.songDecide(seq.I, seq.audioTime);
    setSong(s);
    setDifficulty(d);
    setChartType(t);
    setScreen('game');
  }, [seq, unlockAudio]);

  const onGameFinish = useCallback((r: PlayResult) => {
    setResult(r);
    setScreen('results');
  }, []);

  /* ---------- 全局按键（标题界面任意键开始） ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screenRef.current === 'title' && !settingsOpen && !howtoOpen) {
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyS') {
          e.preventDefault();
          const ctx = unlockAudio();
          if (ctx && seqRef.current?.I) SFX.coin(seqRef.current.I, seqRef.current.audioTime);
          setTimeout(() => setScreen('select'), 260);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlockAudio, settingsOpen, howtoOpen]);

  const songsOfGenre = useMemo(
    () => (genre === '全部' ? SONGS : SONGS.filter((s) => s.category === genre)),
    [genre],
  );

  // 分类切换后若当前选曲不在列表内，自动回到列表首曲
  useEffect(() => {
    if (screen === 'select' && !songsOfGenre.some((s) => s.id === song.id)) {
      setSong(songsOfGenre[0] ?? SONGS[0]);
    }
  }, [songsOfGenre, screen, song.id]);

  return (
    <main className="fixed inset-0 bg-[#060a1c] text-white overflow-hidden">
      {screen === 'title' && (
        <TitleScreen
          onStart={() => {
            const ctx = unlockAudio();
            if (ctx && seqRef.current?.I) SFX.coin(seqRef.current.I, seqRef.current.audioTime);
            setTimeout(() => setScreen('select'), 260);
          }}
          onHowto={() => setHowtoOpen(true)}
        />
      )}

      {screen === 'select' && (
        <SongSelect
          seq={seq}
          songs={songsOfGenre}
          genres={[...GENRES]}
          genre={genre}
          onGenre={setGenre}
          onSong={setSong}
          onDifficulty={setDifficulty}
          onChartType={setChartType}
          onPlay={startGame}
          onBack={goTitle}
          onSettings={() => setSettingsOpen(true)}
          onHowto={() => setHowtoOpen(true)}
          selectedSong={song}
          selectedDifficulty={difficulty}
          selectedChartType={chartType}
          unlockAudio={unlockAudio}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={`${song.id}:${difficulty}:${chartType}:${Date.now()}`}
          song={song}
          difficulty={difficulty}
          chartType={chartType}
          settings={settings}
          seq={seq}
          onFinish={onGameFinish}
          onQuit={goSelect}
          onRetry={() => startGame(song, difficulty, chartType)}
        />
      )}

      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          song={song}
          onRetry={() => startGame(song, difficulty, chartType)}
          onSelect={goSelect}
        />
      )}

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
      <HowtoOverlay open={howtoOpen} onClose={() => setHowtoOpen(false)} />
    </main>
  );
}
