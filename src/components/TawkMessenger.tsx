import React from 'react';

const TawkMessenger: React.FC = () => {
  return (
    <iframe
      src="https://tawk.to/chat/652ad137eb150b3fb9a15f82/1hcnk2i67"
      style={{
        width: '100%',
        height: 'calc(100vh - 64px)',
        border: '0',
        margin: '0',
        padding: '0',
      }}
      frameBorder="0"
      scrolling="no"
      title="Live Chat"
      allow="microphone; camera"
    />
  );
};

export default TawkMessenger;
