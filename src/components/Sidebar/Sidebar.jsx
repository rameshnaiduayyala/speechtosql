import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import { Tooltip } from "react-tooltip";

const Sidebar = () => {
  const [extended, setExtended] = React.useState(false);

  const {
    onSent,
    prevPrompts,
    setRecentPrompt,
    newChat,
  } = React.useContext(Context);

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
  };

  const sidebarWidth = extended ? "260px" : "70px";

  return (
    <div className="sidebar" style={{ width: sidebarWidth }}>
      {/* TOP */}
      <div className="top">
        {/* MENU */}
        <img
          className="menu"
          src={assets.menu_icon}
          alt="Menu"
          onClick={() => setExtended(!extended)}
          data-tooltip-id="menu"
          data-tooltip-content={extended ? "Collapse" : "Expand"}
        />
        <Tooltip id="menu" place="right" />

        {/* NEW CHAT */}
        <div
          className="new-chat"
          onClick={newChat}
          data-tooltip-id="new-chat"
          data-tooltip-content="New Chat"
        >
          <img src={assets.plus_icon} alt="" />
          {extended && <p>New Chat</p>}
        </div>
        <Tooltip id="new-chat" place="right" />

        {/* RECENT */}
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>

            {prevPrompts?.map((item, index) => (
              <div
                key={index}
                className="recent-entry"
                onClick={() => loadPrompt(item)}
              >
                <img src={assets.message_icon} alt="" />
                <p>
                  {item?.length > 22 ? item.slice(0, 22) + "…" : item}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM */}
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended && <p>Help</p>}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="" />
          {extended && <p>Activity</p>}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="" />
          {extended && <p>Settings</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
