import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import GigCard from '../components/GigCard';
import FeedbackForm from '../components/FeedbackForm';
import { Gig, GigStatus } from '../types';
import Button from '../components/Button';

enum Tab {
    Posted,
    Accepted
}

type FeedbackState = {
    gig: Gig;
    target: 'requester' | 'deliverer';
};

const MyGigs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Posted);
    const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
    const context = useContext(AppContext);

    if (!context) return <div>Loading...</div>;

    const { gigs, currentUser, updateGig, platformFee } = context;

    if (!currentUser) return null;

    const postedGigs = gigs.filter(gig => gig.requester.id === currentUser.id);
    const acceptedGigs = gigs.filter(gig => gig.deliverer?.id === currentUser.id);
    
    const markAsComplete = (gigId: string, otp: string) => {
        const gig = gigs.find(g => g.id === gigId);
        // This is a simplified OTP check. In a real app, this would be more secure.
        if (gig && gig.otp === otp) {
            updateGig(gigId, { status: GigStatus.COMPLETED });
        } else {
            alert("Incorrect OTP!");
        }
    };
    
    const CompletionInput: React.FC<{ gig: Gig }> = ({ gig }) => {
        const [otpInput, setOtpInput] = useState('');
        
        return (
            <div className="mt-2 flex gap-2">
                <input 
                    type="text" 
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter OTP from deliverer"
                    className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <Button onClick={() => markAsComplete(gig.id, otpInput)}>Confirm</Button>
            </div>
        );
    };

    const handleFeedbackSubmit = (rating: number, comments: string) => {
        if (!feedbackState) return;
        
        const { gig, target } = feedbackState;
        
        let feedbackData: Partial<Gig> = {};
        if (target === 'deliverer') {
            feedbackData = { delivererRating: rating, delivererComments: comments };
        } else { // target is 'requester'
            feedbackData = { requesterRating: rating, requesterComments: comments };
        }
        
        updateGig(gig.id, feedbackData);
        setFeedbackState(null);
    };

    const getGigCard = (gig: Gig, isPosted: boolean) => {
        const showOtp = !isPosted && gig.status === GigStatus.ACCEPTED;
        
        const showRateDelivererButton = isPosted && gig.status === GigStatus.COMPLETED && !gig.delivererRating;
        const showRateRequesterButton = !isPosted && gig.status === GigStatus.COMPLETED && !gig.requesterRating;

        return (
            <div key={gig.id}>
                <GigCard 
                    gig={gig} 
                    showRequesterInfo={true}
                    platformFee={platformFee}
                    showOtp={showOtp}
                />
                 {isPosted && gig.status === GigStatus.ACCEPTED && <CompletionInput gig={gig} />}
                 {showRateDelivererButton && (
                    <Button fullWidth className="mt-2" variant="secondary" onClick={() => setFeedbackState({ gig, target: 'deliverer' })}>
                        Rate {gig.deliverer?.name || 'Deliverer'}
                    </Button>
                 )}
                 {showRateRequesterButton && (
                    <Button fullWidth className="mt-2" variant="secondary" onClick={() => setFeedbackState({ gig, target: 'requester' })}>
                        Rate {gig.requester.name}
                    </Button>
                 )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">My Gigs</h1>
                <p className="text-gray-400 mt-1">Track your delivery requests and jobs.</p>
            </div>
            <div className="flex space-x-1 bg-brand-dark-200 p-1 rounded-lg">
                <button onClick={() => setActiveTab(Tab.Posted)} className={`w-full p-2 rounded-md font-semibold transition-colors ${activeTab === Tab.Posted ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-brand-dark-300'}`}>Posted by Me</button>
                <button onClick={() => setActiveTab(Tab.Accepted)} className={`w-full p-2 rounded-md font-semibold transition-colors ${activeTab === Tab.Accepted ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-brand-dark-300'}`}>Accepted by Me</button>
            </div>
            <div>
                {activeTab === Tab.Posted && (
                    postedGigs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {postedGigs.map(gig => getGigCard(gig, true))}
                        </div>
                    ) : <p className="text-center text-gray-400 py-8">You haven't posted any gigs yet.</p>
                )}
                {activeTab === Tab.Accepted && (
                    acceptedGigs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {acceptedGigs.map(gig => getGigCard(gig, false))}
                        </div>
                    ) : <p className="text-center text-gray-400 py-8">You haven't accepted any gigs yet.</p>
                )}
            </div>
            {feedbackState && (
                <FeedbackForm
                    isOpen={!!feedbackState}
                    onClose={() => setFeedbackState(null)}
                    onSubmit={handleFeedbackSubmit}
                    targetName={
                        feedbackState.target === 'deliverer' 
                        ? feedbackState.gig.deliverer?.name || 'the deliverer' 
                        : feedbackState.gig.requester.name
                    }
                />
            )}
        </div>
    );
};

export default MyGigs;