'use client'
import React, { useState } from 'react';
const AutomatedMailSender: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyDomain, setCompanyDomain] = useState('');
    const [status, setStatus] = useState('');

    const generatePrompt = (prompt: string, firstName: string, lastName: string, companyDomain: string) => {
        return `Send an email to ${firstName}.${lastName}@${companyDomain} with the following prompt: "${prompt}"`;
    };

    const sendMail = async () => {
        try {
            setStatus('Generating prompt...');
            const generatedPrompt = generatePrompt(prompt, firstName, lastName, companyDomain);
            setStatus(`Generated Prompt: ${generatedPrompt}`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus('Mail sent successfully!');
        } catch (error) {
            setStatus('Failed to send mail.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <header className="w-full p-6 flex justify-between items-center border-b border-neutral-800">
                <div className="text-xl font-bold">✉️ EmailAI</div>
                <nav className="space-x-8">
                    <a href="#home" className="text-gray-400 hover:text-white">Home</a>
                    <a href="#features" className="text-gray-400 hover:text-white">Features</a>
                    <a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a>
                    <a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a>
                </nav>
                <button className="bg-white text-black px-4 py-1 rounded-md hover:bg-gray-300">Sign In</button>
            </header>

            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-3xl p-12 bg-neutral-900 shadow-2xl rounded-2xl">
                    <h1 className="text-5xl font-semibold mb-6">Automate Your Emails, Amplify Your Reach</h1>
                    <p className="text-gray-400 mb-8">Harness the power of AI to create personalized email campaigns that convert. Save time, increase engagement, and grow your business.</p>
                    <div className="space-y-4 mb-8">
                        <label className="block text-white">Mail Prompt</label>
                        <input 
                            type="text" 
                            placeholder="Enter your prompt..." 
                            className="w-full p-3 rounded-md text-black"
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div>
                            <label className="block text-white">First Name</label>
                            <input 
                                type="text"
                                placeholder="John" 
                                className="w-full p-3 rounded-md text-black"
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white">Last Name</label>
                            <input 
                                type="text"
                                placeholder="Doe" 
                                className="w-full p-3 rounded-md text-black"
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white">Company Domain</label>
                            <input 
                                type="text"
                                placeholder="example.com" 
                                className="w-full p-3 rounded-md text-black"
                                value={companyDomain} 
                                onChange={(e) => setCompanyDomain(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={sendMail} 
                        className="w-full bg-white text-black py-3 rounded-xl hover:bg-gray-200">
                        Send Mail
                    </button>
                    {status && <p className="mt-4 text-center text-gray-400">{status}</p>}
                </div>
            </main>
        </div>
    );
};

export default AutomatedMailSender;
