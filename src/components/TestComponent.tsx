import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendering...');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Component</h1>
        <p className="text-muted-foreground">
          Si puedes ver esto, el problema no está en React básico.
        </p>
        <p className="text-sm mt-2">
          Timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
};

export default TestComponent;