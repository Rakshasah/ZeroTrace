import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import ChatLayout from './components/ChatLayout';
import { socket } from './socket';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      socket.connect();
      socket.emit('join', currentUser.id);
    } else {
      socket.disconnect();
    }
  }, [currentUser]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  return (
    <>
      {currentUser ? <ChatLayout currentUser={currentUser} /> : <LoginPage onLogin={handleLogin} />}
    </>
  );
}

export default App;
