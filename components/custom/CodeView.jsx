"use client"
import React, { use, useContext } from 'react';
import { useState } from 'react';
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import axios from 'axios';
import Prompt from '@/data/Prompt';
import { useEffect } from 'react';
import { UpdateFiles } from '@/convex/workspace';
import { useConvex, useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Loader2Icon, Download } from 'lucide-react';
import Link from 'next/link';
import JSZip from 'jszip';

function CodeView() {

    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('code');
    const [files,setFiles]=useState(Lookup?.DEFAULT_FILE);
    const [flutterFiles, setFlutterFiles] = useState({});
    const [rnFiles, setRnFiles] = useState({});
    const {messages,setMessages}=useContext(MessagesContext);
    const UpdateFiles=useMutation(api.workspace.UpdateFiles);
    const convex=useConvex();
    const [loading,setLoading]=useState(false);

    useEffect(() => {
        id&&GetFiles();
    }, [id])

    const GetFiles=async()=>{
        const result=await convex.query(api.workspace.GetWorkspace,{
            workspaceId:id
        });
        // Preprocess and validate files before merging
        const processedFiles = preprocessFiles(result?.fileData || {});
        const mergedFiles = {...Lookup.DEFAULT_FILE, ...processedFiles};
        setFiles(mergedFiles);
        
        // Set mobile files if available
        if (result?.flutterFiles) setFlutterFiles(result.flutterFiles);
        if (result?.rnFiles) setRnFiles(result.rnFiles);
    }

    // Add file preprocessing function
    const preprocessFiles = (files) => {
        const processed = {};
        Object.entries(files).forEach(([path, content]) => {
            // Ensure the file has proper content structure
            if (typeof content === 'string') {
                processed[path] = { code: content };
            } else if (content && typeof content === 'object') {
                if (!content.code && typeof content === 'object') {
                    processed[path] = { code: JSON.stringify(content, null, 2) };
                } else {
                    processed[path] = content;
                }
            }
        });
        return processed;
    }

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length - 1].role;
            if (role === 'user') {
                GenerateAiCode();
            }
        }
    }, [messages])

    const GenerateAiCode=async()=>{
        setLoading(true);
        try {
        const workspaceData = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        
        const includeMobile = workspaceData?.includeMobile || false;
            const PROMPT = JSON.stringify(messages);
        
        const result = await axios.post('/api/gen-ai-code', {
            prompt: PROMPT,
            includeMobile: includeMobile
        });
            
            console.log('AI Response:', result.data);
        
        // Preprocess AI-generated files
        const processedAiFiles = preprocessFiles(result.data?.files || {});
            const mergedFiles = {...Lookup.DEFAULT_FILE, ...processedAiFiles};
        setFiles(mergedFiles);
        
        // Set mobile code if present
        if (result.data?.flutterFiles) {
            setFlutterFiles(result.data.flutterFiles);
        }
        if (result.data?.rnFiles) {
            setRnFiles(result.data.rnFiles);
        }
        
            const updateData = {
            workspaceId: id,
                files: result.data?.files || {}
            };
            
            // Only add optional fields if they exist
            if (result.data?.flutterFiles) {
                updateData.flutterFiles = result.data.flutterFiles;
            }
            if (result.data?.rnFiles) {
                updateData.rnFiles = result.data.rnFiles;
            }
            
            await UpdateFiles(updateData);
        } catch (error) {
            console.error('Error generating code:', error);
        } finally {
        setLoading(false);
        }
    }

    const downloadFiles = async (type = 'web') => {
        try {
            // Create a new JSZip instance
            const zip = new JSZip();
            let filesToZip = files;
            if (type === 'flutter') filesToZip = flutterFiles;
            if (type === 'react-native') filesToZip = rnFiles;
            
            // Add each file to the zip
            Object.entries(filesToZip).forEach(([filename, content]) => {
                // Handle the file content based on its structure
                let fileContent;
                if (typeof content === 'string') {
                    fileContent = content;
                } else if (content && typeof content === 'object') {
                    if (content.code) {
                        fileContent = content.code;
                    } else {
                        // If it's an object without code property, stringify it
                        fileContent = JSON.stringify(content, null, 2);
                    }
                }

                // Only add the file if we have content
                if (fileContent) {
                    // Remove leading slash if present
                    const cleanFileName = filename.startsWith('/') ? filename.slice(1) : filename;
                    zip.file(cleanFileName, fileContent);
                }
            });

            // Add package.json with dependencies for web projects
            if (type === 'web') {
                const packageJson = {
                    name: "generated-project",
                    version: "1.0.0",
                    private: true,
                    dependencies: Lookup.DEPENDANCY,
                    scripts: {
                        "dev": "vite",
                        "build": "vite build",
                        "preview": "vite preview"
                    }
                };
                zip.file("package.json", JSON.stringify(packageJson, null, 2));
            }

            // Add a README for mobile code
            if (type === 'flutter') {
                zip.file("README.md", "# Flutter App\n\nTo run this app, use `flutter run`.");
            }
            if (type === 'react-native') {
                zip.file("README.md", "# React Native App\n\nTo run this app, use `npx react-native run-android` or `run-ios`.");
            }

            // Generate the zip file
            const blob = await zip.generateAsync({ type: "blob" });
            
            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-project-files.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading files:', error);
        }
    };

    return (
        <div className='relative'>
            <div className='bg-[#181818] w-full p-2 border'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        {/* Web Tabs */}
                        <div className='flex items-center bg-gray-800 p-1 rounded-lg'>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`text-sm cursor-pointer px-3 py-1 rounded-md transition-all duration-200 ${
                                    activeTab == 'code' 
                                        ? 'text-white bg-blue-500 shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Code
                            </button>
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`text-sm cursor-pointer px-3 py-1 rounded-md transition-all duration-200 ${
                                    activeTab == 'preview' 
                                        ? 'text-white bg-blue-500 shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Preview
                            </button>
                        </div>
                        
                        {/* Mobile Buttons */}
                        <div className='flex items-center gap-2'>
                            <span className='text-xs text-gray-400 font-medium'>MOBILE:</span>
                            <Link href={`/workspace/${id}/flutter`}>
                                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
                                    <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm"></div>
                                    </div>
                                    Flutter
                                </button>
                            </Link>
                                
                            <Link href={`/workspace/${id}/react-native`}>
                                <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
                                    <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-sm"></div>
                                    </div>
                                    React Native
                                </button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Download Button */}
                    <button
                        onClick={() => downloadFiles('web')}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download Web</span>
                </button>
                </div>
            </div>
            
            {activeTab === 'code' || activeTab === 'preview' ? (
                <SandpackProvider 
                files={files}
                template="react" 
                theme={'dark'}
                customSetup={{
                    dependencies: {
                        ...Lookup.DEPENDANCY
                    },
                    entry: '/index.js'
                }}
                options={{
                    externalResources: ['https://cdn.tailwindcss.com'],
                    bundlerTimeoutSecs: 30,
                    recompileMode: "immediate",
                    recompileDelay: 100
                }}
                >
                    <div className="relative">
                    <SandpackLayout>
                            {activeTab=='code'?<>
                                <SandpackFileExplorer style={{ height: '80vh' }} />
                                <SandpackCodeEditor 
                                style={{ height: '80vh' }}
                                showTabs
                                showLineNumbers
                                showInlineErrors
                                wrapContent />
                            </>:
                            <>
                                <SandpackPreview 
                                    style={{ height: '80vh' }} 
                                    showNavigator={true}
                                    showOpenInCodeSandbox={false}
                                    showRefreshButton={true}
                                />
                            </>}
                    </SandpackLayout>
                    </div>
                </SandpackProvider>
            ) : null}

            {loading&&<div className='p-10 bg-gray-900 opacity-80 absolute top-0 
            rounded-lg w-full h-full flex items-center justify-center'>
                <Loader2Icon className='animate-spin h-10 w-10 text-white'/>
                <h2 className='text-white'> Generating files...</h2>
            </div>}
        </div>
    );
}

export default CodeView;