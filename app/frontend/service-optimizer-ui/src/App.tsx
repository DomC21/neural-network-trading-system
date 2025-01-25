import { ChatBox } from './components/chat/ChatBox';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ChatBox />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-8">Service Optimization Dashboard</h1>
        {/* Your existing dashboard content will go here */}
      </main>
    </div>
  )
}

export default App
