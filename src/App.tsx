import React from 'react';
import { FlowSystem } from './components/LexPath/FlowSystem';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <FlowSystem />
      </div>
    </ErrorBoundary>
  );
}

export default App;
