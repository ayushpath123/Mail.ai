import React, { useState } from 'react';
import { Send, Mail, Settings, Loader2 } from 'lucide-react';

function Labui() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setPrompt('');
      setSubject('');
      setRecipients('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Mail className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">mail.ai</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Write your prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter your email prompt here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <input
                  type="text"
                  id="recipients"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Email subject"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors
                  ${isProcessing || !prompt.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {isProcessing && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <p className="text-gray-600">Generating and sending emails...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Labui;