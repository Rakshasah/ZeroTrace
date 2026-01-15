import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

interface ChatLayoutProps {
    currentUser: any;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ currentUser }) => {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
        <div className="h-screen w-screen flex bg-[#030712] overflow-hidden antialiased">
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />

            <Sidebar
                onSelectUser={(user: any) => setSelectedUser(user)}
                selectedUser={selectedUser}
                currentUser={currentUser}
            />
            <ChatWindow
                selectedUser={selectedUser}
                currentUser={currentUser}
            />
        </div>
    );
};

export default ChatLayout;
