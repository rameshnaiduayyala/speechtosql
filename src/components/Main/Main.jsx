import React, { useContext, useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  Mic,
  MicOff,
  FileDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./Main.css";
import { Context } from "../../context/Context";
import { assets } from "../../assets/assets";
import { labelMap } from "../../config/labelMap";
import { exportToCSV } from "../../config/exportCsv";

/* ---------------- HELPERS ---------------- */

const formatValue = (value) => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "string" && value.includes("T")) {
    return new Date(value).toLocaleDateString();
  }

  // ARRAY
  if (Array.isArray(value)) {
    // array of primitives
    if (typeof value[0] !== "object") {
      return value.join(", ");
    }

    // array of objects → compact string
    return value
      .map((obj) =>
        Object.entries(obj)
          .map(([k, v]) => `${labelMap[k] ?? k}: ${formatValue(v)}`)
          .join(" | ")
      )
      .join(" || ");
  }

  // OBJECT → compact string
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${labelMap[k] ?? k}: ${formatValue(v)}`)
      .join(", ");
  }

  return value;
};

/* -------- Language Auto Detect -------- */
const detectLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN"; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil
  return "en-US";
};

const Main = () => {
  const {
    input,
    setInput,
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
  } = useContext(Context);

  const rows = resultData?.data || [];
  const resultMessage = resultData?.answer || "";
  const totalCount = rows.length;
  const [viewMode, setViewMode] = useState("table");

  /* -------- TEXT → SPEECH -------- */

  let synth = window.speechSynthesis;
  let utterance = null;

  const speakText = (text, lang = "en-US") => {
    if (!synth) return;

    synth.cancel(); // stop previous speech

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    synth.speak(utterance);
  };

  const stopSpeech = () => {
    synth?.cancel();
  };

  /* -------- BUILD SPEECH FROM DATA -------- */
  const buildSpeechText = () => {
    if (!rows.length) return "No data found";

    let text = `Total records found ${rows.length}. `;

    rows.slice(0, 5).forEach((row, index) => {
      const rowText = Object.entries(row)
        .map(([k, v]) => `${labelMap[k] ?? k} ${formatValue(v)}`)
        .join(", ");

      text += `Row ${index + 1}: ${rowText}. `;
    });

    if (rows.length > 5) {
      text += `And ${rows.length - 5} more records.`;
    }

    return text;
  };

  /* ---------------- VOICE STATE ---------------- */
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState("");

  /* -------- Init Speech Recognition ONCE -------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setStatusText("🎙 Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setStatusText("✅ Processing...");
      onSent(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setStatusText("❌ Voice error");
    };

    recognition.onend = () => {
      setListening(false);
      setStatusText("");
    };

    recognitionRef.current = recognition;
  }, []);

  /* -------- START RECORDING -------- */
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported");
      return;
    }

    recognitionRef.current.lang = detectLanguage(input || "en");
    recognitionRef.current.start();
  };

  /* -------- STOP RECORDING -------- */
  const stopRecording = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setStatusText("⏹ Recording stopped");
  };

  return (
    <div className="main">
      <div className="main-container">
        {!showResult ? (
          <div className="greet">
            <p>
              <span>Hello, Ramesh</span>
            </p>
            <p>How can I help you today?</p>
          </div>
        ) : (
          <div className="result">
            <div className="result-title">
              <CircleUserRound size={32} strokeWidth={1.5} color="#5f6368" />
              <p>{recentPrompt}</p>
            </div>

            <div className="result-data">
              <img src={assets.gemini_icon} alt="" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : rows.length > 0 ? (
                <div className="result-output">
                  {/* STATUS TEXT */}
                  {statusText && <p className="voice-status">{statusText}</p>}

                  <div className="result-actions">
                    <div className="result-actions">
                      <button
                        className={`icon-btn ${
                          viewMode === "table" ? "active" : ""
                        }`}
                        onClick={() => setViewMode("table")}
                      >
                        📋
                      </button>

                      <button
                        className={`icon-btn ${
                          viewMode === "cards" ? "active" : ""
                        }`}
                        onClick={() => setViewMode("cards")}
                      >
                        🗂️
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() =>
                          speakText(
                            buildSpeechText(),
                            detectLanguage(recentPrompt)
                          )
                        }
                      >
                        <Volume2 size={20} />
                      </button>

                      <button className="icon-btn" onClick={stopSpeech}>
                        <VolumeX size={20} />
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() => exportToCSV(rows, "query-result.csv")}
                      >
                        <FileDown size={20} />
                      </button>
                    </div>
                  </div>

                  {/* DATA VIEW */}
                  {viewMode === "table" ? (
                    <div className="table-wrapper">
                      <table className="result-table">
                        <thead>
                          <tr>
                            {Object.keys(rows[0])
                              .filter((k) => labelMap[k] !== null)
                              .map((k) => (
                                <th key={k}>
                                  {labelMap[k] ??
                                    k.replace(/_/g, " ").toUpperCase()}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr key={i}>
                              {Object.entries(row)
                                .filter(([k]) => labelMap[k] !== null)
                                .map(([_, v], j) => (
                                  <td key={j}>{formatValue(v)}</td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="card-grid">
                      {rows.map((row, i) => (
                        <div key={i} className="data-card">
                          {Object.entries(row)
                            .filter(([k]) => labelMap[k] !== null)
                            .map(([k, v]) => (
                              <div key={k} className="card-row">
                                <span className="card-label">
                                  {labelMap[k] ?? k.replace(/_/g, " ")}
                                </span>
                                <span className="card-value">
                                  {formatValue(v)}
                                </span>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // ✅ NO ROWS → SHOW MESSAGE
                <div className="no-result">
                  <span>{resultMessage || "No data found"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INPUT */}
        <div className="main-bottom">
          <div className="search-box">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSent()}
              placeholder="Ask your database..."
            />

            {!listening ? (
              <Mic className="mic" onClick={handleVoiceInput} />
            ) : (
              <MicOff className="mic listening" onClick={stopRecording} />
            )}

            <img
              src={assets.send_icon}
              alt="Send"
              onClick={onSent}
              className={input ? "send show" : "send"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
