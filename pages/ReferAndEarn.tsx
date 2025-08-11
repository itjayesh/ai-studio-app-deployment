
import React, { useState, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { GiftIcon, ShareIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '../components/icons';
import Button from '../components/Button';

const ReferAndEarn: React.FC = () => {
    const context = useContext(AppContext);
    const [copied, setCopied] = useState(false);

    const { currentUser } = context!;

    const handleCopy = useCallback(() => {
        if (!currentUser?.referralCode) return;
        navigator.clipboard.writeText(currentUser.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [currentUser?.referralCode]);

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <ShareIcon className="h-16 w-16 mx-auto text-brand-primary" />
                <h1 className="text-4xl font-bold text-white mt-4">Refer & Earn</h1>
                <p className="text-lg text-gray-400 mt-2">Share the love and get rewarded!</p>
            </div>

            <div className="bg-brand-dark-200 p-8 rounded-xl grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Share Your Code</h2>
                    <p className="text-gray-300">Share your unique referral code with your friends. When they sign up and make their first wallet load of ₹100 or more, you both win!</p>
                    <div className="bg-brand-dark-300 p-4 rounded-lg flex items-center justify-between gap-4">
                        <span className="font-mono text-xl text-brand-secondary tracking-widest">{currentUser.referralCode}</span>
                        <Button onClick={handleCopy} variant="secondary">
                            {copied ? <ClipboardDocumentCheckIcon className="h-5 w-5"/> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-brand-dark-300 p-6 rounded-lg">
                        <h3 className="font-bold text-lg text-white">You Get</h3>
                        <p className="text-4xl font-bold text-brand-secondary mt-2">₹10</p>
                        <p className="text-gray-400">for every friend who recharges their wallet with at least ₹100 for the first time.</p>
                    </div>
                    <div className="bg-brand-dark-300 p-6 rounded-lg">
                        <h3 className="font-bold text-lg text-white">Your Friend Gets</h3>
                        <p className="text-4xl font-bold text-brand-secondary mt-2">5% <span className="text-2xl">Bonus</span></p>
                        <p className="text-gray-400">on their first wallet recharge of ₹100 or more.</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                 <p className="text-xs text-gray-500">Terms & Conditions apply. Rewards are subject to change.</p>
            </div>
        </div>
    );
};

export default ReferAndEarn;
