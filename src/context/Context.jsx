import React, { createContext, useState } from "react";
import run from "../config/api";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  const onSent = async (prompt) => {
    const query = prompt ?? input;
    if (!query?.trim()) return;

    setLoading(true);
    setShowResult(true);
    setRecentPrompt(query);

    setPrevPrompts((prev) =>
      prev.includes(query) ? prev : [query, ...prev]
    );

    setResultData(null);

    try {
      const response = await run(query);
      setResultData(response);
    } catch {
      setResultData({ error: "Failed to fetch data" });
    }

    setLoading(false);
    setInput("");
  };

  const newChat = () => {
    setShowResult(false);
    setRecentPrompt("");
    setResultData(null);
    setInput("");
  };

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        recentPrompt,
        prevPrompts,
        showResult,
        loading,
        resultData,
        onSent,
        newChat,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
