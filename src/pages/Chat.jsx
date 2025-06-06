import React, { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { IoMdNotifications } from "react-icons/io";
import { IoPersonAdd } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

const Chat = () => {  const { userData } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState('General');
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'General',
      members: ['Alice', 'Bob', 'Charlie', 'Guest']
    }
  ]);
  const [messages, setMessages] = useState([
    { id: 1, text: 'What a beautiful day!', sender: 'Bob', timestamp: '18:20' },
    { id: 2, text: 'Anyone want to discuss the weather?', sender: 'Bob', timestamp: '18:22' },
    { id: 3, text: "How's everyone doing?", sender: 'Bob', timestamp: '18:27' }
  ]);
  const [members] = useState(['Alice', 'Bob', 'Charlie', 'Guest (You)']);
  const [newMessage, setNewMessage] = useState('');
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: userData?.name || 'Guest (You)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedUsers.length === 0) return;

    const newGroup = {
      id: groups.length + 1,
      name: newGroupName,
      members: [...selectedUsers, userData?.name || 'Guest (You)']
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setSelectedUsers([]);
    setShowModal(false);
    setActiveGroup(newGroupName);
  };

  const toggleUserSelection = (member) => {
    if (member.includes('You')) return;
    
    setSelectedUsers(prev => 
      prev.includes(member)
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Groups */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">Groups</h2>
            <span className="bg-gray-200 px-2 rounded-full text-sm">{groups.length}</span>
          </div>          <button 
            onClick={() => setShowModal(true)}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
          >
            <span className="text-xl">+</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {groups.map(group => (
            <div
              key={group.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                activeGroup === group.name ? 'bg-blue-50' : ''
              }`}
              onClick={() => setActiveGroup(group.name)}
            >
              <div className="font-medium">{group.name}</div>
              <div className="text-sm text-gray-500">
                Members: {group.members.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <span>{activeGroup}</span>
          </h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
              {/* <IoPersonAdd size={20} /> */}
            </button>
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
              <IoMdNotifications size={20} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'Guest (You)' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'Guest (You)'
                    ? 'bg-sky-400 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender}
                </div>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'Guest (You)' ? 'text-sky-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              className="bg-sky-400 text-white px-6 py-2 rounded-full hover:bg-sky-500 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar - Members */}
      <div className="w-64 bg-white border-l flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">Members</h2>
            <span className="bg-gray-200 px-2 rounded-full text-sm">{members.length}</span>
          </div>
          <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
            <IoPersonAdd size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {members.map((member, index) => (
            <div key={index} className="p-4 flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className={member.includes('You') ? 'text-blue-500' : ''}>
                {member}
              </span>
            </div>
          ))}
        </div>      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Group</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewGroupName('');
                  setSelectedUsers([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              {/* Group Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              {/* Member Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Members
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      onClick={() => toggleUserSelection(member)}
                      className={`p-2 cursor-pointer rounded-lg mb-1 flex items-center space-x-2
                        ${selectedUsers.includes(member) ? 'bg-sky-100' : 'hover:bg-gray-100'}
                        ${member.includes('You') ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(member)}
                        onChange={() => {}}
                        disabled={member.includes('You')}
                        className="h-4 w-4 text-sky-400 rounded"
                      />
                      <span>{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Members Count */}
              <div className="mb-4 text-sm text-gray-600">
                Selected members: {selectedUsers.length}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!newGroupName.trim() || selectedUsers.length === 0}
                className="w-full bg-sky-400 text-white py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
