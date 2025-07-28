import React from 'react';
import { Sparkles, Brain } from 'lucide-react';
import Link from 'next/link';

function Header() {
    return (
        <header className="border-b border-gray-800/50 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-2.5 rounded-xl shadow-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                Vaibhav AI
                            </h1>
                            <div className="w-px h-6 bg-gray-600"></div>
                            <span className="text-gray-300 text-sm font-medium">
                                Website Builder
                            </span>
                        </div>
                    </Link>

                    {/* Status Badge */}
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-4 py-2.5 rounded-full text-sm font-medium border border-purple-500/30 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />
                            <span>AI Powered</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;