"use client"
import ChatView from '@/components/custom/ChatView';
import CodeView from '@/components/custom/CodeView';
import Header from '@/components/custom/Header';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

const Workspace = () => {
    const { id } = useParams();
    const convex = useConvex();
    const [workspaceData, setWorkspaceData] = useState(null);

    useEffect(() => {
        if (id) {
            getWorkspaceData();
        }
    }, [id]);

    const getWorkspaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        setWorkspaceData(result);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-pink-950/20 relative overflow-hidden">
            <Header />
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle_400px_at_50%_300px,#a855f725,transparent)]" />
            </div>

            {/* Content */}
            <div className='relative z-10 p-10'>
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Chat & Code Generation</h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
                    <ChatView />
                    <div className='col-span-3'>
                        <CodeView />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;