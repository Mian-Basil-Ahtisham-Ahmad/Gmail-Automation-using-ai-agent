import React from 'react';
import { ChatProvider } from './context/ChatContext';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div className="App">
      <ChatProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <ChatInterface />
          </main>
        </div>
      </ChatProvider>
    </div>
  );
}

export default App;
