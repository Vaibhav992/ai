"use client"
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Sparkles, Send, Wand2, Loader2, Brain, Zap, Smartphone, Monitor } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

function Hero() {
    const [userInput, setUserInput] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isEnhanced, setIsEnhanced] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [followUpQuestions, setFollowUpQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [includeMobile, setIncludeMobile] = useState(false);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const { messages, setMessages } = useContext(MessagesContext);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
    const router = useRouter();

    const generateFollowUpQuestions = async (prompt) => {
        setIsGeneratingQuestions(true);
        try {
            const response = await fetch('/api/follow-up-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userPrompt: prompt }),
            });
            const data = await response.json();
            if (data.questions) {
                setFollowUpQuestions(data.questions);
                setShowFollowUp(true);
            }
        } catch (error) {
            console.error('Error generating follow-up questions:', error);
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const onGenerate = async (input) => {
        if (!showFollowUp) {
            // First time - generate follow-up questions
            await generateFollowUpQuestions(input);
            return;
        }

        // Second time - proceed with code generation
        const enhancedPrompt = `${input}\n\nUser Answers to Follow-up Questions:\n${Object.entries(userAnswers).map(([id, answer]) => `Q${id}: ${answer}`).join('\n')}`;
        
        const msg = {
            role: 'user',
            content: enhancedPrompt
        }
        setMessages(msg);
        const workspaceID = await CreateWorkspace({
            messages: [msg],
            userAnswers: userAnswers,
            includeMobile: includeMobile
        });
        router.push('/workspace/' + workspaceID);
    }

    const enhancePrompt = async () => {
        if (!userInput) return;
        
        setIsEnhancing(true);
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput }),
            });

            const data = await response.json();
            if (data.enhancedPrompt) {
                setUserInput(data.enhancedPrompt);
                setIsEnhanced(true);
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const resetToInitial = () => {
        setShowFollowUp(false);
        setFollowUpQuestions([]);
        setUserAnswers({});
        setIncludeMobile(false);
        setIsEnhanced(false);
    };

    if (showFollowUp) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-950 via-purple-900/40 to-pink-950/20">
                <div className="max-w-4xl w-full space-y-8 bg-gray-900/80 rounded-3xl shadow-2xl p-10 border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <NextLink href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                            <Brain className="w-10 h-10 text-purple-400" />
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Refine Your Requirements</h1>
                        </NextLink>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-lg text-gray-300 mb-4">Help us understand your needs better:</p>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => setIncludeMobile(false)}
                                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                                    !includeMobile 
                                        ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/20' 
                                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800/70'
                                }`}
                            >
                                <Monitor className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="font-semibold">Web Only</div>
                                    <div className="text-xs opacity-70">React + Vite</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setIncludeMobile(true)}
                                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                                    includeMobile 
                                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/20' 
                                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800/70'
                                }`}
                            >
                                <Smartphone className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="font-semibold">Web + Mobile</div>
                                    <div className="text-xs opacity-70">React + Flutter + RN</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm text-purple-400 font-medium">
                                {Object.keys(userAnswers).length} of {followUpQuestions.length} answered
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(Object.keys(userAnswers).length / followUpQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {followUpQuestions.map((question) => (
                            <div key={question.id} className={`bg-gray-800/50 rounded-xl p-6 border-2 transition-all duration-200 ${
                                userAnswers[question.id] 
                                    ? 'border-green-500/30 bg-gray-800/70' 
                                    : 'border-gray-600/50 bg-gray-800/50'
                            }`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        userAnswers[question.id]
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-600 text-gray-400'
                                    }`}>
                                        {userAnswers[question.id] ? '✓' : '?'}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {question.question}
                                    </h3>
                                </div>
                                {question.options ? (
                                    <div className="grid gap-3">
                                        {question.options.map((option, index) => (
                                            <label 
                                                key={index} 
                                                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                                    userAnswers[question.id] === option
                                                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700/70'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                                                    userAnswers[question.id] === option
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-gray-400 bg-transparent'
                                                }`}>
                                                    {userAnswers[question.id] === option && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <span className={`font-medium transition-colors duration-200 ${
                                                    userAnswers[question.id] === option
                                                        ? 'text-white'
                                                        : 'text-gray-300'
                                                }`}>
                                                    {option}
                                                </span>
                                                {userAnswers[question.id] === option && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        placeholder="Type your answer..."
                                        value={userAnswers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        rows={3}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={resetToInitial}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => onGenerate(userInput)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-lg font-semibold"
                        >
                            <Sparkles className="w-5 h-5" /> 
                            Generate {includeMobile ? 'Web & Mobile' : 'Web'} Code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-950 via-purple-900/40 to-pink-950/20">
            <div className="max-w-2xl w-full space-y-8 bg-gray-900/80 rounded-3xl shadow-2xl p-10 border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <NextLink href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                        <Brain className="w-10 h-10 text-purple-400" />
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Build the Future</h1>
                    </NextLink>
                </div>
                <p className="text-lg text-gray-300 mb-8">Describe your website idea and chat with AI to generate code for web and mobile apps.</p>
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <textarea
                            className={`w-full px-6 py-4 rounded-xl bg-gray-800 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-200 ${
                                isEnhanced ? 'ring-2 ring-emerald-500 bg-gray-800/90' : ''
                            }`}
                            placeholder="e.g. I want a modern portfolio site with contact form and project showcase"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            rows={4}
                            disabled={isEnhancing || isGeneratingQuestions}
                        />
                        {isEnhanced && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                                <Wand2 className="w-3 h-3" />
                                Enhanced
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {userInput && (
                            <button
                                onClick={enhancePrompt}
                                disabled={isEnhancing || isGeneratingQuestions}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isEnhancing || isGeneratingQuestions 
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg'
                                }`}
                                title="Enhance your prompt with AI"
                            >
                                {isEnhancing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Wand2 className="w-5 h-5" />
                                )}
                                {isEnhancing ? 'Enhancing...' : 'Enhance'}
                            </button>
                        )}
                        <button
                            onClick={() => onGenerate(userInput)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-lg font-semibold"
                            disabled={isEnhancing || isGeneratingQuestions || !userInput}
                        >
                            {isGeneratingQuestions ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" /> 
                                    Start Building
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;