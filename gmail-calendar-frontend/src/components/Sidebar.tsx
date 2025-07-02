import React, { useState } from 'react';
import { FiMenu, FiPlus, FiMail, FiCalendar, FiSettings } from 'react-icons/fi';
import { BiBot } from 'react-icons/bi';
import { useChat } from '../context/ChatContext';
import { apiService } from '../services/api';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { clearMessages } = useChat();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
    clearMessages();
    apiService.resetSession();
    console.log('✅ Started new chat session');
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            {(FiMenu as any)({ size: 20 })}
          </button>
          <button className="new-chat-button" onClick={handleNewChat}>
            {(FiPlus as any)({ size: 18 })}
            {isOpen && <span>New Chat</span>}
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Agents</h3>
            <div className="agent-list">
              <div className="agent-item">
                {(FiMail as any)({ size: 18 })}
                {isOpen && <span>Gmail Agent</span>}
              </div>
              <div className="agent-item">
                {(FiCalendar as any)({ size: 18 })}
                {isOpen && <span>Calendar Agent</span>}
              </div>
              <div className="agent-item">
                {(BiBot as any)({ size: 18 })}
                {isOpen && <span>Supervisor</span>}
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="sidebar-section">
              <h3>Examples</h3>
              <div className="example-list">
                <div className="example-item">Show my emails</div>
                <div className="example-item">Schedule a meeting</div>
                <div className="example-item">Check calendar conflicts</div>
                <div className="example-item">Reply to latest email</div>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="settings-button">
            {(FiSettings as any)({ size: 18 })}
            {isOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
    </>
  );
};

export default Sidebar; 