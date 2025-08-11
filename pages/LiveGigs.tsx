
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Gig, GigStatus, GigUser } from '../types';
import GigCard from '../components/GigCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import AcceptanceFlowModal from '../components/AcceptanceFlowModal';
import { PhoneIcon, UserIcon } from '../components/icons';

const LiveGigs: React.FC = () => {
    const context = useContext(AppContext);
    const [acceptedGigDetails, setAcceptedGigDetails] = useState<Gig | null>(null);
    const [gigToAccept, setGigToAccept] = useState<Gig | null>(null);
    const [waitError, setWaitError] = useState<string | null>(null);

    if (!context) return <div>Loading...</div>;

    const { gigs, currentUser, updateGig, openAuthModal, platformFee } = context;

    const openGigs = gigs.filter(gig => gig.status === GigStatus.OPEN && gig.requester.id !== currentUser?.id);

    const initiateAcceptGig = (gig: Gig) => {
        if (!currentUser) {
            openAuthModal();
            return;
        }

        // Check if user account is older than 1 hour
        const now = new Date().getTime();
        const createdAt = new Date(currentUser.createdAt).getTime();
        const oneHour = 60 * 60 * 1000;

        if (now - createdAt < oneHour) {
            const timeLeftMs = oneHour - (now - createdAt);
            const minutesLeft = Math.ceil(timeLeftMs / (60 * 1000));
            setWaitError(`Your account is new. You can start accepting gigs in about ${minutesLeft} minutes.`);
            return;
        }

        setGigToAccept(gig);
    };

    const handleConfirmAccept = (selfie: string) => {
        if (!gigToAccept || !currentUser || !selfie) {
            return;
        }
        
        const delivererInfo: GigUser = {
            id: currentUser.id,
            name: currentUser.name,
            phone: currentUser.phone,
            email: currentUser.email,
        };

        const updatedGigData = { 
            status: GigStatus.ACCEPTED, 
            deliverer: delivererInfo,
            acceptanceSelfieUrl: selfie
        };
        updateGig(gigToAccept.id, updatedGigData);
        
        setAcceptedGigDetails({ ...gigToAccept, ...updatedGigData });
        setGigToAccept(null); // Close the acceptance modal
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Live Gigs</h1>
                <p className="text-gray-400 mt-1">Accept a gig to earn money by delivering parcels.</p>
            </div>

            {openGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openGigs.map(gig => (
                        <GigCard 
                            key={gig.id} 
                            gig={gig} 
                            onAction={() => initiateAcceptGig(gig)} 
                            actionLabel="Accept Gig"
                            platformFee={platformFee}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-brand-dark-200 rounded-xl">
                    <h2 className="text-xl font-semibold text-gray-300">No Live Gigs Available</h2>
                    <p className="text-gray-500 mt-2">Check back later or post your own gig!</p>
                </div>
            )}
            
             {/* New User Wait Time Error Modal */}
            {waitError && (
                <Modal isOpen={!!waitError} onClose={() => setWaitError(null)} title="Account Restriction">
                    <div className="text-white text-center space-y-4">
                        <p>{waitError}</p>
                        <Button onClick={() => setWaitError(null)}>OK</Button>
                    </div>
                </Modal>
            )}

            {/* Acceptance Flow Modal */}
            {gigToAccept && (
               <AcceptanceFlowModal
                    isOpen={!!gigToAccept}
                    onClose={() => setGigToAccept(null)}
                    onConfirm={handleConfirmAccept}
                    gig={gigToAccept}
               />
            )}

            {/* Success Modal */}
            {acceptedGigDetails && (
                <Modal isOpen={!!acceptedGigDetails} onClose={() => setAcceptedGigDetails(null)} title="Gig Accepted!">
                    <div className="space-y-4 text-white">
                        <p className="text-gray-300">You are now assigned to deliver this parcel. Here are the details:</p>
                        <div className="bg-brand-dark-300 p-4 rounded-lg space-y-3">
                            <p className="text-lg font-bold">{acceptedGigDetails.parcelInfo}</p>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Requester Details</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <UserIcon className="h-5 w-5 text-brand-primary" />
                                    <span>{acceptedGigDetails.requester.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <PhoneIcon className="h-5 w-5 text-brand-primary" />
                                    <span>{acceptedGigDetails.requester.phone}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Collection OTP</h4>
                                <p className="text-2xl font-bold tracking-widest text-brand-secondary bg-brand-dark-200 p-2 mt-1 rounded-md text-center">{acceptedGigDetails.otp}</p>
                                <p className="text-xs text-gray-500 mt-1">Show this OTP at the pickup location to collect the parcel.</p>
                            </div>
                        </div>
                        <Button onClick={() => setAcceptedGigDetails(null)} fullWidth>Got it!</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default LiveGigs;