import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Bell } from "lucide-react";
import Chat from "@/components/Chat";


const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'chat' | 'admin'>('chat');
  const [user, setUser] = useState<{ id: string; name: string; isAdmin: boolean } | null>({
    id: Math.random().toString(36).substr(2, 9),
    name: "Guest",
    isAdmin: false
  });

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SafeChat Nexus</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  {user.isAdmin && (
                    <Button
                      variant={currentView === 'admin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('admin')}
                      className="flex items-center space-x-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  )}
                  {!user.isAdmin && (
                    <Button
                      variant={currentView === 'chat' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('chat')}
                      className="flex items-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && <Chat user={user} />}
      </main>
    </div>
  );
};

export default Index;
