
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import { PackageIcon, HomeIcon, ClockIcon, RupeeIcon, DocumentTextIcon, ArchiveBoxIcon, LightningBoltIcon } from '../components/icons';

const CreateGig: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    
    const [parcelInfo, setParcelInfo] = useState('');
    const [pickupBlock, setPickupBlock] = useState('');
    const [destinationBlock, setDestinationBlock] = useState(context?.currentUser?.block || '');
    const [price, setPrice] = useState<number | ''>('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [note, setNote] = useState('');
    const [parcelSize, setParcelSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
    const [isUrgent, setIsUrgent] = useState(false);
    const [error, setError] = useState('');

    const basePrice = typeof price === 'number' && price > 0 ? price : 0;
    const urgentFee = isUrgent ? basePrice * 0.25 : 0;
    const totalPrice = basePrice + urgentFee;

    const delivererEarnings = (totalPrice * (1 - (context?.platformFee || 0.2))).toFixed(2);
    const platformFeeAmount = (totalPrice * (context?.platformFee || 0.2)).toFixed(2);
    
    useEffect(() => {
        if(isUrgent) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15); // Set default to 15 mins from now for convenience
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setDeliveryTime(`${hours}:${minutes}`);
        }
    }, [isUrgent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!parcelInfo || !pickupBlock || !destinationBlock || !price || price <= 0 || !deliveryTime) {
            setError('Please fill out all fields with valid values.');
            return;
        }
        if (!context || !context.currentUser) {
            setError('You must be logged in to create a gig.');
            return;
        }
        if (context.currentUser.walletBalance < totalPrice) {
            setError(`Insufficient wallet balance. Your current balance is ₹${context.currentUser.walletBalance.toFixed(2)}. Required: ₹${totalPrice.toFixed(2)}`);
            return;
        }

        const [hours, minutes] = deliveryTime.split(':').map(Number);
        const deadline = new Date();
        deadline.setHours(hours, minutes, 0, 0);

        if (deadline.getTime() < Date.now()) {
            deadline.setDate(deadline.getDate() + 1);
        }

        if (isUrgent) {
            const thirtyMinsFromNow = new Date(Date.now() + 30 * 60 * 1000);
            if (deadline.getTime() > thirtyMinsFromNow.getTime()) {
                setError('Urgent deliveries must be scheduled for within the next 30 minutes.');
                return;
            }
        }

        const success = context.addGig({ 
            parcelInfo, 
            pickupBlock, 
            destinationBlock, 
            price: totalPrice, 
            deliveryDeadline: deadline,
            note,
            size: parcelSize,
            isUrgent,
        });

        if(success) {
            navigate('/my-gigs');
        } else {
            setError('There was an error creating the gig. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-brand-dark-200 p-4 md:p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create a New Gig</h1>
                    <p className="text-gray-400">Need a parcel delivered? Post a job for others to accept.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400">Your Balance</div>
                    <div className="text-lg font-bold text-brand-secondary">₹{context?.currentUser?.walletBalance.toFixed(2)}</div>
                </div>
            </div>
            
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="parcelInfo" className="block text-sm font-medium text-gray-300 mb-2">Parcel Information</label>
                        <div className="relative">
                            <PackageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="parcelInfo" type="text" placeholder="e.g., Amazon Box, Swiggy Food" value={parcelInfo} onChange={e => setParcelInfo(e.target.value)} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="parcelSize" className="block text-sm font-medium text-gray-300 mb-2">Parcel Size</label>
                        <div className="relative">
                            <ArchiveBoxIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select id="parcelSize" value={parcelSize} onChange={e => setParcelSize(e.target.value as 'Small' | 'Medium' | 'Large')} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none">
                                <option value="Small">Small (e.g., Letter, Phone)</option>
                                <option value="Medium">Medium (e.g., Shoebox)</option>
                                <option value="Large">Large (e.g., Backpack)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="pickupBlock" className="block text-sm font-medium text-gray-300 mb-2">Pickup Point / Block</label>
                        <div className="relative">
                            <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="pickupBlock" type="text" placeholder="e.g., Main Gate, Library" value={pickupBlock} onChange={e => setPickupBlock(e.target.value)} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="destinationBlock" className="block text-sm font-medium text-gray-300 mb-2">Destination Block</label>
                        <div className="relative">
                            <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="destinationBlock" type="text" placeholder="Your Hostel Block Number" value={destinationBlock} onChange={e => setDestinationBlock(e.target.value)} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-2">Note (Optional)</label>
                    <div className="relative">
                        <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <textarea id="note" placeholder="e.g., It's fragile, please handle with care." value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">Offer Price (INR)</label>
                        <div className="relative">
                            <RupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="price" type="number" placeholder="e.g., 50" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-300 mb-2">Deliver By (Time)</label>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="deliveryTime" type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full bg-brand-dark-300 border border-brand-dark-300 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-brand-dark-300/50 p-4 rounded-lg space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                            <LightningBoltIcon className="h-6 w-6 text-yellow-400 mr-2"/>
                            <span className="font-semibold text-white">Mark as Urgent Parcel (+25% fee)</span>
                        </div>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                            <div className="block bg-brand-dark w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isUrgent ? 'translate-x-full bg-brand-primary' : ''}`}></div>
                        </div>
                    </label>
                    <p className="text-xs text-yellow-300/80 text-center">Urgent parcels are delivered ASAP (within 30 mins) for a surcharge.</p>
                    <div className="border-t border-brand-dark-300 pt-3 space-y-1 text-sm">
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Base Price:</span>
                            <span className="font-semibold">₹{basePrice.toFixed(2)}</span>
                        </div>
                        {isUrgent && (
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Urgent Fee:</span>
                                <span className="font-semibold">₹{urgentFee.toFixed(2)}</span>
                            </div>
                        )}
                         <div className="flex justify-between items-center text-white text-base pt-1">
                            <span className="font-bold">Total Cost:</span>
                            <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-dark-300/50 p-4 rounded-lg text-sm">
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Deliverer's Earnings ({(1 - (context?.platformFee || 0.2)) * 100}%):</span>
                        <span className="font-semibold text-brand-secondary">₹{delivererEarnings}</span>
                    </div>
                     <div className="flex justify-between items-center text-gray-400 mt-1">
                        <span>Platform Fee ({(context?.platformFee || 0.2) * 100}%):</span>
                        <span className="font-semibold">₹{platformFeeAmount}</span>
                    </div>
                </div>

                <Button type="submit" fullWidth>Post Gig for ₹{totalPrice.toFixed(2)}</Button>
            </form>
        </div>
    );
};

export default CreateGig;
