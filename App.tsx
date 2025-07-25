
import React, { useState, useCallback } from 'react';
import { generateImage } from './services/geminiService';
import { base64ToFile } from './utils/imageUtils';
import { SparklesIcon, LoaderIcon, ShareIcon, ImageIcon } from './components/Icons';

// Helper components are defined outside the main component to prevent re-rendering issues.
const ImagePlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-gray-400 h-full p-4 text-center">
        <ImageIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-semibold">Your image will appear here</p>
        <p className="text-sm">Describe what you want to color!</p>
    </div>
);

const ImageViewer: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <img
        src={`data:image/png;base64,${src}`}
        alt={alt}
        className="w-full h-full object-contain rounded-xl"
    />
);


const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for your coloring page.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageB64 = await generateImage(prompt);
            setGeneratedImage(imageB64);
        } catch (apiError: any) {
            setError(apiError.toString() || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleShare = useCallback(async () => {
        if (!generatedImage) return;

        try {
            const file = await base64ToFile(
                generatedImage,
                `${prompt.slice(0, 20).replace(/\s+/g, '_')}_coloring_page.png`,
                'image/png'
            );
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Coloring Page',
                    text: `Check out this coloring page I made: ${prompt}`,
                    files: [file],
                });
            } else {
                setError('Web Share API is not supported in this browser, or cannot share files.');
            }
        } catch (shareError) {
            console.error('Error sharing:', shareError);
            if ((shareError as DOMException).name !== 'AbortError') {
                 setError('Could not share the image.');
            }
        }
    }, [generatedImage, prompt]);


    return (
        <div className="font-sans flex items-center justify-center p-4 min-h-screen">
            <main className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-10 space-y-8 transform transition-all">
                <header className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                        Coloring Page Creator
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Turn your ideas into beautiful, black-and-white coloring pages.
                    </p>
                </header>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-3">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., a castle in the clouds"
                            className="flex-grow w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 shadow-sm resize-none disabled:bg-gray-100"
                            rows={3}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 ease-in-out disabled:bg-purple-300 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="animate-spin w-5 h-5" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Generate</span>
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md text-sm" role="alert">
                           <p className="font-bold">Oops, something went wrong!</p>
                           <p>{error}</p>
                        </div>
                    )}
                </div>

                <div className="aspect-square w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-2 shadow-inner overflow-hidden">
                    {generatedImage ? (
                        <ImageViewer src={generatedImage} alt={prompt} />
                    ) : (
                        <ImagePlaceholder />
                    )}
                </div>

                {generatedImage && (
                    <div className="flex justify-center">
                        <button
                           onClick={handleShare}
                           className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                            <ShareIcon className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
