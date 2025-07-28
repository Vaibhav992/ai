"use client"
import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MessagesContext } from '@/context/MessagesContext';
import axios from 'axios';
import { Loader2Icon, Download, ArrowLeft, Home, Code, Smartphone } from 'lucide-react';
import JSZip from 'jszip';
import Link from 'next/link';

function FlutterPage() {
    const { id } = useParams();
    const [flutterFiles, setFlutterFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('code');
    const { messages } = useContext(MessagesContext);
    const convex = useConvex();
    const UpdateFiles = useMutation(api.workspace.UpdateFiles);

    useEffect(() => {
        if (id) {
            GetFlutterFiles();
        }
    }, [id]);

    const GetFlutterFiles = async () => {
        try {
            const result = await convex.query(api.workspace.GetWorkspace, {
                workspaceId: id
            });
            
            if (result?.flutterFiles) {
                setFlutterFiles(result.flutterFiles);
            }
        } catch (error) {
            console.error('Error fetching Flutter files:', error);
        }
    };

    const GenerateFlutterCode = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const workspaceData = await convex.query(api.workspace.GetWorkspace, {
                workspaceId: id
            });
            
            const PROMPT = JSON.stringify(messages);
            
            const result = await axios.post('/api/gen-flutter-code', {
                prompt: PROMPT,
                userAnswers: workspaceData?.userAnswers || {}
            });
            
            console.log('Flutter AI Response:', result.data);
            
            if (result.data?.flutterFiles) {
                setFlutterFiles(result.data.flutterFiles);
                
                // Update the workspace with Flutter files
                await UpdateFiles({
                    workspaceId: id,
                    files: {}, // Keep existing web files
                    flutterFiles: result.data.flutterFiles
                });
            }
        } catch (error) {
            console.error('Error generating Flutter code:', error);
            setError('Failed to generate Flutter code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadFlutterFiles = async () => {
        try {
            const zip = new JSZip();
            
                         Object.entries(flutterFiles).forEach(([filename, file]) => {
                 let fileContent;
                 if (typeof file === 'string') {
                     fileContent = file;
                 } else if (file && typeof file === 'object') {
                     if (file.code) {
                         fileContent = file.code;
                     } else {
                         fileContent = JSON.stringify(file, null, 2);
                     }
                 }
                
                if (fileContent) {
                    const cleanFileName = filename.startsWith('/') ? filename.slice(1) : filename;
                    zip.file(cleanFileName, fileContent);
                }
            });

            zip.file("README.md", "# Flutter App\n\nTo run this app:\n1. Install Flutter SDK\n2. Run `flutter pub get`\n3. Run `flutter run`");

            const blob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flutter-project.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading Flutter files:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                <Home className="h-5 w-5" />
                                <span>Home</span>
                            </Link>
                            <div className="w-px h-6 bg-gray-600"></div>
                            <Link href={`/workspace/${id}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                                <span>Back to Workspace</span>
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-400">Flutter Code Generator</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={GenerateFlutterCode}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Flutter Code'
                            )}
                        </button>
                        
                        {Object.keys(flutterFiles).length > 0 && (
                            <button
                                onClick={downloadFlutterFiles}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Flutter
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {Object.keys(flutterFiles).length > 0 ? (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gray-800 p-1 rounded-lg flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                                        activeTab === 'code' 
                                            ? 'bg-blue-500 text-white shadow-lg' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Code className="h-4 w-4" />
                                    Code
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                                        activeTab === 'preview' 
                                            ? 'bg-blue-500 text-white shadow-lg' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Smartphone className="h-4 w-4" />
                                    Preview
                                </button>
                            </div>
                            
                            <button
                                onClick={() => {
                                    const mainDart = flutterFiles['lib/main.dart']?.code || '';
                                    const dartpadUrl = `https://dartpad.dev/?id=example&null_safety=true&split=60&theme=dark&run=true&code=${encodeURIComponent(mainDart)}`;
                                    window.open(dartpadUrl, '_blank');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Open in DartPad
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'code' ? (
                            <div className="grid gap-6">
                                {Object.entries(flutterFiles).map(([filename, file]) => (
                                    <div key={filename} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-gray-750 border-b border-gray-700">
                                            <div className="font-bold text-blue-400 text-lg">{filename}</div>
                                            <div className="text-sm text-gray-400">
                                                {typeof file === 'string' ? file.length : file.code?.length || 0} characters
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <pre className="text-sm overflow-x-auto text-gray-200 leading-relaxed bg-gray-900 p-4 rounded border">
                                                <code>{typeof file === 'string' ? file : file.code}</code>
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-gray-750 border-b border-gray-700">
                                    <div className="font-bold text-blue-400 text-lg">Flutter App Preview</div>
                                    <div className="text-sm text-gray-400">Mobile Simulator</div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            {/* Phone Frame */}
                                            <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] border-8 border-gray-700 shadow-2xl overflow-hidden">
                                                {/* Status Bar */}
                                                <div className="h-8 bg-gray-800 flex items-center justify-between px-6 text-white text-xs">
                                                    <span>9:41</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-4 h-2 bg-green-400 rounded-sm"></div>
                                                        <div className="w-1 h-2 bg-white rounded-sm"></div>
                                                        <div className="w-1 h-2 bg-white rounded-sm"></div>
                                                        <div className="w-1 h-2 bg-white rounded-sm"></div>
                                                    </div>
                                                </div>
                                                
                                                {/* App Content */}
                                                <div className="h-full bg-white overflow-hidden">
                                                    <iframe
                                                        src={`https://dartpad.dev/embed-flutter.html?id=example&null_safety=true&split=60&theme=dark&run=true&code=${encodeURIComponent(flutterFiles['lib/main.dart']?.code || '')}`}
                                                        className="w-full h-full border-0"
                                                        title="Flutter Preview"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Home Button */}
                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 text-center">
                                        <p className="text-gray-400 text-sm mb-4">
                                            This is a simulated Flutter app preview. For the full interactive experience, click "Open in DartPad".
                                        </p>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => {
                                                    const mainDart = flutterFiles['lib/main.dart']?.code || '';
                                                    const dartpadUrl = `https://dartpad.dev/?id=example&null_safety=true&split=60&theme=dark&run=true&code=${encodeURIComponent(mainDart)}`;
                                                    window.open(dartpadUrl, '_blank');
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                                            >
                                                Open Full Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-8xl mb-6">📱</div>
                        <h2 className="text-3xl font-bold text-gray-300 mb-4">No Flutter Code Generated Yet</h2>
                        <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
                            Generate Flutter code for your mobile app based on your requirements and user answers.
                        </p>
                        <button
                            onClick={GenerateFlutterCode}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-3 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2Icon className="h-5 w-5 animate-spin" />
                                    Generating Flutter Code...
                                </>
                            ) : (
                                'Generate Flutter Code'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <Loader2Icon className="animate-spin h-8 w-8 text-blue-400"/>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Generating Flutter Code...</h2>
                                <p className="text-gray-400 text-sm">This may take a few moments</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlutterPage; 