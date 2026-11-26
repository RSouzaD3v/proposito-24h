"use client";

import { useSyncExternalStore } from "react";

/**
 * Atmosfera Devocional (web): até dois sons em loop — um instrumental e um da criação — tocando juntos.
 *
 * Usa a Web Audio API em vez de <audio loop>: o loop do buffer não tem emenda e o volume via GainNode
 * funciona também no Safari do iPhone (que ignora `audio.volume`).
 * O estado vive no módulo, então a música continua enquanto o usuário navega entre as páginas.
 */

export type AtmosphereCategory = "instrumental" | "nature";

export interface AtmosphereSound {
  id: string;
  label: string;
  /** Gradiente do cartão. */
  colors: [string, string];
  /** `null` enquanto o áudio não foi gravado: o cartão aparece como "Em breve". */
  src: string | null;
}

/** Para liberar um som "Em breve": coloque o mp3 em public/atmosphere/ e preencha o `src`. */
export const ATMOSPHERE_SOUNDS: Record<AtmosphereCategory, AtmosphereSound[]> = {
  instrumental: [
    { id: "piano", label: "Piano suave", colors: ["#3b3a36", "#141311"], src: "/atmosphere/piano.mp3" },
    { id: "violao", label: "Violão acústico", colors: ["#8a5a2b", "#2e1a0c"], src: "/atmosphere/violao.mp3" },
    { id: "harpa", label: "Harpa", colors: ["#8c6a2f", "#2a1d0b"], src: null },
    { id: "cordas", label: "Cordas suaves", colors: ["#7a3622", "#24100a"], src: null },
    { id: "adoracao", label: "Instrumental de adoração", colors: ["#d28a3c", "#3a2414"], src: "/atmosphere/adoracao.mp3" },
  ],
  nature: [
    { id: "chuva", label: "Chuva tranquila", colors: ["#4f6b63", "#16231f"], src: "/atmosphere/chuva.mp3" },
    { id: "riacho", label: "Riacho", colors: ["#3f7a5a", "#10261b"], src: null },
    { id: "passaros", label: "Pássaros ao amanhecer", colors: ["#7f9a3f", "#24300f"], src: "/atmosphere/passaros.mp3" },
    { id: "ondas", label: "Ondas do mar", colors: ["#3c7a97", "#0f2733"], src: "/atmosphere/ondas.mp3" },
    { id: "vento", label: "Vento entre as árvores", colors: ["#8a8a3e", "#26260f"], src: null },
  ],
};

export const CATEGORIES: { key: AtmosphereCategory; title: string }[] = [
  { key: "instrumental", title: "Músicas instrumentais" },
  { key: "nature", title: "Sons da criação" },
];

export function findSound(category: AtmosphereCategory, id: string | null | undefined) {
  return ATMOSPHERE_SOUNDS[category].find((sound) => sound.id === id && sound.src != null) ?? null;
}

export interface AtmosphereState {
  instrumental: string | null;
  nature: string | null;
  volumes: Record<AtmosphereCategory, number>;
  playing: boolean;
  /** Algum som ainda está sendo baixado. */
  loading: boolean;
}

const STORAGE_KEY = "atmosphere.config";
const KEYS: AtmosphereCategory[] = ["instrumental", "nature"];
/** Quanto do volume fica enquanto uma narração toca. */
const DUCK_LEVEL = 0.3;
const FADE_IN = 1.4;
const FADE_OUT = 0.6;
const FADE_SWAP = 0.35;

const DEFAULT_STATE: AtmosphereState = { instrumental: null, nature: null, volumes: { instrumental: 0.4, nature: 0.7 }, playing: false, loading: false };
let state: AtmosphereState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emit(next: Partial<AtmosphereState>, persist = true) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
  if (persist) {
    try {
      const { instrumental, nature, volumes } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ instrumental, nature, volumes }));
    } catch {
      // modo privado / armazenamento cheio: só não lembra a escolha
    }
  }
}

let hydrated = false;
/** Recupera a última combinação usada (sem começar a tocar). */
export function hydrateAtmosphere() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<AtmosphereState>;
    const clamp = (value: unknown, fallback: number) => (typeof value === "number" && value >= 0 && value <= 1 ? value : fallback);
    emit(
      {
        instrumental: findSound("instrumental", saved.instrumental)?.id ?? null,
        nature: findSound("nature", saved.nature)?.id ?? null,
        volumes: { instrumental: clamp(saved.volumes?.instrumental, state.volumes.instrumental), nature: clamp(saved.volumes?.nature, state.volumes.nature) },
      },
      false,
    );
  } catch {
    // configuração antiga/corrompida: começa do zero
  }
}

// ---------- Áudio ----------

let ctx: AudioContext | null = null;
let duckNode: GainNode | null = null;
let ducked = false;

interface Channel {
  /** Volume escolhido pelo usuário. */
  volume: GainNode | null;
  /** Fade de entrada/saída. */
  fade: GainNode | null;
  source: AudioBufferSourceNode | null;
  trackId: string | null;
  /** Incrementa a cada troca, para descartar carregamentos/fades atrasados. */
  version: number;
}

const channels: Record<AtmosphereCategory, Channel> = {
  instrumental: { volume: null, fade: null, source: null, trackId: null, version: 0 },
  nature: { volume: null, fade: null, source: null, trackId: null, version: 0 },
};

const buffers = new Map<string, Promise<{ buffer: AudioBuffer; start: number; end: number }>>();

function audioContext() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    duckNode = ctx.createGain();
    duckNode.gain.value = ducked ? DUCK_LEVEL : 1;
    duckNode.connect(ctx.destination);
    for (const key of KEYS) {
      const channel = channels[key];
      channel.volume = ctx.createGain();
      channel.volume.gain.value = state.volumes[key];
      channel.fade = ctx.createGain();
      channel.fade.gain.value = 0;
      channel.fade.connect(channel.volume);
      channel.volume.connect(duckNode);
    }
  }
  return ctx;
}

/**
 * Baixa e decodifica o som. Os trechos de silêncio do início/fim (padding do mp3) ficam fora do loop,
 * para a volta não ter "buraco".
 */
function loadBuffer(src: string) {
  let pending = buffers.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Falha ao baixar ${src}`);
        return response.arrayBuffer();
      })
      .then((data) => audioContext().decodeAudioData(data))
      .then((buffer) => {
        const threshold = 0.0005;
        const channelsData = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
        const loud = (i: number) => channelsData.some((data) => Math.abs(data[i]) > threshold);
        let first = 0;
        while (first < buffer.length - 1 && !loud(first)) first++;
        let last = buffer.length - 1;
        while (last > first && !loud(last)) last--;
        return { buffer, start: first / buffer.sampleRate, end: (last + 1) / buffer.sampleRate };
      });
    pending.catch(() => buffers.delete(src));
    buffers.set(src, pending);
  }
  return pending;
}

function rampTo(param: AudioParam, value: number, seconds: number) {
  const now = audioContext().currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + Math.max(seconds, 0.02));
}

function stopSource(channel: Channel) {
  try {
    channel.source?.stop();
  } catch {
    // já parado
  }
  channel.source?.disconnect();
  channel.source = null;
  channel.trackId = null;
}

let pendingLoads = 0;
function setLoading(delta: number) {
  pendingLoads = Math.max(0, pendingLoads + delta);
  if (state.loading !== pendingLoads > 0) emit({ loading: pendingLoads > 0 }, false);
}

/** Toca o som escolhido da categoria (troca suave se outro já estiver tocando). */
async function startChannel(category: AtmosphereCategory) {
  const sound = findSound(category, state[category]);
  const channel = channels[category];
  if (!sound?.src) return;
  const context = audioContext();
  const fade = channel.fade!;

  if (channel.source && channel.trackId === sound.id) {
    rampTo(fade.gain, 1, FADE_IN);
    return;
  }

  const version = ++channel.version;
  if (channel.source) {
    rampTo(fade.gain, 0, FADE_SWAP);
    await new Promise((resolve) => setTimeout(resolve, FADE_SWAP * 1000));
    if (version !== channel.version) return;
    stopSource(channel);
  }

  setLoading(1);
  try {
    const { buffer, start, end } = await loadBuffer(sound.src);
    if (version !== channel.version || !state.playing || state[category] !== sound.id) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = start;
    source.loopEnd = end;
    source.connect(fade);
    fade.gain.cancelScheduledValues(context.currentTime);
    fade.gain.setValueAtTime(0, context.currentTime);
    source.start(0, start);
    channel.source = source;
    channel.trackId = sound.id;
    rampTo(fade.gain, 1, FADE_IN);
  } catch {
    if (version === channel.version) emit({ [category]: null });
  } finally {
    setLoading(-1);
  }
}

function stopChannel(category: AtmosphereCategory) {
  const channel = channels[category];
  if (!channel.source || !channel.fade) return;
  const version = ++channel.version;
  rampTo(channel.fade.gain, 0, FADE_OUT);
  setTimeout(() => {
    if (version === channel.version) stopSource(channel);
  }, FADE_OUT * 1000 + 50);
}

let suspendTimer: ReturnType<typeof setTimeout> | null = null;

function play() {
  if (!KEYS.some((key) => findSound(key, state[key]))) return;
  const context = audioContext();
  if (suspendTimer) clearTimeout(suspendTimer);
  suspendTimer = null;
  void context.resume();
  emit({ playing: true }, false);
  for (const key of KEYS) if (state[key]) void startChannel(key);
}

function pause() {
  emit({ playing: false }, false);
  if (!ctx) return;
  for (const key of KEYS) if (channels[key].fade) rampTo(channels[key].fade!.gain, 0, FADE_OUT);
  // Suspende o contexto depois do fade: ao retomar, cada som continua de onde parou.
  if (suspendTimer) clearTimeout(suspendTimer);
  suspendTimer = setTimeout(() => {
    suspendTimer = null;
    if (!state.playing) void ctx?.suspend();
  }, FADE_OUT * 1000 + 50);
}

// ---------- Ações usadas pela interface ----------

/** Marca/desmarca um som. Escolher um som já começa a tocar a atmosfera. */
export function selectSound(category: AtmosphereCategory, id: string) {
  hydrateAtmosphere();
  const deselect = state[category] === id;
  emit({ [category]: deselect ? null : id });
  if (deselect) {
    stopChannel(category);
    if (!KEYS.some((key) => state[key])) pause();
    return;
  }
  if (state.playing) void startChannel(category);
  else play();
}

export function setAtmosphereVolume(category: AtmosphereCategory, volume: number) {
  const value = Math.max(0, Math.min(1, volume));
  emit({ volumes: { ...state.volumes, [category]: value } });
  const node = channels[category].volume;
  if (node && ctx) node.gain.setTargetAtTime(value, ctx.currentTime, 0.03);
}

/** O botão único: pausa ou retoma a atmosfera inteira. */
export function toggleAtmosphere() {
  hydrateAtmosphere();
  if (state.playing) pause();
  else play();
}

const narrating = new Set<object>();
/**
 * Avisa que uma narração começou/parou: enquanto ela toca, a atmosfera fica baixinha ao fundo.
 * Os <audio> que estão na página são detectados sozinhos (ver abaixo); `new Audio()` solto chama isto.
 */
export function setNarrationActive(owner: object, active: boolean) {
  if (active) narrating.add(owner);
  else narrating.delete(owner);
  const next = narrating.size > 0;
  if (next === ducked) return;
  ducked = next;
  if (duckNode && ctx) rampTo(duckNode.gain, ducked ? DUCK_LEVEL : 1, 0.8);
}

if (typeof document !== "undefined") {
  // Eventos de mídia não sobem na árvore, mas passam pela fase de captura do documento.
  const onMedia = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement) || target instanceof HTMLVideoElement) return;
    setNarrationActive(target, event.type === "play" || event.type === "playing");
  };
  for (const type of ["play", "playing", "pause", "ended", "emptied"]) document.addEventListener(type, onMedia, true);
}

export function describeAtmosphere(value: Pick<AtmosphereState, "instrumental" | "nature">) {
  return [findSound("instrumental", value.instrumental)?.label, findSound("nature", value.nature)?.label].filter(Boolean).join(" + ");
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useAtmosphere() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT_STATE,
  );
}
