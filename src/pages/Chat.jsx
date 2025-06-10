import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { IoMdNotifications } from "react-icons/io";
import { IoPersonAdd } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoTrash } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import Navbar from '../component/Navar';
import axiosPrivate from '../utils/axisoPrivate';

const Chat = () => {
  const { userData } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showEditMembersModal, setShowEditMembersModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState('General');
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'General',
      members: [userData?.name || 'Guest (You)']
    }
  ]);
  const [messagesByGroup, setMessagesByGroup] = useState({
    General: []
  });
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await axiosPrivate.get('/api/user/online-users');
        if (response.data.success) {
          setMembers(response.data.users.map(user => user.name));
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messagesByGroup[activeGroup]?.length + 1 || 1,
      text: newMessage,
      sender: userData?.name || 'Guest (You)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessagesByGroup(prev => ({
      ...prev,
      [activeGroup]: [...(prev[activeGroup] || []), userMessage]
    }));
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
    setMessagesByGroup(prev => ({
      ...prev,
      [newGroupName]: []
    }));
    setNewGroupName('');
    setSelectedUsers([]);
    setShowModal(false);
    setActiveGroup(newGroupName);
  };

  const handleRenameGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !groupToRename) return;

    const oldGroupName = groupToRename.name;
    setGroups(prev => prev.map(g => 
      g.id === groupToRename.id 
        ? { ...g, name: newGroupName }
        : g
    ));
    setMessagesByGroup(prev => {
      const messages = { ...prev };
      messages[newGroupName] = messages[oldGroupName];
      delete messages[oldGroupName];
      return messages;
    });
    if (activeGroup === oldGroupName) {
      setActiveGroup(newGroupName);
    }
    setShowRenameModal(false);
    setGroupToRename(null);
    setNewGroupName('');
  };

  const handleDeleteGroup = (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setMessagesByGroup(prev => {
        const { [groupName]: deleted, ...rest } = prev;
        return rest;
      });
      
      if (activeGroup === groupName) {
        if (groups.length === 1) {
          const newGeneralGroup = {
            id: 1,
            name: 'General',
            members: [userData?.name || 'Guest (You)']
          };
          setGroups([newGeneralGroup]);
          setMessagesByGroup({ General: [] });
          setActiveGroup('General');
        } else {
          const firstGroup = groups.find(g => g.id !== groupId);
          setActiveGroup(firstGroup?.name || 'General');
        }
      }
    }
  };

  const handleEditMembers = (e) => {
    e.preventDefault();
    if (!groupToEdit) return;

    setGroups(prev => prev.map(g => 
      g.id === groupToEdit.id 
        ? { ...g, members: [...selectedMembers, userData?.name || 'Guest (You)'] }
        : g
    ));
    setShowEditMembersModal(false);
    setGroupToEdit(null);
    setSelectedMembers([]);
  };

  const toggleMemberSelection = (member) => {
    if (member.includes('You')) return;
    
    setSelectedMembers(prev => 
      prev.includes(member)
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
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
    <>
    <div className='border-b'>
      <Navbar />
    </div>
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">Groups</h2>
            <span className="bg-gray-200 px-2 rounded-full text-sm">{groups.length}</span>
          </div>          
          <button 
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
              } relative`}
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1"
                  onClick={() => setActiveGroup(group.name)}
                >
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-gray-500">
                    Members: {group.members.join(', ')}
                  </div>
                </div>
                <div className="flex space-x-1">                  <div className="relative group">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <FaRegEdit size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGroupToRename(group);
                          setNewGroupName(group.name);
                          setShowRenameModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Rename Group
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGroupToEdit(group);
                          setSelectedMembers(group.members.filter(m => !m.includes('You')));
                          setShowEditMembersModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Members
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id, group.name);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <IoTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <span>{activeGroup}</span>
          </h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
            </button>
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
              <IoMdNotifications size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesByGroup[activeGroup]?.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === (userData?.name || 'Guest (You)') ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === (userData?.name || 'Guest (You)')
                    ? 'bg-sky-400 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender}
                </div>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === (userData?.name || 'Guest (You)') ? 'text-sky-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

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
        </div>   
      </div>

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

              <div className="mb-4 text-sm text-gray-600">
                Selected members: {selectedUsers.length}
              </div>

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

      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Rename Group</h3>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setGroupToRename(null);
                  setNewGroupName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleRenameGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!newGroupName.trim() || newGroupName === groupToRename?.name}
                className="w-full bg-sky-400 text-white py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rename Group
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Group Members</h3>
              <button
                onClick={() => {
                  setShowEditMembersModal(false);
                  setGroupToEdit(null);
                  setSelectedMembers([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleEditMembers}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Members
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      onClick={() => toggleMemberSelection(member)}
                      className={`p-2 cursor-pointer rounded-lg mb-1 flex items-center space-x-2
                        ${selectedMembers.includes(member) ? 'bg-sky-100' : 'hover:bg-gray-100'}
                        ${member.includes('You') ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member)}
                        onChange={() => {}}
                        disabled={member.includes('You')}
                        className="h-4 w-4 text-sky-400 rounded"
                      />
                      <span>{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                Selected members: {selectedMembers.length}
              </div>

              <button
                type="submit"
                disabled={selectedMembers.length === 0}
                className="w-full bg-sky-400 text-white py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Members
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Chat;
