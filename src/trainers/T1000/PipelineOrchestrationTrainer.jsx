import { useState, useMemo } from "react";

// ============================================================================
// PipelineOrchestrationTrainer.jsx
// Lern-Trainer für: src/pipeline.py (MasterThesisFat)
// Typ: Mix — Line-by-line-Explainer + Stufen-Simulator + Glossar + Quiz
// Alle Code-Snippets sind wörtlich aus der Datei übernommen, Zeilennummern
// entsprechen exakt der Quelle.
// ============================================================================

// ---------------------------------------------------------------------------
// Styling: GitHub-Dark-Palette + wiederkehrende Inline-Styles
// (Das Projekt hat kein Tailwind — alle Trainer stylen inline.)
// ---------------------------------------------------------------------------
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Roboto,Helvetica,Arial,sans-serif";
const MONO = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace";

const C = {
  bg: "#0d1117",
  panel: "#161b22",
  panelSoft: "#1c2128",
  line: "#30363d",
  text: "#c9d1d9",
  bright: "#e6edf3",
  dim: "#8b949e",
  faint: "#484f58",
  blue: "#58a6ff",
  codeBlue: "#79c0ff",
  green: "#3fb950",
  red: "#f85149",
  yellow: "#d29922",
  purple: "#bc8cff",
};

const card = { borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel };
const codePre = {
  margin: 0,
  overflowX: "auto",
  borderRadius: 6,
  background: C.bg,
  padding: 12,
  fontFamily: MONO,
  fontSize: 13,
  color: C.text,
};
const advBadge = {
  marginLeft: 8,
  borderRadius: 4,
  background: "#3d2c00",
  padding: "2px 6px",
  fontSize: 11,
  fontWeight: 600,
  color: C.yellow,
};
const col = (gap) => ({ display: "flex", flexDirection: "column", gap });

// ---------------------------------------------------------------------------
// Hilfs-Renderer: wandelt `code` in Erklärtexten in <code>-Spans um
// ---------------------------------------------------------------------------
function T({ s }) {
  const parts = String(s).split("`");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            style={{
              borderRadius: 4,
              background: "#1c2431",
              padding: "1px 4px",
              fontFamily: MONO,
              fontSize: "0.85em",
              color: C.codeBlue,
            }}
          >
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Code-Block mit Original-Zeilennummern
// ---------------------------------------------------------------------------
function CodeBlock({ start, code, dim = false }) {
  const lines = code.split("\n");
  return (
    <pre
      style={{
        margin: 0,
        overflowX: "auto",
        borderRadius: 6,
        background: C.bg,
        padding: 12,
        fontSize: 13,
        lineHeight: 1.6,
        opacity: dim ? 0.6 : 1,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex" }}>
          <span
            style={{
              width: 48,
              flexShrink: 0,
              userSelect: "none",
              paddingRight: 12,
              textAlign: "right",
              fontFamily: MONO,
              color: C.faint,
            }}
          >
            {start + i}
          </span>
          <code style={{ whiteSpace: "pre", fontFamily: MONO, color: C.text }}>
            {line === "" ? " " : line}
          </code>
        </div>
      ))}
    </pre>
  );
}

// ===========================================================================
// DATEN: Code-Explorer — logische Sektionen mit klickbaren Zeilengruppen
// ===========================================================================
const SECTIONS = [
  {
    id: "s1",
    title: "1 · Modul-Kopf & Imports",
    range: "Zeilen 1–47",
    intro:
      "Der Kopf verrät bereits die Architektur: Stdlib für Orchestrierung, numpy/pandas/plotly für Daten, und Projekt-Imports, die exakt die Pipeline-Stages spiegeln.",
    groups: [
      {
        id: "s1g1",
        start: 1,
        title: "Docstring & future-Import",
        code: `"""Reusable orchestration for the thesis preprocessing pipeline."""

from __future__ import annotations`,
        advanced: true,
        text:
          "Zeile 1 ist der Modul-Docstring: ein String als allererste Anweisung wird von Python als Dokumentation des Moduls gespeichert (abrufbar via `help()`). Zeile 3 ist Pflichtwissen für diese Datei: `from __future__ import annotations` sorgt dafür, dass alle Type Hints nur als Strings gespeichert und nicht beim Laden ausgewertet werden. Nur deshalb darf die Datei moderne Syntax wie `float | None` (Z. 109) und `tuple[PipelineStage, ...]` (Z. 64) auch auf Python 3.8/3.9 verwenden. Wichtig: Dieser Import muss vor allen anderen Imports stehen — sonst SyntaxError.",
      },
      {
        id: "s1g2",
        start: 5,
        title: "Stdlib- und Third-Party-Imports",
        code: `import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import plotly.graph_objects as go`,
        text:
          "Zwei Blöcke, durch Leerzeile getrennt — das ist PEP-8-Konvention: erst Standardbibliothek (alphabetisch), dann Fremdpakete. Die Aliase `np`, `pd`, `go` sind feste Community-Konventionen, keine freie Wahl des Autors. `from X import Y` holt einzelne Namen direkt in den Namespace (`Path` statt `pathlib.Path`) — der Autor nutzt das für die vier zentralen Bausteine der Datei: `dataclass`, `datetime`, `Enum`, `Path`. `Any` aus `typing` wird für die JSON-Konvertierung gebraucht, wo der Typ wirklich beliebig ist (Z. 195).",
      },
      {
        id: "s1g3",
        start: 18,
        title: "Projekt-Imports — die Landkarte der Pipeline",
        code: `from src.preprocessing.cycle_detection import detect_candidate_cycles
from src.preprocessing.multi_sensor_cycle_extraction import list_experiment_signals
from src.preprocessing.session_detection import (
    DEFAULT_SESSION_GAP_SECONDS,
    detect_recording_sessions,
)
from src.preprocessing.time_gap_analysis import (
    analyze_time_gaps,
    plot_time_gap_histogram,
    save_time_gap_statistics,
)
from src.preprocessing.validation_cycle_selection import select_validation_cycles
from src.storage.batched_measurement_writer import (
    MEASUREMENTS_DIRECTORY_NAME,
    SIGNAL_SUMMARY_FILE_NAME,
    write_measurement_batches,
)
from src.storage.cycle_index_writer import write_cycle_index
from src.storage.cycle_quality_profiler import build_cycle_quality_profile
from src.storage.feature_writer import build_cycle_feature_table
from src.utils.data_loader import (
    build_int_signal_info_from_metadata,
    build_uuid_signal_info_from_metadata,
    find_signals,
    load_metadata,
)
from src.utils.measurement_loader import load_uuid_signal
from src.visualization.multi_sensor_cycle_plot import plot_multi_sensor_cycle`,
        text:
          "Die Klammer-Schreibweise `from X import (a, b, c)` ist das Idiom für mehrzeilige Imports — keine Backslashes nötig. Inhaltlich ist das die Landkarte des Projekts: `preprocessing` (Fachlogik pro Stage), `storage` (Parquet-Writer), `utils` (Loader), `visualization`. Beachte, dass auch Konstanten importiert werden (`DEFAULT_SESSION_GAP_SECONDS`, `MEASUREMENTS_DIRECTORY_NAME`): Der Autor vermeidet so, Magic Strings/Zahlen zu duplizieren — die Wahrheit lebt im jeweiligen Modul, pipeline.py referenziert sie nur.",
      },
      {
        id: "s1g4",
        start: 47,
        title: "Modul-Logger",
        code: `logger = logging.getLogger(__name__)`,
        text:
          "Standard-Idiom für Logging: `__name__` ist hier der Modulpfad `src.pipeline`, d. h. jede Log-Zeile trägt automatisch ihre Herkunft und lässt sich zentral pro Modul filtern. Der Autor nutzt konsequent `logger.info(...)` statt `print()` — wichtig für eine Pipeline, die lange läuft und deren Ausgaben man in Dateien umleiten will. Beachte später das Format `logger.info(\"... %d ...\", wert)` (Z. 297): Die Platzhalter werden nur ausgefüllt, wenn das Log-Level aktiv ist (lazy formatting) — deshalb kein f-String im Logging.",
      },
    ],
  },
  {
    id: "s2",
    title: "2 · Stage-Modell: Enum + drei Register",
    range: "Zeilen 50–96",
    intro:
      "Das Herzstück des Designs: EINE Enum definiert die Identität der Stages, drei getrennte Register beantworten drei getrennte Fragen — Reihenfolge, Implementierungsstatus, Ordnername.",
    groups: [
      {
        id: "s2g1",
        start: 50,
        title: "⚡ Enum mit str-Mixin",
        advanced: true,
        code: `class PipelineStage(str, Enum):
    """Ordered pipeline stages."""

    METADATA = "metadata"
    SIGNAL_DISCOVERY = "signal_discovery"
    TIMESTAMP_ANALYSIS = "timestamp_analysis"
    SESSION_DETECTION = "session_detection"
    CYCLE_DETECTION = "cycle_detection"
    MULTI_SENSOR_EXTRACTION = "multi_sensor_extraction"
    CYCLE_QUALITY_PROFILING = "cycle_quality_profiling"
    FEATURE_ENGINEERING = "feature_engineering"
    DATASET_GENERATION = "dataset_generation"`,
        text:
          "`class PipelineStage(str, Enum)` ist Mehrfachvererbung mit Absicht: Jedes Mitglied ist gleichzeitig ein Enum-Mitglied UND ein echter String. Konsequenz: `PipelineStage.METADATA == \"metadata\"` ist True, und die Stage lässt sich direkt in JSON oder Log-Strings verwenden. Warum der Autor das braucht: `stop_after` kommt als String aus der Config (YAML/CLI), und `PipelineStage(stage_name)` in Zeile 151 parst diesen String zurück ins Enum-Mitglied. Die Reihenfolge der Basisklassen (`str` vor `Enum`) ist Pflicht — andersherum gibt es einen TypeError. Ab Python 3.11 gäbe es dafür `StrEnum`; der Autor bleibt beim kompatiblen Muster.",
      },
      {
        id: "s2g2",
        start: 64,
        title: "STAGE_ORDER — die Reihenfolge als Tuple",
        code: `STAGE_ORDER: tuple[PipelineStage, ...] = (
    PipelineStage.METADATA,
    PipelineStage.SIGNAL_DISCOVERY,
    PipelineStage.TIMESTAMP_ANALYSIS,
    PipelineStage.SESSION_DETECTION,
    PipelineStage.CYCLE_DETECTION,
    PipelineStage.MULTI_SENSOR_EXTRACTION,
    PipelineStage.CYCLE_QUALITY_PROFILING,
    PipelineStage.FEATURE_ENGINEERING,
    PipelineStage.DATASET_GENERATION,
)
IMPLEMENTED_STAGES: frozenset[PipelineStage] = frozenset(
    {
        PipelineStage.METADATA,
        PipelineStage.SIGNAL_DISCOVERY,
        PipelineStage.TIMESTAMP_ANALYSIS,
        PipelineStage.SESSION_DETECTION,
        PipelineStage.CYCLE_DETECTION,
        PipelineStage.MULTI_SENSOR_EXTRACTION,
        PipelineStage.CYCLE_QUALITY_PROFILING,
    }
)
STAGE_DIRECTORIES: dict[PipelineStage, str] = {
    PipelineStage.METADATA: "metadata",
    PipelineStage.SIGNAL_DISCOVERY: "signal_discovery",
    PipelineStage.TIMESTAMP_ANALYSIS: "timestamp_analysis",
    PipelineStage.SESSION_DETECTION: "sessions",
    PipelineStage.CYCLE_DETECTION: "cycles",
    PipelineStage.MULTI_SENSOR_EXTRACTION: "multi_sensor",
    PipelineStage.CYCLE_QUALITY_PROFILING: "quality_profiling",
    PipelineStage.FEATURE_ENGINEERING: "features",
    PipelineStage.DATASET_GENERATION: "dataset",
}`,
        text:
          "Drei Register, drei Datenstrukturen, jeweils die fachlich richtige: (1) `STAGE_ORDER` ist ein Tuple — geordnet UND unveränderlich; der Type Hint `tuple[PipelineStage, ...]` bedeutet „beliebig viele Elemente dieses Typs“ (die `...` sind Pflicht-Syntax, kein Platzhalter). (2) `IMPLEMENTED_STAGES` ist ein `frozenset` — ungeordnet, unveränderlich, O(1)-Membership-Test für `stage not in IMPLEMENTED_STAGES` (Z. 162). Es fehlen genau `FEATURE_ENGINEERING` und `DATASET_GENERATION`: geplant, aber noch nicht gebaut — die Datenstruktur dokumentiert den Projektstand. (3) `STAGE_DIRECTORIES` ist ein Dict Enum→Ordnername; beachte, dass die Ordnernamen teils NICHT dem Enum-Wert entsprechen (`SESSION_DETECTION` → \"sessions\") — genau deshalb existiert dieses Mapping, statt einfach `stage.value` als Ordnernamen zu nehmen. ALL_CAPS-Namen signalisieren per Konvention Modul-Konstanten.",
      },
    ],
  },
  {
    id: "s3",
    title: "3 · Konfiguration: zwei Dataclasses",
    range: "Zeilen 99–138",
    intro:
      "PipelineConfig ist die öffentliche Eingabe eines Runs, _RunPaths ein privates, strukturiertes Rückgabeobjekt. Beide nutzen slots=True.",
    groups: [
      {
        id: "s3g1",
        start: 99,
        title: "⚡ PipelineConfig — dataclass(slots=True) mit 20 Feldern",
        advanced: true,
        code: `@dataclass(slots=True)
class PipelineConfig:
    """Validated inputs for one pipeline run."""

    dataset_path: Path
    experiment: str
    stop_after: str
    reference_signal: str = "position"
    # FILTER 1.1 config — None falls back to DEFAULT_SESSION_GAP_SECONDS
    # (3600 s); rationale documented in src/preprocessing/session_detection.py.
    session_gap_seconds: float | None = None
    # FILTER 2.1 config — duplicates the default in cycle_detection.py and
    # example_pipeline.yaml; rationale (and why 1.0 is provisional) documented
    # at detect_candidate_cycles(). Should live in exactly one place.
    movement_threshold: float = 1.0
    output_root: Path = Path("outputs")
    max_cycles_to_extract: int = 3
    extract_all_cycles: bool = False
    cycle_batch_size: int = 500
    resume_extraction: bool = True
    overwrite_existing: bool = False
    selected_extraction_signals: tuple[str, ...] = ()
    validation_cycle_count: int = 3
    required_validation_signals: tuple[str, ...] = ()
    minimum_samples_per_validation_cycle: dict[str, int] | None = None
    require_consecutive_validation_cycles: bool = True
    max_cycles_to_scan_for_validation: int | None = 10_000
    generate_validation_html: bool = True
    generate_cycle_features: bool = False
    parquet_compression: str = "zstd"
    quality_profiling_batch_size: int = 1000`,
        text:
          "`@dataclass` generiert `__init__`, `__repr__` und `__eq__` aus den annotierten Feldern — 20 Felder ohne eine Zeile Boilerplate. `slots=True` (Python 3.10+) fixiert die Attributmenge: weniger Speicher, und ein Tippfehler wie `config.experimnet = ...` wirft sofort AttributeError statt still ein neues Attribut anzulegen — wertvoll bei so vielen Feldern. Regeln, die man hier sieht: Felder OHNE Default (`dataset_path`, `experiment`, `stop_after`) müssen vor allen Feldern MIT Default stehen. Als Defaults für Sequenzen nimmt der Autor `()` (leeres Tuple), nie `[]` — mutable Defaults sind in Dataclasses verboten (bräuchten `default_factory`). `float | None = None` ist ein optionales Feld mit Sentinel: None heißt „nimm den Modul-Default“ (aufgelöst in Z. 518). `10_000` ist ein normales int — der Unterstrich ist nur Lesehilfe. Die FILTER-Kommentare sind Thesis-Dokumentation: Der Autor benennt sogar ehrlich eine bekannte Schwäche (duplizierter Default von `movement_threshold`, „Should live in exactly one place“).",
      },
      {
        id: "s3g2",
        start: 132,
        title: "_RunPaths — private Dataclass als Rückgabetyp",
        code: `@dataclass(slots=True)
class _RunPaths:
    """Paths created for one pipeline run."""

    run_directory: Path
    manifest_path: Path
    stage_directories: dict[PipelineStage, Path]`,
        text:
          "Der führende Unterstrich markiert die Klasse per Konvention als modul-intern (kein Sprachfeature, nur Signal an Leser und Tools). Zweck: `_build_run_paths()` muss drei zusammengehörige Pfade zurückgeben. Statt eines anonymen 3-Tupels (`return a, b, c` — Zugriff über Position) baut der Autor ein benanntes Objekt: `run_paths.manifest_path` liest sich selbsterklärend (siehe Z. 928). Das ist das Muster „kleine Dataclass statt Tuple-Rückgabe“ — lohnend ab zwei Rückgabewerten.",
      },
    ],
  },
  {
    id: "s4",
    title: "4 · Kleine Helfer: Parsen & Validieren",
    range: "Zeilen 141–165",
    intro:
      "Drei Mini-Funktionen, die die Fehlermeldungs-Qualität der Pipeline ausmachen. Alle privat (Unterstrich-Präfix).",
    groups: [
      {
        id: "s4g1",
        start: 141,
        title: "_as_path — Normalisieren ohne Existenz-Zwang",
        code: `def _as_path(value: Path | str) -> Path:
    """Normalize a path-like value without requiring that it already exists."""

    return Path(value).expanduser()`,
        text:
          "`Path | None`-Syntax hattest du schon — hier ist `Path | str` eine Union als Parameter: Aufrufer dürfen Strings ODER Path-Objekte übergeben. `Path(value)` ist idempotent (ein Path bleibt ein Path), `expanduser()` löst `~` zum Home-Verzeichnis auf. Bewusst KEIN `.resolve()`: resolve würde den Pfad absolut machen und (je nach Plattform) Existenz-Semantik einführen — der Docstring benennt genau diese Design-Entscheidung. Output-Pfade existieren ja noch nicht.",
      },
      {
        id: "s4g2",
        start: 147,
        title: "⚡ _normalize_stage — Enum-Parsing mit Exception Chaining",
        advanced: true,
        code: `def _normalize_stage(stage_name: str) -> PipelineStage:
    """Parse one stage name into the stage enum."""

    try:
        return PipelineStage(stage_name)
    except ValueError as exc:
        valid_stages = ", ".join(stage.value for stage in STAGE_ORDER)
        raise ValueError(
            f"Invalid stop_after stage {stage_name!r}. Valid stages: {valid_stages}."
        ) from exc`,
        text:
          "Drei Idiome in acht Zeilen. (1) `PipelineStage(stage_name)` ist der Enum-Konstruktor-Lookup: Er sucht das Mitglied mit diesem VALUE (\"cycle_detection\" → `PipelineStage.CYCLE_DETECTION`) und wirft ValueError bei Unbekanntem. (2) `\", \".join(stage.value for stage in STAGE_ORDER)` ist ein Generator-Ausdruck direkt im join — erzeugt die Liste gültiger Namen für die Fehlermeldung, ohne Zwischenliste. (3) `raise ... from exc` ist Exception Chaining: Die neue, benutzerfreundliche ValueError ersetzt die alte nicht, sondern verkettet sie als `__cause__` — im Traceback erscheinen beide („The above exception was the direct cause of…“). Das `!r` im f-String ruft `repr()` auf: Der fehlerhafte Wert erscheint MIT Anführungszeichen, sodass man z. B. versehentliche Leerzeichen sieht.",
      },
      {
        id: "s4g3",
        start: 159,
        title: "_ensure_stage_is_implemented — NotImplementedError als Vertrag",
        code: `def _ensure_stage_is_implemented(stage: PipelineStage) -> None:
    """Raise a clear error for planned but not yet implemented stages."""

    if stage not in IMPLEMENTED_STAGES:
        raise NotImplementedError(
            f"Pipeline stage {stage.value!r} is defined but not implemented yet."
        )`,
        text:
          "Eine Guard-Funktion: Rückgabetyp `-> None`, ihr einziger Effekt ist die mögliche Exception. `stage not in IMPLEMENTED_STAGES` ist dank frozenset ein O(1)-Hash-Lookup. `NotImplementedError` ist die semantisch korrekte Exception-Klasse für „geplant, aber nicht gebaut“ — nicht zu verwechseln mit dem Objekt `NotImplemented` (das ist ein Rückgabewert für Operator-Overloading, keine Exception). Diese Funktion wird zweimal gerufen: früh für die Ziel-Stage (Z. 890, bevor irgendetwas auf die Platte geschrieben wird) und defensiv nochmal pro Stage in der Hauptschleife (Z. 1022).",
      },
    ],
  },
  {
    id: "s5",
    title: "5 · Run-Verzeichnisse, Manifest & Speichern",
    range: "Zeilen 168–231",
    intro:
      "Die Infrastruktur-Helfer: Verzeichnisbaum pro Run, JSON-Manifest als Laufprotokoll, DataFrame-Speicherer.",
    groups: [
      {
        id: "s5g1",
        start: 168,
        title: "_build_run_paths — Pfad-Komposition mit / und Dict-Comprehension",
        code: `def _build_run_paths(config: PipelineConfig) -> _RunPaths:
    """Create the output directory structure for one run."""

    dataset_name = _as_path(config.dataset_path).name or str(config.dataset_path)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_directory = (
        _as_path(config.output_root)
        / dataset_name
        / config.experiment
        / run_id
    )
    run_directory.mkdir(parents=True, exist_ok=True)

    stage_directories = {
        stage: run_directory / folder_name
        for stage, folder_name in STAGE_DIRECTORIES.items()
    }
    for stage_directory in stage_directories.values():
        stage_directory.mkdir(parents=True, exist_ok=True)

    return _RunPaths(
        run_directory=run_directory,
        manifest_path=run_directory / "run_manifest.json",
        stage_directories=stage_directories,
    )`,
        text:
          "Zeile 171 zeigt das `or`-Fallback-Idiom: `Path(\"data/\").name` wäre der leere String (falsy), dann greift `str(config.dataset_path)` — ein Randfall, den der Autor explizit abfängt. Der `/`-Operator von pathlib (Z. 173–178) ist überladen zum Pfad-Verketten; die Klammern erlauben den mehrzeiligen Ausdruck ohne Backslash. Ergebnis-Schema: `outputs/<dataset>/<experiment>/<zeitstempel>/`. `mkdir(parents=True, exist_ok=True)` ist das `mkdir -p`-Äquivalent: legt Zwischenverzeichnisse an und wirft nichts, wenn es sie schon gibt. Z. 181–184 ist eine Dict-Comprehension mit Tupel-Entpacken über `.items()`: aus dem statischen Register `STAGE_DIRECTORIES` (Enum→Name) wird das run-spezifische Mapping (Enum→konkreter Pfad). Rückgabe als `_RunPaths` mit Keyword-Argumenten — selbstdokumentierend.",
      },
      {
        id: "s5g2",
        start: 195,
        title: "⚡ _json_ready — rekursive Typ-Konvertierung",
        advanced: true,
        code: `def _json_ready(value: Any) -> Any:
    """Convert common runtime values into JSON-serializable structures."""

    if isinstance(value, Path):
        return str(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): _json_ready(inner_value) for key, inner_value in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_ready(item) for item in value]
    return value
`,
        text:
          "Warum nötig: `json.dumps` kennt weder `Path` noch `pd.Timestamp` — beides kommt aber im Manifest vor. Die Funktion ist ein rekursiver Typ-Dispatcher: Blatt-Typen werden konvertiert (Path→str, Timestamp→ISO-String), Container werden per Comprehension neu aufgebaut, wobei sich die Funktion für jeden Inhalt selbst aufruft. `isinstance(value, (list, tuple))` prüft gegen ein TUPEL von Typen — „ist es list ODER tuple?“ in einem Aufruf; beide werden bewusst zu einer JSON-Liste. `str(key)` im Dict-Zweig, weil JSON nur String-Keys erlaubt. Der Typ `Any` ist hier ehrlich: Die Funktion nimmt wirklich alles. Die Reihenfolge der Checks ist egal für Korrektheit, aber die letzte Zeile (`return value`) ist der Fall „schon serialisierbar“ (int, str, bool, None, float).",
      },
      {
        id: "s5g3",
        start: 209,
        title: "_write_manifest & die zwei Speicherer",
        code: `def _write_manifest(manifest_path: Path, manifest: dict[str, Any]) -> None:
    """Persist the current manifest state."""

    manifest_path.write_text(
        json.dumps(_json_ready(manifest), indent=2, sort_keys=True),
        encoding="utf-8",
    )


def _save_frame(frame: pd.DataFrame, output_path: Path) -> Path:
    """Save one DataFrame as CSV."""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(output_path, index=False)
    return output_path


def _save_parquet(frame: pd.DataFrame, output_path: Path) -> Path:
    """Save one DataFrame as Parquet, creating parent directories as needed."""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_parquet(output_path, index=False)
    return output_path`,
        text:
          "`Path.write_text(...)` ersetzt das klassische `open()/write()/close()` in einer Zeile (inkl. Schließen). `json.dumps(..., indent=2, sort_keys=True)`: Einrückung für Menschen, sortierte Keys für stabile, diffbare Dateien — bei einem Manifest, das mehrfach pro Run überschrieben wird, genau richtig. Die beiden Speicherer sind bewusst trivial: Sie kapseln nur das wiederkehrende Trio „Parent-Ordner sicherstellen → schreiben → Pfad zurückgeben“. Dass sie den Pfad ZURÜCKGEBEN, ist der Trick: Jede Stage sammelt so ihre `output_paths` fürs Manifest ein (z. B. Z. 418). `index=False` verhindert, dass pandas den DataFrame-Index als eigene Spalte mitschreibt.",
      },
    ],
  },
  {
    id: "s6",
    title: "6 · NumPy-Helfer für den Validierungsplot",
    range: "Zeilen 251–280",
    intro:
      "Zwei vektorisierte Helfer, damit der Plotly-Plot (Z. 283–402, hier ausgelassen) auch bei Millionen Samples flüssig bleibt: Downsampling und Nearest-Neighbor-Lookup ohne einzige Python-Schleife.",
    groups: [
      {
        id: "s6g1",
        start: 251,
        title: "Downsampling-Konstanten & _evenly_spaced_indices",
        code: `MAX_VALIDATION_POINTS = 20_000
MAX_VALIDATION_CYCLES = 2_000
MAX_VALIDATION_PLOT_CYCLES = 100


def _evenly_spaced_indices(length: int, max_count: int) -> np.ndarray:
    """Return evenly spaced row indices, always keeping the first and last row."""

    if length <= max_count:
        return np.arange(length)
    return np.unique(np.linspace(0, length - 1, num=max_count, dtype=np.int64))`,
        text:
          "Die Konstanten stehen direkt über ihrem Einsatzort statt am Dateianfang — bewusste Nähe-Entscheidung. `np.linspace(0, length-1, num=max_count, dtype=np.int64)` erzeugt `max_count` gleichmäßig verteilte Indizes von der ersten bis zur letzten Zeile; `dtype=np.int64` rundet die Fließkomma-Positionen auf ganze Indizes ab. Dabei können Duplikate entstehen (zwei Positionen runden auf denselben Index) — `np.unique` entfernt sie UND sortiert. Der Guard `length <= max_count` gibt mit `np.arange` einfach alle Indizes zurück. Ergebnis: Plots zeigen nie mehr als 20 000 Punkte, egal wie groß die Session ist.",
      },
      {
        id: "s6g2",
        start: 264,
        title: "⚡ _nearest_values — Nearest-Neighbor via searchsorted",
        advanced: true,
        code: `def _nearest_values(
    position_df: pd.DataFrame, timestamps: pd.Series
) -> np.ndarray:
    """Look up the Position value nearest to each timestamp via searchsorted."""

    sorted_times = position_df["time"].to_numpy()
    values = position_df["value"].to_numpy()
    query_times = pd.to_datetime(timestamps).to_numpy()

    right_indices = np.searchsorted(sorted_times, query_times, side="left")
    right_indices = np.clip(right_indices, 0, len(sorted_times) - 1)
    left_indices = np.clip(right_indices - 1, 0, len(sorted_times) - 1)

    left_diff = np.abs(sorted_times[left_indices] - query_times)
    right_diff = np.abs(sorted_times[right_indices] - query_times)
    nearest_indices = np.where(left_diff <= right_diff, left_indices, right_indices)
    return values[nearest_indices]`,
        text:
          "Aufgabe: Für jede Zyklusgrenze (Timestamp) den Positionswert finden, der zeitlich am nächsten liegt — damit die Start/Ende-Marker im Plot AUF der Kurve sitzen. Der Ansatz ist komplett vektorisiert: `np.searchsorted` macht für ALLE Query-Zeiten gleichzeitig eine Binärsuche (O(m·log n)) und liefert die Einfüge-Position, also den rechten Nachbarn. `np.clip` begrenzt Indizes auf den gültigen Bereich (fängt Queries vor dem ersten/nach dem letzten Sample ab). Dann werden die Abstände zu linkem und rechtem Nachbarn verglichen und `np.where(bedingung, a, b)` wählt elementweise den näheren. Die letzte Zeile ist Fancy Indexing: `values[nearest_indices]` zieht alle Werte auf einmal. Voraussetzung, die NICHT geprüft wird: `time` muss sortiert sein — searchsorted liefert sonst stillschweigend Unsinn.",
      },
    ],
  },
  {
    id: "s7",
    title: "7 · Anatomie einer Stage-Funktion (Muster)",
    range: "Zeilen 411–431 · Muster für Z. 434–859",
    intro:
      "Sechs Stage-Funktionen (_run_metadata_stage bis _run_cycle_quality_profiling_stage) folgen exakt demselben Vertrag. Hier die kürzeste als Vorlage — wer sie versteht, liest die anderen fünf flüssig.",
    groups: [
      {
        id: "s7g1",
        start: 411,
        title: "Der Stage-Vertrag: dict mit row_counts + output_paths",
        code: `def _run_metadata_stage(
    stage_directory: Path,
    uuid_signal_info: pd.DataFrame,
    int_signal_info: pd.DataFrame,
) -> dict[str, object]:
    """Save signal catalogues derived from the shared metadata snapshot."""

    uuid_catalogue_path = _save_frame(uuid_signal_info, stage_directory / "uuid_signal_catalogue.csv")
    int_catalogue_path = _save_frame(int_signal_info, stage_directory / "int_signal_catalogue.csv")
    return {
        "uuid_signal_info": uuid_signal_info,
        "int_signal_info": int_signal_info,
        "row_counts": {
            "uuid_signals": _row_count(uuid_signal_info),
            "int_signals": _row_count(int_signal_info),
        },
        "output_paths": {
            "uuid_signal_catalogue": str(uuid_catalogue_path),
            "int_signal_catalogue": str(int_catalogue_path),
        },
    }`,
        text:
          "Der ungeschriebene Vertrag, den ALLE Stages erfüllen: Rückgabetyp `dict[str, object]` mit (a) den fachlichen Ergebnissen (DataFrames, die spätere Stages weiterverwenden), (b) `row_counts` als schnelle Diagnose-Zahlen und (c) `output_paths` mit str-Pfaden. Auf (c) verlässt sich der Orchestrator blind: Z. 1037 greift `stage_result[\"output_paths\"]` für das Manifest ab — fehlt der Key, crasht die Pipeline. `dict[str, object]` statt `dict[str, Any]` ist eine bewusste Wahl: `object` zwingt Nutzer zum expliziten Umgang mit dem Typ, `Any` würde alles ungeprüft durchwinken. Die anderen Stages (Z. 434–859) addieren nur Fachlogik auf dieses Skelett — z. B. hat `_run_multi_sensor_extraction_stage` 21 Parameter, weil jede Config-Option explizit durchgereicht wird statt das Config-Objekt zu übergeben: maximale Nachvollziehbarkeit, was eine Stage wirklich braucht.",
      },
    ],
  },
  {
    id: "s8",
    title: "8 · Cycle Detection: die komplexeste Stage",
    range: "Zeilen 537–645",
    intro:
      "Session-weise Verarbeitung für begrenzten Speicher, ein Validierungs-Subset für den Plot, und am Ende ein bedingtes Dict-Unpacking.",
    groups: [
      {
        id: "s8g1",
        start: 537,
        title: "_build_validation_subset — Slicing-Idiome",
        code: `def _build_validation_subset(
    position_df: pd.DataFrame, session_cycles_df: pd.DataFrame
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Restrict one session's data to a small, fast-to-render validation subset.

    Only the first \`\`MAX_VALIDATION_PLOT_CYCLES\`\` cycles of the session are
    kept, and the Position window is limited to the selected cycles' time
    range plus a one-second margin on each side.
    """

    validation_cycles_df = session_cycles_df.iloc[:MAX_VALIDATION_PLOT_CYCLES]
    if validation_cycles_df.empty:
        return position_df.iloc[0:0], validation_cycles_df

    window_start = pd.Timestamp(validation_cycles_df["start_time"].iloc[0]) - pd.Timedelta(
        seconds=1
    )
    window_end = pd.Timestamp(validation_cycles_df["end_time"].iloc[-1]) + pd.Timedelta(
        seconds=1
    )
    in_window = (position_df["time"] >= window_start) & (position_df["time"] <= window_end)
    validation_position_df = position_df.loc[in_window]
    return validation_position_df, validation_cycles_df`,
        text:
          "Rückgabetyp `tuple[pd.DataFrame, pd.DataFrame]` — die Funktion gibt zwei Werte zurück (in Python immer ein Tuple). Drei Slicing-Idiome: `iloc[:100]` schneidet die ersten n Zeilen positionsbasiert; `iloc[0:0]` ist der Trick für einen LEEREN DataFrame, der aber alle Spalten behält (Schema-Stabilität für den Aufrufer); `iloc[-1]` greift das letzte Element. Die Fenstergrenzen: erster Zyklusstart minus 1 s, letztes Zyklusende plus 1 s (`pd.Timedelta`). Z. 557 ist eine Boolean-Maske: Vergleiche auf ganze Spalten liefern True/False-Serien, `&` verknüpft sie elementweise — die Klammern sind PFLICHT, weil `&` stärker bindet als `>=`. `.loc[maske]` filtert dann die Zeilen.",
      },
      {
        id: "s8g2",
        start: 562,
        title: "Die Session-Schleife — itertuples & Akkumulator",
        code: `def _run_cycle_detection_stage(
    dataset_path: Path,
    stage_directory: Path,
    experiment: str,
    reference_signal_uuid: str,
    sessions_df: pd.DataFrame,
    movement_threshold: float,
) -> dict[str, object]:
    """Detect cycles session by session to preserve bounded memory usage."""

    cycle_frames: list[pd.DataFrame] = []
    validation_position_df = pd.DataFrame()
    validation_cycles_df = pd.DataFrame()
    validation_session_total_cycles = 0
    validation_session_total_position_rows = 0
    captured_validation_subset = False

    for session_row in sessions_df.itertuples(index=False):
        position_df = _load_position_window(
            dataset_path=dataset_path,
            signal_id_uuid=reference_signal_uuid,
            start_time=pd.Timestamp(session_row.start_time),
            end_time=pd.Timestamp(session_row.end_time),
        )
        session_cycles_df = detect_candidate_cycles(
            position_df,
            movement_threshold=movement_threshold,
        )
        if session_cycles_df.empty:
            continue

        session_cycles_df = session_cycles_df.copy()
        session_cycles_df.insert(0, "experiment", experiment)
        session_cycles_df.insert(1, "session_id", int(session_row.session_id))
        session_cycles_df.insert(2, "reference_signal_uuid", reference_signal_uuid)
        cycle_frames.append(session_cycles_df)

        if not captured_validation_subset:
            validation_position_df, validation_cycles_df = _build_validation_subset(
                position_df, session_cycles_df
            )
            validation_session_total_cycles = len(session_cycles_df)
            validation_session_total_position_rows = len(position_df)
            captured_validation_subset = True`,
        text:
          "Warum session-weise? Der Docstring sagt es: bounded memory — es ist nie mehr als das Positionssignal EINER Session gleichzeitig im RAM. `itertuples(index=False)` ist die schnelle Art, über DataFrame-Zeilen zu iterieren: Jede Zeile kommt als Namedtuple mit Attributzugriff (`session_row.start_time`) statt als langsame Series wie bei `iterrows()`. `continue` überspringt leere Sessions früh. Das `.copy()` vor `insert` ist wichtig: `detect_candidate_cycles` könnte eine View zurückgeben — ohne copy riskiert man pandas' SettingWithCopyWarning bzw. Mutation fremder Daten. `insert(0, ...)` fügt Spalten an fester POSITION ein (experiment, session_id, uuid ganz links — Lesbarkeit im CSV). Das Akkumulator-Muster: DataFrames in einer Liste sammeln, erst am Ende EIN `pd.concat` — viel schneller als wiederholtes Anhängen. Der `captured_validation_subset`-Flag friert das Subset der ersten Session mit Zyklen ein.",
      },
      {
        id: "s8g3",
        start: 607,
        title: "Zusammenführen + ⚡ bedingtes Dict-Unpacking",
        advanced: true,
        code: `    if cycle_frames:
        cycles_df = pd.concat(cycle_frames, ignore_index=True)
        cycles_df["cycle_id"] = range(1, len(cycles_df) + 1)
    else:
        cycles_df = pd.DataFrame(
            columns=["experiment", "session_id", "reference_signal_uuid", "cycle_id"]
        )

    logger.info(
        "cycle validation subset: %d of %d cycles detected in session, "
        "%d of %d position rows in session",
        len(validation_cycles_df),
        validation_session_total_cycles,
        len(validation_position_df),
        validation_session_total_position_rows,
    )

    cycles_path = _save_frame(cycles_df, stage_directory / "cycles.csv")
    cycles_parquet_path = write_cycle_index(cycles_df, stage_directory / "cycles.parquet")
    validation_plot_path = _plot_cycle_validation(
        validation_position_df,
        validation_cycles_df,
        stage_directory / "cycle_validation.html",
        experiment=experiment,
        movement_threshold=movement_threshold,
    )
    return {
        "cycles": cycles_df,
        "row_counts": {"cycles": _row_count(cycles_df)},
        "output_paths": {
            "cycles_csv": str(cycles_path),
            "cycles_parquet": str(cycles_parquet_path),
            **(
                {"validation_plot": str(validation_plot_path)}
                if validation_plot_path is not None
                else {}
            ),
        },
    }`,
        text:
          "`if cycle_frames:` nutzt Truthiness: Eine leere Liste ist False — kein `len(...) > 0` nötig. `pd.concat(ignore_index=True)` verschmilzt alle Session-Frames und nummeriert den Index neu; danach bekommt jede Zeile eine globale `cycle_id` ab 1 (`range` wird von pandas direkt als Spalte akzeptiert). Der else-Zweig baut einen leeren DataFrame MIT Spaltennamen — nachgelagerte Stages können sich so immer auf das Schema verlassen. Beachte im logger.info die implizite String-Verkettung zweier Literale über Zeilen hinweg (Z. 616–617, kein `+` nötig). Das Highlight ist Z. 639–644: `**({\"validation_plot\": ...} if ... else {})` — ein bedingtes Dict-Unpacking. Der ternäre Ausdruck liefert entweder ein Ein-Eintrag-Dict oder ein leeres Dict, `**` packt es ins umgebende Literal aus. Effekt: Der Key existiert NUR, wenn wirklich ein Plot geschrieben wurde (`_plot_cycle_validation` gibt bei leeren Daten None zurück) — statt eines Keys mit None-Wert im Manifest.",
      },
    ],
  },
  {
    id: "s9",
    title: "9 · run_pipeline: die Orchestrierung",
    range: "Zeilen 862–1068",
    intro:
      "Die einzige öffentliche Funktion der Datei. Ablauf: Config normalisieren → früh validieren → Manifest anlegen → Stages per Dispatch-Tabelle bis stop_after ausführen → Erfolg/Fehler im Manifest festhalten.",
    groups: [
      {
        id: "s9g1",
        start: 862,
        title: "Config-Normalisierung & frühe Validierung",
        code: `def run_pipeline(config: PipelineConfig) -> dict[str, object]:
    """Execute the preprocessing pipeline up to the selected stage."""

    normalized_config = PipelineConfig(
        dataset_path=_as_path(config.dataset_path),
        experiment=config.experiment,
        stop_after=config.stop_after,
        reference_signal=config.reference_signal,
        session_gap_seconds=config.session_gap_seconds,
        movement_threshold=config.movement_threshold,
        output_root=_as_path(config.output_root),
        max_cycles_to_extract=config.max_cycles_to_extract,
        extract_all_cycles=config.extract_all_cycles,
        cycle_batch_size=config.cycle_batch_size,
        resume_extraction=config.resume_extraction,
        overwrite_existing=config.overwrite_existing,
        selected_extraction_signals=tuple(config.selected_extraction_signals),
        validation_cycle_count=config.validation_cycle_count,
        required_validation_signals=tuple(config.required_validation_signals),
        minimum_samples_per_validation_cycle=config.minimum_samples_per_validation_cycle,
        require_consecutive_validation_cycles=config.require_consecutive_validation_cycles,
        max_cycles_to_scan_for_validation=config.max_cycles_to_scan_for_validation,
        generate_validation_html=config.generate_validation_html,
        generate_cycle_features=config.generate_cycle_features,
        parquet_compression=config.parquet_compression,
        quality_profiling_batch_size=config.quality_profiling_batch_size,
    )
    stop_stage = _normalize_stage(normalized_config.stop_after)
    _ensure_stage_is_implemented(stop_stage)`,
        text:
          "Statt das übergebene Config-Objekt zu verändern, baut der Autor eine KOPIE mit normalisierten Werten: Pfade durch `_as_path` (String→Path, `~` aufgelöst), Sequenzen durch `tuple(...)` (falls der Aufrufer Listen übergab). Das Original des Aufrufers bleibt unangetastet — funktionaler Stil, keine Seiteneffekte. Dann die zwei Guards VOR jeglichem Datei-I/O: `_normalize_stage` (Tippfehler in `stop_after` → sofortige, hilfreiche ValueError) und `_ensure_stage_is_implemented` (nicht gebaute Ziel-Stage → NotImplementedError). Fail fast: Ein falscher Parameter hinterlässt kein halb angelegtes Run-Verzeichnis.",
      },
      {
        id: "s9g2",
        start: 892,
        title: "Manifest-Initialisierung — Reproduzierbarkeit",
        code: `    run_paths = _build_run_paths(normalized_config)
    dataset_name = normalized_config.dataset_path.name or str(normalized_config.dataset_path)
    start_time = datetime.now()
    manifest: dict[str, Any] = {
        "dataset_path": str(normalized_config.dataset_path),
        "dataset_name": dataset_name,
        "experiment": normalized_config.experiment,
        "reference_signal": normalized_config.reference_signal,
        "stop_point": stop_stage.value,
        "parameters": {
            "session_gap_seconds": normalized_config.session_gap_seconds,
            "movement_threshold": normalized_config.movement_threshold,
            "output_root": str(normalized_config.output_root),
            "max_cycles_to_extract": normalized_config.max_cycles_to_extract,
            "extract_all_cycles": normalized_config.extract_all_cycles,
            "cycle_batch_size": normalized_config.cycle_batch_size,
            "resume_extraction": normalized_config.resume_extraction,
            "overwrite_existing": normalized_config.overwrite_existing,
            "selected_extraction_signals": list(normalized_config.selected_extraction_signals),
            "validation_cycle_count": normalized_config.validation_cycle_count,
            "required_validation_signals": list(normalized_config.required_validation_signals),
            "minimum_samples_per_validation_cycle": normalized_config.minimum_samples_per_validation_cycle,
            "require_consecutive_validation_cycles": normalized_config.require_consecutive_validation_cycles,
            "max_cycles_to_scan_for_validation": normalized_config.max_cycles_to_scan_for_validation,
            "generate_validation_html": normalized_config.generate_validation_html,
            "generate_cycle_features": normalized_config.generate_cycle_features,
            "parquet_compression": normalized_config.parquet_compression,
            "quality_profiling_batch_size": normalized_config.quality_profiling_batch_size,
        },
        "start_time": start_time.isoformat(),
        "end_time": None,
        "status": "running",
        "completed_stages": [],
        "generated_output_paths": {},
        "error_message": None,
    }
    _write_manifest(run_paths.manifest_path, manifest)`,
        text:
          "Das Manifest ist das wissenschaftliche Laufprotokoll: JEDER Parameter des Runs wird festgehalten — für eine Thesis essenziell, denn Monate später muss nachvollziehbar sein, mit welchem `movement_threshold` ein Ergebnis entstand. Sprachlich interessant: `list(...)` wandelt die Config-Tuples für JSON in Listen (JSON kennt keine Tuples; `_json_ready` würde das zwar auch erledigen, aber hier ist es explizit). `stop_stage.value` statt des Enum-Objekts — der String \"cycle_detection\" landet im JSON. Die Felder `end_time: None`, `status: \"running\"`, `error_message: None` sind Platzhalter, die im finally/except-Block überschrieben werden: Wer das Manifest eines abgestürzten Runs öffnet, sieht sofort den Zustand. Und: Das Manifest wird SOFORT geschrieben, noch bevor eine Stage läuft.",
      },
      {
        id: "s9g3",
        start: 958,
        title: "⚡ Die Dispatch-Tabelle — Lambdas als verzögerte Ausführung",
        advanced: true,
        code: `        stage_runners = {
            PipelineStage.METADATA: lambda: _run_metadata_stage(
                run_paths.stage_directories[PipelineStage.METADATA],
                uuid_signal_info,
                int_signal_info,
            ),
            PipelineStage.SIGNAL_DISCOVERY: lambda: _run_signal_discovery_stage(
                run_paths.stage_directories[PipelineStage.SIGNAL_DISCOVERY],
                uuid_signal_info,
                int_signal_info,
                normalized_config.experiment,
                normalized_config.reference_signal,
            ),
            PipelineStage.TIMESTAMP_ANALYSIS: lambda: _run_timestamp_analysis_stage(
                normalized_config.dataset_path,
                run_paths.stage_directories[PipelineStage.TIMESTAMP_ANALYSIS],
                results["signal_discovery"]["reference_signal_uuid"],
            ),
            PipelineStage.SESSION_DETECTION: lambda: _run_session_detection_stage(
                normalized_config.dataset_path,
                run_paths.stage_directories[PipelineStage.SESSION_DETECTION],
                results["signal_discovery"]["reference_signal_uuid"],
                normalized_config.session_gap_seconds,
            ),
            PipelineStage.CYCLE_DETECTION: lambda: _run_cycle_detection_stage(
                normalized_config.dataset_path,
                run_paths.stage_directories[PipelineStage.CYCLE_DETECTION],
                normalized_config.experiment,
                results["signal_discovery"]["reference_signal_uuid"],
                results["session_detection"]["sessions"],
                normalized_config.movement_threshold,
            ),
            PipelineStage.MULTI_SENSOR_EXTRACTION: lambda: _run_multi_sensor_extraction_stage(
                normalized_config.dataset_path,
                run_paths.stage_directories[PipelineStage.MULTI_SENSOR_EXTRACTION],
                uuid_signal_info,
                int_signal_info,
                normalized_config.experiment,
                results["cycle_detection"]["cycles"],
                _as_path(results["cycle_detection"]["output_paths"]["cycles_parquet"]),
                normalized_config.max_cycles_to_extract,
                normalized_config.extract_all_cycles,
                normalized_config.cycle_batch_size,
                normalized_config.resume_extraction,
                normalized_config.overwrite_existing,
                tuple(normalized_config.selected_extraction_signals),
                normalized_config.validation_cycle_count,
                tuple(normalized_config.required_validation_signals),
                normalized_config.minimum_samples_per_validation_cycle,
                normalized_config.require_consecutive_validation_cycles,
                normalized_config.max_cycles_to_scan_for_validation,
                normalized_config.generate_validation_html,
                normalized_config.generate_cycle_features,
                normalized_config.parquet_compression,
            ),
            PipelineStage.CYCLE_QUALITY_PROFILING: lambda: _run_cycle_quality_profiling_stage(
                run_paths.stage_directories[PipelineStage.CYCLE_QUALITY_PROFILING],
                results["multi_sensor_extraction"]["measurements_root"],
                results["multi_sensor_extraction"]["cycles_extracted"],
                normalized_config.quality_profiling_batch_size,
            ),
        }`,
        text:
          "Das wichtigste Idiom der Datei: eine Dispatch-Tabelle (Dict Enum→Funktion) statt einer if/elif-Kette. Jeder Wert ist ein `lambda:` OHNE Parameter — eine anonyme Funktion, deren Rumpf erst bei AUFRUF (`stage_runners[stage]()`, Z. 1032) ausgeführt wird. Genau darauf baut alles: Beim Erstellen des Dicts ist `results` noch LEER, obwohl z. B. der TIMESTAMP_ANALYSIS-Runner `results[\"signal_discovery\"][...]` liest. Kein KeyError — der Lambda-Rumpf wird ja nicht ausgewertet, nur gespeichert. Wenn der Runner später aufgerufen wird, hat die Signal-Discovery-Stage ihr Ergebnis längst in `results` abgelegt. Die Lambdas sind Closures: Sie greifen auf `results`, `run_paths`, `normalized_config` aus dem umgebenden Scope zu. So werden auch die Datenabhängigkeiten sichtbar: CYCLE_DETECTION braucht Ergebnisse von signal_discovery UND session_detection — der Abhängigkeitsgraph steht wörtlich im Code. Achtung, verwandte Falle: Lambdas in einer SCHLEIFE, die die Schleifenvariable nutzen, teilen sich deren letzten Wert (late binding) — hier unkritisch, weil jedes Lambda von Hand geschrieben ist.",
      },
      {
        id: "s9g4",
        start: 1021,
        title: "Die Hauptschleife — Timing, Manifest-Updates, break",
        code: `        for stage in STAGE_ORDER:
            _ensure_stage_is_implemented(stage)
            stage_started = time.perf_counter()
            logger.info(
                "Running stage=%s dataset=%s experiment=%s stop_after=%s output=%s",
                stage.value,
                dataset_name,
                normalized_config.experiment,
                stop_stage.value,
                run_paths.stage_directories[stage],
            )
            stage_result = stage_runners[stage]()
            stage_duration = time.perf_counter() - stage_started
            stage_result["execution_time_seconds"] = stage_duration
            results[stage.value] = stage_result
            manifest["completed_stages"].append(stage.value)
            manifest["generated_output_paths"][stage.value] = stage_result["output_paths"]
            _write_manifest(run_paths.manifest_path, manifest)
            logger.info(
                "Completed stage=%s status=success duration_seconds=%.3f",
                stage.value,
                stage_duration,
            )
            if stage == stop_stage:
                break`,
        text:
          "Die Schleife läuft über `STAGE_ORDER` — die Tuple-Reihenfolge IST die Ausführungsreihenfolge. `time.perf_counter()` ist die richtige Uhr für Dauer-Messungen (monoton, hohe Auflösung — `datetime.now()` wäre für Differenzen ungenau, z. B. bei Zeitumstellung). `stage_runners[stage]()` — Dict-Lookup plus Aufruf: die zwei Klammern am Ende führen das Lambda aus. Ergebnis wird unter dem STRING-Key abgelegt (`results[stage.value]`), damit spätere Runner es finden. Entscheidend: `_write_manifest` läuft nach JEDER Stage — stürzt Stage 5 ab, dokumentiert das Manifest die Stages 1–4 samt Output-Pfaden. Der Vergleich `stage == stop_stage` funktioniert direkt zwischen Enum-Mitgliedern; `break` beendet die Schleife nach der Ziel-Stage — die simpelste Form von „Pipeline bis Punkt X“.",
      },
      {
        id: "s9g5",
        start: 1047,
        title: "⚡ except/finally — Fehlerprotokoll mit Weiterwurf",
        advanced: true,
        code: `        manifest["status"] = "success"
    except Exception as exc:
        manifest["status"] = "failed"
        manifest["error_message"] = str(exc)
        logger.exception("Pipeline failed for dataset=%s experiment=%s", dataset_name, normalized_config.experiment)
        raise
    finally:
        end_time = datetime.now()
        manifest["end_time"] = end_time.isoformat()
        _write_manifest(run_paths.manifest_path, manifest)

    results["run"] = {
        "dataset_name": dataset_name,
        "experiment": normalized_config.experiment,
        "stop_after": stop_stage.value,
        "run_directory": str(run_paths.run_directory),
        "manifest_path": str(run_paths.manifest_path),
        "completed_stages": list(manifest["completed_stages"]),
        "runtime_seconds": (end_time - start_time).total_seconds(),
        "status": manifest["status"],
    }
    return results`,
        text:
          "Das Muster „protokollieren, aber nicht verschlucken“: Der except-Block setzt Status und Fehlertext ins Manifest, `logger.exception(...)` loggt die Meldung MIT vollem Traceback (nur innerhalb von except sinnvoll), und das nackte `raise` wirft die ORIGINAL-Exception unverändert weiter — der Aufrufer soll den Fehler sehen, aber das Manifest ist trotzdem korrekt. `finally` läuft in JEDEM Fall (Erfolg, Fehler, sogar bei erneutem raise): `end_time` setzen und das Manifest ein letztes Mal schreiben. Subtiles Python-Detail ⚡: `end_time` wird IM finally-Block definiert, aber in Z. 1065 außerhalb benutzt — das geht, weil Python keine Block-Scopes kennt; alles in einer Funktion Zugewiesene ist funktionsweit sichtbar. Und weil finally garantiert lief, existiert die Variable sicher. `results[\"run\"]` fasst den Lauf zusammen; `list(manifest[\"completed_stages\"])` erzeugt eine KOPIE der Liste, damit die Rückgabe nicht am Manifest-Objekt hängt.",
      },
    ],
  },
];

// ===========================================================================
// DATEN: Stufen-Simulator
// ===========================================================================
const SIM_STAGES = [
  { value: "metadata", dir: "metadata", implemented: true },
  { value: "signal_discovery", dir: "signal_discovery", implemented: true },
  { value: "timestamp_analysis", dir: "timestamp_analysis", implemented: true },
  { value: "session_detection", dir: "sessions", implemented: true },
  { value: "cycle_detection", dir: "cycles", implemented: true },
  { value: "multi_sensor_extraction", dir: "multi_sensor", implemented: true },
  { value: "cycle_quality_profiling", dir: "quality_profiling", implemented: true },
  { value: "feature_engineering", dir: "features", implemented: false },
  { value: "dataset_generation", dir: "dataset", implemented: false },
];

// ===========================================================================
// DATEN: Glossar
// ===========================================================================
const GLOSSARY = [
  {
    name: "from __future__ import annotations",
    advanced: false,
    was: "Schaltet die verzögerte Auswertung von Type Hints ein — alle Annotationen werden als Strings gespeichert statt beim Laden ausgeführt.",
    hier: "Zeile 3",
    code: "from __future__ import annotations",
    anatomie:
      "from __future__ import <feature>  # muss der ERSTE Import der Datei sein",
    falle:
      "Gilt nur für Annotationen. `tuple[str, ...]` als echter WERT (wie in STAGE_ORDER, Z. 64) braucht trotzdem Python ≥ 3.9 — die Datei nutzt beides, ist also faktisch 3.9/3.10+.",
  },
  {
    name: "Enum mit str-Mixin (Mehrfachvererbung)",
    advanced: true,
    was: "Eine Enum, deren Mitglieder gleichzeitig echte Strings sind — vergleichbar und serialisierbar wie Strings, aber mit fester Werteliste.",
    hier: "Zeilen 50–61",
    code: 'class PipelineStage(str, Enum):\n    METADATA = "metadata"',
    anatomie:
      "class Name(str, Enum): ...   # Reihenfolge fix: Datentyp VOR Enum\nName(\"metadata\")   # Lookup über den Wert (Z. 151)\nName.METADATA.value  # der reine String (Z. 900)",
    falle:
      "`Enum, str` statt `str, Enum` → TypeError. Und: f\"{PipelineStage.METADATA}\" gibt bei plain str-Enums 'PipelineStage.METADATA' aus, nicht 'metadata' — deshalb schreibt der Autor überall explizit `.value`.",
  },
  {
    name: "frozenset",
    advanced: false,
    was: "Ein unveränderliches Set: O(1)-Membership-Test, aber kein add/remove nach der Erstellung.",
    hier: "Zeilen 75–85",
    code: "IMPLEMENTED_STAGES: frozenset[PipelineStage] = frozenset({...})",
    anatomie: "frozenset(iterable)  # hier: frozenset({a, b, c}) aus einem Set-Literal",
    falle:
      "frozenset ist UNGEORDNET — für die Ausführungsreihenfolge wäre es falsch. Genau deshalb existiert daneben STAGE_ORDER als Tuple: Set beantwortet „ist drin?“, Tuple beantwortet „in welcher Reihenfolge?“.",
  },
  {
    name: "@dataclass(slots=True)",
    advanced: true,
    was: "Decorator, der __init__/__repr__/__eq__ aus annotierten Feldern generiert; slots=True fixiert die Attributmenge (kein __dict__).",
    hier: "Zeilen 99, 132",
    code: "@dataclass(slots=True)\nclass PipelineConfig:\n    dataset_path: Path\n    reference_signal: str = \"position\"",
    anatomie:
      "@dataclass(option=...)\nclass Name:\n    feld_ohne_default: Typ      # müssen zuerst stehen\n    feld_mit_default: Typ = wert",
    falle:
      "Mutable Defaults (`= []`, `= {}`) sind verboten → ValueError beim Klassenaufbau. Der Autor umgeht das mit `()` (Tuple) und `None`. Und: slots ≠ frozen — die Config ist weiterhin veränderbar, nur keine NEUEN Attribute.",
  },
  {
    name: "Moderne Type Hints (X | None, tuple[str, ...], object vs. Any)",
    advanced: false,
    was: "Annotationen für Werkzeuge und Leser: `|` ist Union (3.10+), `tuple[T, ...]` heißt „beliebig viele T“, Any schaltet Prüfung ab, object erzwingt sie.",
    hier: "Zeilen 64, 109, 120, 195, 415",
    code: "session_gap_seconds: float | None = None\nselected_extraction_signals: tuple[str, ...] = ()\ndef _json_ready(value: Any) -> Any: ...\n) -> dict[str, object]:",
    anatomie:
      "X | None      # „X oder None“ (früher Optional[X])\ntuple[T, ...] # variable Länge; tuple[T, U] wäre GENAU zwei Elemente\ndict[K, V]    # eingebaute Generics seit 3.9",
    falle:
      "`tuple[str]` (ohne `...`) bedeutet „genau EIN String“ — die drei Punkte sind bedeutungstragend. Hints werden zur Laufzeit nicht geprüft; sie helfen mypy/IDE und dem Leser.",
  },
  {
    name: "Comprehensions & Generator-Ausdrücke",
    advanced: false,
    was: "Kompakte Syntax, um aus einem Iterable eine neue Liste / ein Dict (oder einen Datenstrom) zu bauen.",
    hier: "Zeilen 153, 181–184, 203, 205, 786",
    code: '", ".join(stage.value for stage in STAGE_ORDER)\nstage_directories = {\n    stage: run_directory / folder_name\n    for stage, folder_name in STAGE_DIRECTORIES.items()\n}\nreturn [_json_ready(item) for item in value]',
    anatomie:
      "[ausdruck for x in iterable]        # Liste\n{key_ausdruck: wert_ausdruck for ...} # Dict\n(ausdruck for ...)                    # Generator — lazy, keine Zwischenliste",
    falle:
      "Beim Generator-Ausdruck als einziges Funktionsargument (Z. 153) dürfen die extra Klammern wegfallen — `join((x for x in ...))` und `join(x for x in ...)` sind identisch. Bei zwei Argumenten nicht mehr.",
  },
  {
    name: "f-Strings mit !r und :04d",
    advanced: false,
    was: "String-Interpolation mit Konvertierungs-Flags (!r = repr) und Format-Spezifikation (:04d = 4-stellig mit führenden Nullen).",
    hier: "Zeilen 155, 164, 737, 955",
    code: 'f"Invalid stop_after stage {stage_name!r}. Valid stages: {valid_stages}."\nf"cycle_{cycle_id:04d}_multi_sensor.html"',
    anatomie: 'f"{wert!konvertierung:format}"  # !r → repr(), :04d → int, 4 Stellen, 0-gefüllt',
    falle:
      "`!r` in Fehlermeldungen ist Absicht: 'cycles ' (mit Leerzeichen) erscheint als 'cycles ' in Quotes — ohne !r wäre der Tippfehler unsichtbar. `:04d` sorgt dafür, dass Dateinamen alphabetisch = numerisch sortieren (cycle_0002 < cycle_0010).",
  },
  {
    name: "pathlib.Path & der /-Operator",
    advanced: false,
    was: "Objektorientierte Pfad-API; `/` ist zum plattformunabhängigen Verketten überladen.",
    hier: "Zeilen 173–179, 186, 190, 212",
    code: 'run_directory = (\n    _as_path(config.output_root)\n    / dataset_name\n    / config.experiment\n    / run_id\n)\nrun_directory.mkdir(parents=True, exist_ok=True)\nmanifest_path.write_text(..., encoding="utf-8")',
    anatomie:
      "Path(a) / b / c        # verketten (b, c dürfen Strings sein)\np.mkdir(parents=True, exist_ok=True)  # mkdir -p\np.name / p.parent / p.expanduser() / p.write_text(...)",
    falle:
      "Mindestens der ERSTE Operand von `/` muss ein Path sein — \"a\" / \"b\" ist ein TypeError. Und `mkdir` ohne exist_ok=True wirft FileExistsError beim zweiten Lauf.",
  },
  {
    name: "Exception Chaining: raise … from exc",
    advanced: false,
    was: "Wirft eine neue Exception und verkettet die ursprüngliche als __cause__ — beide Tracebacks bleiben sichtbar.",
    hier: "Zeilen 150–156",
    code: 'except ValueError as exc:\n    raise ValueError(\n        f"Invalid stop_after stage {stage_name!r}. ..."\n    ) from exc',
    anatomie:
      "try: ...\nexcept FehlerTyp as exc:\n    raise NeuerFehler(\"besser erklärt\") from exc",
    falle:
      "Ohne `from exc` erzeugt Python die verwirrende Meldung „During handling of the above exception, another exception occurred“ — als wäre der zweite Fehler ein Bug im Fehler-Handler. `from None` würde die Ursache komplett verstecken.",
  },
  {
    name: "try / except / finally mit nacktem raise",
    advanced: false,
    was: "Fehler protokollieren, Aufräumarbeit garantieren, aber die Exception unverändert weiterwerfen.",
    hier: "Zeilen 931, 1048–1056",
    code: 'except Exception as exc:\n    manifest["status"] = "failed"\n    manifest["error_message"] = str(exc)\n    logger.exception("Pipeline failed ...")\n    raise\nfinally:\n    manifest["end_time"] = end_time.isoformat()\n    _write_manifest(run_paths.manifest_path, manifest)',
    anatomie:
      "try: ...\nexcept Exception as exc:\n    <protokollieren>\n    raise            # nackt = Original-Exception + Original-Traceback\nfinally:\n    <läuft IMMER, auch nach raise>",
    falle:
      "`raise exc` statt `raise` würde funktionieren, aber den Traceback-Ursprung verschieben. Und niemals im finally `return` schreiben — das würde die Exception stillschweigend verschlucken.",
  },
  {
    name: "Ternärer Ausdruck & or-Fallback",
    advanced: false,
    was: "Einzeilige Bedingung (`a if cond else b`) und Kurzschluss-Fallback (`x or default` — greift bei JEDEM falsy-Wert).",
    hier: "Zeilen 171, 518–522, 691, 765",
    code: 'gap_threshold_seconds = (\n    DEFAULT_SESSION_GAP_SECONDS\n    if session_gap_seconds is None\n    else float(session_gap_seconds)\n)\nminimum_samples = minimum_samples_per_validation_cycle or {}\nselected_signals=selected_extraction_signals or None,',
    anatomie:
      "wert_wenn_wahr if bedingung else wert_wenn_falsch\nx or default   # default, wenn x falsy (None, 0, \"\", (), {}, [])",
    falle:
      "Der Autor demonstriert beide Präzisionsstufen: Bei `session_gap_seconds` prüft er `is None` — denn 0.0 wäre ein gültiger (wenn auch harter) Wert, den `or` fälschlich ersetzen würde. Bei Dict/Tuple ist `or` okay, weil leer und None gleich behandelt werden sollen.",
  },
  {
    name: "Bedingtes Dict-Unpacking mit **",
    advanced: true,
    was: "Ein Dict-Eintrag, der nur existiert, wenn eine Bedingung gilt — via ** auf einen ternären Ausdruck.",
    hier: "Zeilen 639–644",
    code: '"output_paths": {\n    "cycles_csv": str(cycles_path),\n    **(\n        {"validation_plot": str(validation_plot_path)}\n        if validation_plot_path is not None\n        else {}\n    ),\n},',
    anatomie:
      '{**dict_a, **dict_b}                 # Dicts mischen\n{fest: 1, **({opt: 2} if cond else {})}  # optionaler Key',
    falle:
      "Die Alternative `\"validation_plot\": path or \"\"` würde einen Key mit Müll-Wert erzeugen. Wer das Manifest konsumiert, kann mit `\"validation_plot\" in output_paths` sauber prüfen — genau dafür lohnt sich das Muster.",
  },
  {
    name: "Lambda-Dispatch-Tabelle (verzögerte Auswertung)",
    advanced: true,
    was: "Ein Dict, das Schlüssel auf parameterlose Lambdas abbildet; der Funktionsrumpf wird erst beim Aufruf ausgewertet.",
    hier: "Zeilen 958–1019, Aufruf Z. 1032",
    code: 'stage_runners = {\n    PipelineStage.TIMESTAMP_ANALYSIS: lambda: _run_timestamp_analysis_stage(\n        normalized_config.dataset_path,\n        run_paths.stage_directories[PipelineStage.TIMESTAMP_ANALYSIS],\n        results["signal_discovery"]["reference_signal_uuid"],\n    ),\n}\n...\nstage_result = stage_runners[stage]()',
    anatomie:
      "tabelle = {key: lambda: funktion(argumente), ...}\nergebnis = tabelle[key]()   # () führt das Lambda JETZT aus",
    falle:
      "Vergisst man die zweiten Klammern (`stage_runners[stage]` statt `stage_runners[stage]()`), bekommt man das Lambda-Objekt statt des Ergebnisses — kein Fehler, nur stiller Unsinn. Und in Schleifen erzeugte Lambdas teilen sich die Schleifenvariable (late binding) — hier vermieden, weil jedes Lambda explizit hingeschrieben ist.",
  },
  {
    name: "itertuples(index=False)",
    advanced: false,
    was: "Schnelle DataFrame-Zeilen-Iteration: jede Zeile als Namedtuple mit Attributzugriff.",
    hier: "Zeilen 579, 728",
    code: "for session_row in sessions_df.itertuples(index=False):\n    ... pd.Timestamp(session_row.start_time) ...",
    anatomie:
      "for row in df.itertuples(index=False):\n    row.spaltenname   # Attributzugriff statt row['spaltenname']",
    falle:
      "Spaltennamen mit Leerzeichen/Sonderzeichen werden zu _1, _2 umbenannt — Attributzugriff schlägt dann fehl. Der Code sichert sich bei optionalen Spalten mit `hasattr(cycle_row, \"session_id\")` ab (Z. 731).",
  },
  {
    name: "np.searchsorted als Nearest-Neighbor",
    advanced: true,
    was: "Vektorisierte Binärsuche: findet für viele Query-Werte gleichzeitig die Einfüge-Positionen in einem sortierten Array.",
    hier: "Zeilen 273–280",
    code: 'right_indices = np.searchsorted(sorted_times, query_times, side="left")\nright_indices = np.clip(right_indices, 0, len(sorted_times) - 1)\n...\nnearest_indices = np.where(left_diff <= right_diff, left_indices, right_indices)\nreturn values[nearest_indices]',
    anatomie:
      "np.searchsorted(sortiert, queries)  # → Einfüge-Indizes, O(m·log n)\nnp.clip(arr, min, max)              # Werte begrenzen\nnp.where(maske, a, b)               # elementweises if/else\nvalues[index_array]                 # Fancy Indexing",
    falle:
      "searchsorted PRÜFT NICHT, ob das Array sortiert ist — bei unsortierten Daten kommen stillschweigend falsche Indizes heraus. Die Sortierung ist hier eine implizite Invariante der geladenen Zeitreihe.",
  },
  {
    name: "logging mit %-Platzhaltern & logger.exception",
    advanced: false,
    was: "Log-Aufrufe mit %-Platzhaltern und Argumenten statt f-Strings; exception() loggt zusätzlich den Traceback.",
    hier: "Zeilen 47, 297–301, 706–710, 1051",
    code: 'logger.info(\n    "cycle validation plot: plotting %d of %d position samples",\n    len(position_plot_df),\n    len(position_df),\n)\nlogger.exception("Pipeline failed for dataset=%s ...", dataset_name, ...)',
    anatomie:
      'logger.info("text %s %d", wert1, wert2)  # Formatierung erst, WENN geloggt wird\nlogger.exception("...")  # nur im except-Block; hängt Traceback an',
    falle:
      "f-Strings im Logging (`logger.info(f\"...\")`) formatieren IMMER, auch wenn das Level deaktiviert ist — bei teuren Ausdrücken in einer heißen Schleife reale Verschwendung. Deshalb konsequent %-Stil.",
  },
  {
    name: "Namens- & Zahlen-Konventionen (_privat, ALL_CAPS, 10_000)",
    advanced: false,
    was: "Führender Unterstrich = modul-intern (Konvention, kein Zwang); ALL_CAPS = Konstante; Unterstriche in Zahlen = reine Lesehilfe.",
    hier: "Zeilen 125, 132, 141ff., 251–253",
    code: "max_cycles_to_scan_for_validation: int | None = 10_000\nMAX_VALIDATION_POINTS = 20_000\ndef _as_path(value: Path | str) -> Path: ...",
    anatomie:
      "_name    # nicht Teil der öffentlichen API; from x import * überspringt es\nNAME     # per Konvention konstant (Python erzwingt nichts)\n1_000_000  # identisch mit 1000000",
    falle:
      "In dieser Datei ist NUR `run_pipeline` (und die Register/Klassen) öffentlich — alles mit Unterstrich darf sich jederzeit ändern. Wer von außen `_run_cycle_detection_stage` importiert, baut auf Treibsand.",
  },
  {
    name: "Rekursion + isinstance mit Typ-Tupel",
    advanced: false,
    was: "Eine Funktion, die sich für verschachtelte Container selbst aufruft; isinstance akzeptiert mehrere Typen auf einmal.",
    hier: "Zeilen 195–206",
    code: "if isinstance(value, (list, tuple)):\n    return [_json_ready(item) for item in value]",
    anatomie:
      "isinstance(x, (TypA, TypB))  # „ist x TypA ODER TypB?“\ndef f(v):\n    if <container>: return [f(item) for item in v]  # Rekursionsschritt\n    return v                                        # Basisfall",
    falle:
      "Die Checks müssen vom Speziellen zum Allgemeinen geordnet sein, wenn Typen verwandt sind. Und: Bei zyklischen Strukturen (Dict enthält sich selbst) würde die Rekursion endlos laufen — für ein Manifest aus Literalen kein Risiko.",
  },
];

// ===========================================================================
// DATEN: Quiz
// ===========================================================================
const QUIZ = [
  {
    q: "Zeile 50: Warum erbt PipelineStage von str UND Enum?",
    options: [
      {
        label:
          "Damit jedes Mitglied gleichzeitig ein echter String ist — direkt mit \"metadata\" vergleichbar und JSON-tauglich",
        correct: true,
        why:
          "Richtig. stop_after kommt als String aus der Config; PipelineStage(stage_name) (Z. 151) parst ihn, und PipelineStage.METADATA == \"metadata\" ist True. Der Autor schreibt trotzdem meist .value, um explizit den String zu meinen (z. B. Z. 900).",
      },
      {
        label: "Damit die Stages automatisch alphabetisch sortiert werden",
        correct: false,
        why:
          "Falsch. Enums haben keine automatische Sortierung; die Ausführungsreihenfolge kommt ausschließlich aus dem Tuple STAGE_ORDER (Z. 64).",
      },
      {
        label: "Weil Enum ohne zweite Basisklasse keine String-Werte speichern kann",
        correct: false,
        why:
          "Falsch. Ein plain `class X(Enum): A = \"a\"` ist völlig legal — nur wäre X.A dann KEIN String (X.A == \"a\" wäre False). Genau dieser Vergleich soll hier aber funktionieren.",
      },
      {
        label: "Um zu verhindern, dass jemand neue Stages zur Laufzeit hinzufügt",
        correct: false,
        why:
          "Falsch. Enums sind ohnehin nicht zur Laufzeit erweiterbar — dafür braucht es das str-Mixin nicht.",
      },
    ],
  },
  {
    q: "Zeile 75: Warum ist IMPLEMENTED_STAGES ein frozenset und kein Tuple oder List?",
    options: [
      {
        label:
          "Es wird nur für „ist Stage drin?“-Checks gebraucht — O(1)-Lookup, und Unveränderlichkeit schützt das Register",
        correct: true,
        why:
          "Richtig. Der einzige Zugriff ist `stage not in IMPLEMENTED_STAGES` (Z. 162) — ein Hash-Lookup. Reihenfolge ist irrelevant (dafür gibt es STAGE_ORDER), und frozenset macht versehentliches .add/.remove unmöglich.",
      },
      {
        label: "frozenset behält die Einfüge-Reihenfolge und ist deshalb schneller iterierbar",
        correct: false,
        why:
          "Falsch — genau umgekehrt: Sets sind UNGEORDNET. Würde die Reihenfolge gebraucht, wäre frozenset die falsche Wahl.",
      },
      {
        label: "Nur frozensets können Enum-Mitglieder enthalten",
        correct: false,
        why:
          "Falsch. Enum-Mitglieder sind hashbar und passen in jedes Set, Dict oder Tuple — STAGE_DIRECTORIES benutzt sie ja als Dict-Keys.",
      },
      {
        label: "frozenset verbraucht weniger Speicher als ein Tuple gleicher Größe",
        correct: false,
        why:
          "Falsch — die Hashtabelle eines Sets braucht eher MEHR Speicher als ein Tuple. Das Argument ist Lookup-Geschwindigkeit und Unveränderlichkeit, nicht Speicher.",
      },
    ],
  },
  {
    q: "Zeile 99: Was bewirkt slots=True an @dataclass konkret?",
    options: [
      {
        label:
          "Die Attributmenge ist fixiert: kein __dict__, weniger Speicher, und Tippfehler wie config.experimnet = ... werfen AttributeError",
        correct: true,
        why:
          "Richtig. Ohne slots legt `config.experimnet = 5` still ein neues Attribut an — bei 20 Config-Feldern ein realer Bug-Magnet. Mit slots knallt es sofort.",
      },
      {
        label: "Die Instanz wird unveränderlich (immutable)",
        correct: false,
        why:
          "Falsch — das wäre frozen=True. Mit slots kann man bestehende Felder weiterhin ändern, nur keine neuen anlegen. run_pipeline umgeht Mutation trotzdem, indem es eine normalisierte Kopie baut (Z. 865).",
      },
      {
        label: "Felder bekommen automatisch Defaults, damit man weniger tippen muss",
        correct: false,
        why:
          "Falsch. Defaults schreibt der Autor alle explizit hin (Z. 106–129); slots hat damit nichts zu tun.",
      },
      {
        label: "Es aktiviert Typprüfung der Felder zur Laufzeit",
        correct: false,
        why:
          "Falsch. Type Hints werden auch mit slots nie zur Laufzeit geprüft — `PipelineConfig(dataset_path=42, ...)` würde erst später beim Benutzen knallen.",
      },
    ],
  },
  {
    q: "Zeile 975: Beim Aufbau von stage_runners liest der TIMESTAMP_ANALYSIS-Eintrag results[\"signal_discovery\"] — aber results ist zu diesem Zeitpunkt leer (Z. 930). Warum gibt es keinen KeyError?",
    options: [
      {
        label:
          "Der Zugriff steht in einem Lambda-Rumpf und wird erst beim Aufruf stage_runners[stage]() ausgewertet — dann ist das Ergebnis längst da",
        correct: true,
        why:
          "Richtig. `lambda: f(x)` SPEICHERT den Ausdruck, statt ihn auszuführen. Die Hauptschleife (Z. 1021) läuft in STAGE_ORDER-Reihenfolge: signal_discovery füllt results (Z. 1035), bevor der timestamp_analysis-Runner aufgerufen wird. Das ist der eigentliche Zweck der Lambdas hier.",
      },
      {
        label: "Dicts werten ihre Values grundsätzlich lazy aus",
        correct: false,
        why:
          "Falsch. Ein Dict-Literal wertet jeden Value sofort aus — stünde dort direkt `_run_timestamp_analysis_stage(..., results[\"signal_discovery\"][...])` ohne lambda, gäbe es beim Dict-Aufbau sofort den KeyError.",
      },
      {
        label: "results ist mit Default-Werten für alle Stages vorbefüllt",
        correct: false,
        why:
          "Falsch. Z. 930 zeigt `results: dict[str, object] = {}` — komplett leer. Es füllt sich erst Stage für Stage in Z. 1035.",
      },
      {
        label: "Der try-Block fängt den KeyError ab und versucht es später erneut",
        correct: false,
        why:
          "Falsch. Der try-Block würde die Exception zwar fangen, aber als Pipeline-Fehler ins Manifest schreiben und weiterwerfen (Z. 1048–1052) — kein Retry-Mechanismus.",
      },
    ],
  },
  {
    q: "Zeile 156: Was bewirkt das `from exc` in `raise ValueError(...) from exc`?",
    options: [
      {
        label:
          "Die Original-Exception wird als __cause__ verkettet — der Traceback zeigt beide Fehler mit „direct cause“-Hinweis",
        correct: true,
        why:
          "Richtig. Der Nutzer sieht die freundliche Meldung mit der Liste gültiger Stages UND darunter die ursprüngliche ValueError des Enum-Konstruktors — nichts geht verloren.",
      },
      {
        label: "Es unterdrückt die ursprüngliche Exception komplett",
        correct: false,
        why:
          "Falsch — das wäre `from None`. `from exc` macht das Gegenteil: es verkettet explizit.",
      },
      {
        label: "Es wandelt exc automatisch in den neuen Exception-Typ um",
        correct: false,
        why:
          "Falsch. Es findet keine Umwandlung statt; es werden zwei getrennte Exception-Objekte verknüpft.",
      },
      {
        label: "Es sorgt dafür, dass der except-Block noch einmal ausgeführt wird",
        correct: false,
        why:
          "Falsch. Ein raise im except-Block verlässt den try/except sofort nach oben — es gibt keine Wiederholung.",
      },
    ],
  },
  {
    q: "Stage 5 (cycle_detection) wirft mitten im Lauf eine Exception. Was steht danach garantiert im run_manifest.json?",
    options: [
      {
        label:
          "status=\"failed\", error_message, end_time — und completed_stages listet die 4 erfolgreichen Stages samt deren output_paths",
        correct: true,
        why:
          "Richtig. Der except-Block (Z. 1049–1050) setzt status und error_message, das finally (Z. 1053–1056) setzt end_time und schreibt das Manifest final. Die Stages 1–4 stehen drin, weil _write_manifest nach JEDER Stage lief (Z. 1038). Die Exception fliegt danach trotzdem zum Aufrufer weiter (nacktes raise, Z. 1052).",
      },
      {
        label: "Nichts Neues — beim Crash wird das Manifest nicht mehr angefasst",
        correct: false,
        why:
          "Falsch. Genau dafür existiert das finally: Es läuft AUCH auf dem Exception-Pfad und schreibt das Manifest ein letztes Mal.",
      },
      {
        label: "status=\"running\", weil die Erfolgszeile (Z. 1047) nie erreicht wurde",
        correct: false,
        why:
          "Halb richtig gedacht: `manifest[\"status\"] = \"success\"` wird tatsächlich übersprungen — aber der except-Block überschreibt status mit \"failed\", bevor das finally schreibt.",
      },
      {
        label: "Das Manifest wird gelöscht, damit kein halbfertiger Run übrig bleibt",
        correct: false,
        why:
          "Falsch — das Gegenteil ist das Design: Der halbfertige Run bleibt inklusive Fehlerdiagnose erhalten. Für eine Thesis-Pipeline ist der dokumentierte Fehlschlag wertvoll.",
      },
    ],
  },
  {
    q: "Zeile 691: `minimum_samples = minimum_samples_per_validation_cycle or {}` — was ist die allgemeine Stolperfalle dieses Idioms?",
    options: [
      {
        label:
          "`or` ersetzt JEDEN falsy-Wert, nicht nur None — bei Feldern, wo 0 oder \"\" gültig sind, wäre das ein Bug",
        correct: true,
        why:
          "Richtig. Hier ist es sicher: Der einzige falsy-Wert neben None ist das leere Dict, und das durch {} zu ersetzen ändert nichts. Aber bei `session_gap_seconds` prüft derselbe Autor bewusst `is None` (Z. 520) — denn 0.0 wäre ein gültiger Wert, den `or` fälschlich verwerfen würde. Die Datei zeigt beide Stufen des Idioms.",
      },
      {
        label: "`or` wirft einen TypeError, wenn links None steht",
        correct: false,
        why:
          "Falsch. `None or {}` ist völlig legal und ergibt {} — `or` gibt einfach den ersten truthy Operanden zurück (oder den letzten).",
      },
      {
        label: "Das Idiom erzeugt bei jedem Aufruf ein neues Dict und verschwendet Speicher",
        correct: false,
        why:
          "Falsch — ein leeres Dict ist winzig, und es wird nur erzeugt, wenn der linke Operand falsy ist. Performance ist hier kein Argument.",
      },
      {
        label: "`or` funktioniert nur mit Booleans, nicht mit Dicts",
        correct: false,
        why:
          "Falsch. Pythons `or` arbeitet mit beliebigen Objekten über deren Truthiness — genau das macht das Fallback-Idiom erst möglich.",
      },
    ],
  },
];

// ===========================================================================
// DATEN: Selbstcheck
// ===========================================================================
const SELF_CHECK = [
  {
    q: "Warum wird das Manifest nach jeder Stage neu geschrieben (Z. 1038) statt nur einmal am Ende?",
    a:
      "Crash-Sicherheit und Beobachtbarkeit: Stürzt Stage 5 ab, dokumentiert run_manifest.json trotzdem die Stages 1–4 samt Output-Pfaden und Parametern. Das finally (Z. 1053–1056) garantiert zusätzlich, dass end_time und der finale Status („failed“ inkl. error_message aus dem except-Block) IMMER geschrieben werden. Außerdem kann man während eines langen Laufs jederzeit den Fortschritt live in der Datei ablesen. Für eine Thesis heißt das: Kein Lauf — auch kein gescheiterter — ist undokumentiert.",
  },
  {
    q: "Beschreibe den kompletten Weg des Strings \"cycle_detection\" aus config.stop_after bis zum Abbruch der Hauptschleife.",
    a:
      "1) `_normalize_stage(\"cycle_detection\")` (Z. 889) ruft `PipelineStage(\"cycle_detection\")` — der Enum-Konstruktor findet das Mitglied über seinen VALUE; bei Tippfehlern gibt es die verkettete ValueError mit der Liste gültiger Stages. 2) `_ensure_stage_is_implemented(stop_stage)` (Z. 890) prüft per frozenset-Lookup, ob die Ziel-Stage gebaut ist — VOR jedem Datei-I/O. 3) Die Hauptschleife (Z. 1021) läuft in STAGE_ORDER-Reihenfolge und führt jede Stage per `stage_runners[stage]()` aus. 4) Nach jeder Stage vergleicht `if stage == stop_stage` (Z. 1044) zwei Enum-Mitglieder; beim Treffer beendet `break` die Schleife — cycle_detection läuft also noch komplett durch, multi_sensor_extraction nicht mehr.",
  },
  {
    q: "Warum verteilt der Autor die Stage-Information auf Enum + STAGE_ORDER + IMPLEMENTED_STAGES + STAGE_DIRECTORIES, statt alles in eine Struktur zu packen?",
    a:
      "Jede Struktur beantwortet genau EINE Frage mit der dafür richtigen Datenstruktur: Die Enum definiert Identität und den kanonischen String-Namen (str-Mixin für Config-Parsing). STAGE_ORDER (Tuple) definiert die Ausführungsreihenfolge — geordnet, unveränderlich. IMPLEMENTED_STAGES (frozenset) definiert den Implementierungsstand — O(1)-Membership, und die Differenz zur Enum dokumentiert sichtbar, was noch fehlt (feature_engineering, dataset_generation). STAGE_DIRECTORIES (dict) definiert Ordnernamen, die bewusst vom Enum-Wert abweichen dürfen (session_detection → \"sessions\"). Eine neue Stage einführen heißt: an allen vier Stellen ergänzen plus Runner registrieren — jede Änderung ist ein bewusster, sichtbarer Schritt statt versteckter Magie.",
  },
];

// ===========================================================================
// UI-Komponenten
// ===========================================================================

function SectionExplorer() {
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const toggle = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={col(32)}>
      <p style={{ margin: 0, fontSize: 14, color: C.dim }}>
        Klicke auf eine Code-Gruppe, um die Erklärung ein-/auszublenden. Zeilennummern
        entsprechen exakt{" "}
        <span style={{ fontFamily: MONO, color: C.text }}>src/pipeline.py</span>.
        Ausgelassen (weil Muster-Wiederholung oder reine Plotly-Kosmetik): Z. 234–248,
        283–408, 434–534, 648–859 — ihr Bauplan wird in Sektion 7 erklärt.
      </p>
      {SECTIONS.map((section) => (
        <section key={section.id} style={card}>
          <div style={{ borderBottom: `1px solid ${C.line}`, padding: "12px 16px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                columnGap: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.bright }}>
                {section.title}
              </h3>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.dim }}>
                {section.range}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: C.dim }}>
              <T s={section.intro} />
            </p>
          </div>
          <div style={{ ...col(12), padding: 16 }}>
            {section.groups.map((group) => {
              const open = openGroups.has(group.id);
              return (
                <div
                  key={group.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: 6,
                    border: `1px solid ${open ? C.blue : C.line}`,
                  }}
                >
                  <button
                    type="button"
                    className="pot-acc"
                    onClick={() => toggle(group.id)}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      background: C.panelSoft,
                      border: "none",
                      padding: "8px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.bright }}>
                      {group.title}
                      {group.advanced && <span style={advBadge}>⚡ Fortgeschritten</span>}
                    </span>
                    <span
                      style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, color: C.blue }}
                    >
                      {open ? "− Erklärung" : "+ Erklärung"}
                    </span>
                  </button>
                  <CodeBlock start={group.start} code={group.code} />
                  {open && (
                    <div
                      style={{
                        borderTop: `1px solid ${C.line}`,
                        background: "#0d1420",
                        padding: "12px 16px",
                        fontSize: 14,
                        lineHeight: 1.625,
                        color: C.text,
                      }}
                    >
                      <T s={group.text} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function StageSimulator() {
  const [selected, setSelected] = useState("cycle_detection");

  const result = useMemo(() => {
    if (selected === "__typo__") {
      return { kind: "valueerror" };
    }
    const stage = SIM_STAGES.find((s) => s.value === selected);
    if (!stage.implemented) return { kind: "notimplemented", stage };
    const stopIndex = SIM_STAGES.indexOf(stage);
    return { kind: "run", stopIndex };
  }, [selected]);

  return (
    <div style={col(20)}>
      <div style={{ ...card, padding: 16 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.625, color: C.text }}>
          Simuliere den Kontrollfluss von <T s="`run_pipeline` (Z. 862–1068)" />: Wähle einen{" "}
          <T s="`stop_after`" />
          -Wert und sieh, was passiert — welche Stages laufen, wo <T s="`break`" /> greift
          (Z. 1044–1045) und welche Guards vorher zuschlagen (Z. 889–890).
        </p>
        <label style={{ marginTop: 12, display: "block", fontSize: 14, color: C.dim }}>
          config.stop_after ={" "}
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              marginLeft: 8,
              borderRadius: 6,
              border: `1px solid ${C.line}`,
              background: C.bg,
              padding: "4px 8px",
              fontFamily: MONO,
              fontSize: 14,
              color: C.bright,
            }}
          >
            {SIM_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                "{s.value}"{s.implemented ? "" : "  (nicht implementiert)"}
              </option>
            ))}
            <option value="__typo__">"cycles"  (Tippfehler!)</option>
          </select>
        </label>
      </div>

      {result.kind === "valueerror" && (
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${C.red}`,
            background: "#2d1214",
            padding: 16,
          }}
        >
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 14, color: C.red }}>
            ValueError: Invalid stop_after stage 'cycles'. Valid stages: metadata,
            signal_discovery, timestamp_analysis, session_detection, cycle_detection,
            multi_sensor_extraction, cycle_quality_profiling, feature_engineering,
            dataset_generation.
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: C.text }}>
            <T s="`_normalize_stage` (Z. 147–156) fängt die ValueError des Enum-Konstruktors und wirft eine bessere — mit `!r` in Quotes und der vollständigen Liste aus dem Generator-Ausdruck. Dank `raise ... from exc` bleibt die Original-Exception im Traceback sichtbar. Es wurde noch KEIN Verzeichnis angelegt: Der Check läuft in Z. 889, `_build_run_paths` erst in Z. 892." />
          </p>
        </div>
      )}

      {result.kind === "notimplemented" && (
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${C.yellow}`,
            background: "#2d2410",
            padding: 16,
          }}
        >
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 14, color: C.yellow }}>
            NotImplementedError: Pipeline stage '{result.stage.value}' is defined but not
            implemented yet.
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: C.text }}>
            <T s="Die Stage existiert in der Enum und in STAGE_ORDER, fehlt aber im frozenset IMPLEMENTED_STAGES (Z. 75–85). `_ensure_stage_is_implemented(stop_stage)` in Z. 890 schlägt zu, BEVOR irgendein Ordner oder Manifest erzeugt wird — fail fast. Die Datenstruktur dokumentiert damit ehrlich den Projektstand der Thesis." />
          </p>
        </div>
      )}

      {result.kind === "run" && (
        <div style={{ ...card, padding: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: C.dim }}>
            Schleife über <span style={{ fontFamily: MONO, color: C.text }}>STAGE_ORDER</span>{" "}
            (Z. 1021), Manifest-Update nach jeder Stage:
          </p>
          <ol style={{ ...col(6), margin: 0, padding: 0, listStyle: "none" }}>
            {SIM_STAGES.map((s, i) => {
              const runs = i <= result.stopIndex;
              const isStop = i === result.stopIndex;
              return (
                <li
                  key={s.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: MONO,
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 20,
                      textAlign: "center",
                      color: runs ? C.green : C.faint,
                    }}
                  >
                    {runs ? "✓" : "·"}
                  </span>
                  <span
                    style={
                      runs
                        ? { color: C.bright }
                        : { color: C.faint, textDecoration: "line-through" }
                    }
                  >
                    {s.value}
                  </span>
                  {runs && (
                    <span style={{ fontSize: 12, color: C.dim }}>→ …/{s.dir}/</span>
                  )}
                  {isStop && (
                    <span
                      style={{
                        borderRadius: 4,
                        background: "#0d2d6b",
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.codeBlue,
                      }}
                    >
                      stop_stage → break (Z. 1044)
                    </span>
                  )}
                  {!runs && (
                    <span style={{ fontSize: 12, color: C.faint }}>wird nie erreicht</span>
                  )}
                </li>
              );
            })}
          </ol>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: C.text }}>
            <T s="Alle ✓-Stages schreiben ihre Ergebnisse nach `results[stage.value]` und ihre Pfade ins Manifest (Z. 1035–1038). Ordner für ALLE 9 Stages werden übrigens trotzdem angelegt (`_build_run_paths` iteriert über das komplette STAGE_DIRECTORIES-Dict, Z. 181–186) — die übersprungenen bleiben einfach leer." />
          </p>
        </div>
      )}
    </div>
  );
}

function Glossary() {
  const [openCard, setOpenCard] = useState(null);
  return (
    <div style={col(12)}>
      <p style={{ margin: 0, fontSize: 14, color: C.dim }}>
        Jedes Konzept, das in dieser Datei tatsächlich vorkommt — mit der echten Fundstelle.
        Karte anklicken zum Aufklappen.
      </p>
      {GLOSSARY.map((g, i) => {
        const open = openCard === i;
        return (
          <div
            key={g.name}
            style={{
              borderRadius: 8,
              border: `1px solid ${open ? C.purple : C.line}`,
              background: C.panel,
            }}
          >
            <button
              type="button"
              className="pot-card-btn"
              onClick={() => setOpenCard(open ? null : i)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                background: "transparent",
                border: "none",
                padding: "12px 16px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: C.bright }}>
                {g.name}
                {g.advanced && <span style={advBadge}>⚡ Fortgeschritten</span>}
              </span>
              <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, color: C.purple }}>
                {g.hier} {open ? "▲" : "▼"}
              </span>
            </button>
            {open && (
              <div
                style={{
                  ...col(12),
                  borderTop: `1px solid ${C.line}`,
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.625,
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: C.codeBlue }}>Was: </span>
                  <span style={{ color: C.text }}>
                    <T s={g.was} />
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: C.green }}>Hier ({g.hier}): </span>
                  <pre style={{ ...codePre, marginTop: 4 }}>{g.code}</pre>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: C.purple }}>Syntax-Anatomie: </span>
                  <pre style={{ ...codePre, marginTop: 4, color: C.dim }}>{g.anatomie}</pre>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: C.red }}>Stolperfalle: </span>
                  <span style={{ color: C.text }}>
                    <T s={g.falle} />
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Quiz() {
  // answers[i] = Index der gewählten Option (oder undefined)
  const [answers, setAnswers] = useState({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => QUIZ[qi].options[oi].correct
  ).length;

  return (
    <div style={col(24)}>
      <div
        style={{
          ...card,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "12px 16px",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: C.dim }}>
          {QUIZ.length} Fragen zu den kniffligsten Stellen der Datei — jede Antwort wird
          begründet.
        </p>
        <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 14, color: C.bright }}>
          {correctCount}/{answeredCount} richtig
        </span>
      </div>
      {QUIZ.map((item, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} style={{ ...card, padding: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: C.bright }}>
              {qi + 1}. <T s={item.q} />
            </p>
            <div style={col(8)}>
              {item.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const revealed = chosen !== undefined;
                let borderColor = C.line;
                if (revealed && opt.correct) borderColor = C.green;
                else if (isChosen && !opt.correct) borderColor = C.red;
                return (
                  <div key={oi}>
                    <button
                      type="button"
                      disabled={revealed}
                      className={revealed ? undefined : "pot-opt"}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        border: `1px solid ${borderColor}`,
                        background: C.bg,
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 14,
                        color: C.text,
                        cursor: revealed ? "default" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{ marginRight: 8, fontFamily: MONO, color: C.dim }}>
                        {String.fromCharCode(65 + oi)})
                      </span>
                      <T s={opt.label} />
                      {revealed && opt.correct && (
                        <span style={{ marginLeft: 8, fontWeight: 600, color: C.green }}>✓</span>
                      )}
                      {revealed && isChosen && !opt.correct && (
                        <span style={{ marginLeft: 8, fontWeight: 600, color: C.red }}>✗</span>
                      )}
                    </button>
                    {revealed && (isChosen || opt.correct) && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          borderRadius: 6,
                          padding: "8px 12px",
                          fontSize: 13,
                          lineHeight: 1.625,
                          background: opt.correct ? "#0f2417" : "#2d1214",
                          color: opt.correct ? "#7ee2a8" : "#ffa198",
                        }}
                      >
                        <T s={opt.why} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {chosen !== undefined && (
              <button
                type="button"
                className="pot-reset"
                onClick={() =>
                  setAnswers((prev) => {
                    const next = { ...prev };
                    delete next[qi];
                    return next;
                  })
                }
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: C.blue,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Frage zurücksetzen
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SelfCheck() {
  const [open, setOpen] = useState({});
  return (
    <div style={{ ...card, padding: 16 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: C.bright }}>
        Selbstcheck: Kannst du das erklären?
      </h3>
      <p style={{ margin: "0 0 12px", fontSize: 14, color: C.dim }}>
        Erst selbst laut beantworten, dann Antwort aufklappen.
      </p>
      <div style={col(8)}>
        {SELF_CHECK.map((item, i) => (
          <div
            key={i}
            style={{ borderRadius: 6, border: `1px solid ${C.line}`, background: C.bg }}
          >
            <button
              type="button"
              className="pot-self-btn"
              onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                background: "transparent",
                border: "none",
                padding: "8px 12px",
                textAlign: "left",
                fontSize: 14,
                color: C.bright,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span>
                {i + 1}. <T s={item.q} />
              </span>
              <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, color: C.blue }}>
                {open[i] ? "Antwort ▲" : "Antwort ▼"}
              </span>
            </button>
            {open[i] && (
              <p
                style={{
                  margin: 0,
                  borderTop: `1px solid ${C.line}`,
                  padding: "8px 12px",
                  fontSize: 13,
                  lineHeight: 1.625,
                  color: C.text,
                }}
              >
                <T s={item.a} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
const TABS = [
  { id: "code", label: "Code-Explorer" },
  { id: "sim", label: "Stufen-Simulator" },
  { id: "glossar", label: "Glossar" },
  { id: "quiz", label: "Quiz" },
];

// Hover-Effekte gehen nicht als Inline-Style — kleines eingebettetes Stylesheet
// (gleiches Muster wie Gallery.jsx). !important, weil Inline-Styles sonst gewinnen.
const hoverStyles = `
  .pot-acc:hover { background: #22272e !important; }
  .pot-card-btn:hover { background: #1c2128 !important; }
  .pot-self-btn:hover { background: #161b22 !important; }
  .pot-opt:hover { border-color: #58a6ff !important; }
  .pot-tab-off:hover { color: #e6edf3 !important; }
  .pot-reset:hover { text-decoration: underline; }
`;

export default function PipelineOrchestrationTrainer() {
  const [tab, setTab] = useState("code");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "32px 16px",
        color: C.text,
        fontFamily: SANS,
      }}
    >
      <style>{hoverStyles}</style>
      <div style={{ ...col(24), margin: "0 auto", maxWidth: 896 }}>
        {/* Header-Karte */}
        <header style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span
              style={{
                borderRadius: 4,
                background: "#0d2d6b",
                padding: "2px 8px",
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 600,
                color: C.codeBlue,
              }}
            >
              Python 3.10+
            </span>
            <span
              style={{
                borderRadius: 4,
                background: "#2d1b4e",
                padding: "2px 8px",
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 600,
                color: C.purple,
              }}
            >
              MASTERTHESIS_PIPELINE
            </span>
            <span
              style={{
                borderRadius: 4,
                background: C.panelSoft,
                padding: "2px 8px",
                fontFamily: MONO,
                fontSize: 12,
                color: C.dim,
              }}
            >
              1069 Zeilen
            </span>
          </div>
          <h1
            style={{
              margin: "12px 0 0",
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              color: C.bright,
            }}
          >
            src/pipeline.py
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.625, color: C.dim }}>
            Der Orchestrator der Thesis-Preprocessing-Pipeline: definiert die 9 Stages als
            Enum mit drei Registern (Reihenfolge, Implementierungsstatus, Output-Ordner),
            validiert die Konfiguration und führt die Stages bis{" "}
            <code
              style={{
                borderRadius: 4,
                background: "#1c2431",
                padding: "0 4px",
                fontFamily: MONO,
                color: C.codeBlue,
              }}
            >
              stop_after
            </code>{" "}
            aus — mit einem nach jeder Stage aktualisierten JSON-Manifest als crash-sicherem
            Laufprotokoll.
          </p>
        </header>

        {/* Warum dieser Trainer */}
        <div
          style={{
            borderRadius: 8,
            border: "1px solid #238636",
            background: "#0f2417",
            padding: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.green }}>
            Warum dieser Trainer
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.625, color: C.text }}>
            Danach kannst du das Stage-Register-Muster (Enum + Tuple + frozenset + Dict)
            selbst reproduzieren und erklären, warum jede der vier Strukturen die richtige
            ist. Du verstehst die Lambda-Dispatch-Tabelle inklusive verzögerter Auswertung
            von <T s="`results[...]`" /> — die subtilste Stelle der Datei — und das
            try/except/finally-Muster, das ein Manifest auch bei Abstürzen konsistent hält.
            Und du liest Idiome wie <T s="`raise … from exc`" />,{" "}
            <T s="`slots=True`" /> und bedingtes Dict-Unpacking künftig ohne Stocken.
          </p>
        </div>

        {/* Tab-Navigation */}
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={on ? undefined : "pot-tab-off"}
                onClick={() => setTab(t.id)}
                style={{
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: on ? "#1f6feb" : C.panel,
                  border: `1px solid ${on ? "#1f6feb" : C.line}`,
                  color: on ? "#ffffff" : C.dim,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Inhalt */}
        {tab === "code" && <SectionExplorer />}
        {tab === "sim" && <StageSimulator />}
        {tab === "glossar" && <Glossary />}
        {tab === "quiz" && <Quiz />}

        {/* Selbstcheck-Footer (immer sichtbar) */}
        <SelfCheck />

        <footer
          style={{
            paddingBottom: 16,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 12,
            color: C.faint,
          }}
        >
          Lern-Trainer · src/pipeline.py · MasterThesisFat
        </footer>
      </div>
    </div>
  );
}
