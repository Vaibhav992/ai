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

function ReactNativePage() {
    const { id } = useParams();
    const [rnFiles, setRnFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('code');
    const { messages } = useContext(MessagesContext);
    const convex = useConvex();
    const UpdateFiles = useMutation(api.workspace.UpdateFiles);

    useEffect(() => {
        if (id) {
            GetReactNativeFiles();
        }
    }, [id]);

    const GetReactNativeFiles = async () => {
        try {
            const result = await convex.query(api.workspace.GetWorkspace, {
                workspaceId: id
            });
            
            if (result?.rnFiles) {
                setRnFiles(result.rnFiles);
            }
        } catch (error) {
            console.error('Error fetching React Native files:', error);
        }
    };

    const GenerateReactNativeCode = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const workspaceData = await convex.query(api.workspace.GetWorkspace, {
                workspaceId: id
            });
            
            const PROMPT = JSON.stringify(messages);
            
            const result = await axios.post('/api/gen-react-native-code', {
                prompt: PROMPT,
                userAnswers: workspaceData?.userAnswers || {}
            });
            
            console.log('React Native AI Response:', result.data);
            
            if (result.data?.rnFiles) {
                setRnFiles(result.data.rnFiles);
                
                // Update the workspace with React Native files
                await UpdateFiles({
                    workspaceId: id,
                    files: {}, // Keep existing web files
                    rnFiles: result.data.rnFiles
                });
            }
        } catch (error) {
            console.error('Error generating React Native code:', error);
            setError('Failed to generate React Native code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadReactNativeFiles = async () => {
        try {
            const zip = new JSZip();
            
                         Object.entries(rnFiles).forEach(([filename, file]) => {
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

            zip.file("README.md", "# React Native App\n\nTo run this app:\n1. Install Node.js and React Native CLI\n2. Run `npm install`\n3. Run `npx react-native run-android` or `npx react-native run-ios`");

            const blob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'react-native-project.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading React Native files:', error);
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
                        <h1 className="text-2xl font-bold text-green-400">React Native Code Generator</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={GenerateReactNativeCode}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate React Native Code'
                            )}
                        </button>
                        
                        {Object.keys(rnFiles).length > 0 && (
                            <button
                                onClick={downloadReactNativeFiles}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download React Native
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

                {Object.keys(rnFiles).length > 0 ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-green-400">
                                Generated React Native Files ({Object.keys(rnFiles).length})
                            </h2>
                            <button
                                onClick={() => {
                                    const appCode = rnFiles['App.tsx']?.code || '';
                                    const snackUrl = `https://snack.expo.dev/?platform=web&name=Generated%20App&description=AI%20Generated%20React%20Native%20App&code=${encodeURIComponent(appCode)}`;
                                    window.open(snackUrl, '_blank');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Open in Expo Snack
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {Object.entries(rnFiles).map(([filename, file]) => (
                                <div key={filename} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                                    <div className="flex items-center justify-between p-4 bg-gray-750 border-b border-gray-700">
                                        <div className="font-bold text-green-400 text-lg">{filename}</div>
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
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-8xl mb-6">📱</div>
                        <h2 className="text-3xl font-bold text-gray-300 mb-4">No React Native Code Generated Yet</h2>
                        <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
                            Generate React Native code for your mobile app based on your requirements and user answers.
                        </p>
                        <button
                            onClick={GenerateReactNativeCode}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-3 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2Icon className="h-5 w-5 animate-spin" />
                                    Generating React Native Code...
                                </>
                            ) : (
                                'Generate React Native Code'
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
                            <Loader2Icon className="animate-spin h-8 w-8 text-green-400"/>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Generating React Native Code...</h2>
                                <p className="text-gray-400 text-sm">This may take a few moments</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReactNativePage; 