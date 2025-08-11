

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import Button from '../components/Button';
import LoadWalletModal from '../components/LoadWalletModal';
import WithdrawModal from '../components/WithdrawModal';
import { RupeeIcon } from '../components/icons';

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isCredit = ['CREDIT', 'TOPUP', 'PAYOUT'].includes(transaction.type);
    const color = isCredit ? 'text-green-400' : 'text-red-400';
    const sign = isCredit ? '+' : '-';

    return (
        <div className="flex justify-between items-center p-4 border-b border-brand-dark-300">
            <div>
                <p className="font-semibold text-white">{transaction.description}</p>
                <p className="text-xs text-gray-500">{transaction.timestamp.toLocaleString()}</p>
            </div>
            <p className={`font-bold text-lg ${color}`}>{sign} ₹{transaction.amount.toFixed(2)}</p>
        </div>
    );
}

const Wallet: React.FC = () => {
    const context = useContext(AppContext);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    if (!context || !context.currentUser) return <div>Loading...</div>;
    const { currentUser, transactions } = context;

    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    const canWithdraw = currentUser.walletBalance >= 100;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Wallet</h1>
                <p className="text-gray-400 mt-1">Manage your balance and view your transaction history.</p>
            </div>
            <div className="bg-brand-dark-200 p-6 md:p-8 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <p className="text-gray-400">Current Balance</p>
                    <p className="text-5xl font-bold text-brand-secondary flex items-center">
                        <RupeeIcon className="h-10 w-10 mr-2" />
                        {currentUser.walletBalance.toFixed(2)}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => setIsWithdrawModalOpen(true)}
                        variant="secondary"
                        disabled={!canWithdraw}
                        title={!canWithdraw ? "Minimum balance of ₹100 required to withdraw" : "Withdraw funds from your wallet"}
                    >
                        Withdraw
                    </Button>
                    <Button onClick={() => setIsLoadModalOpen(true)}>Load Money</Button>
                </div>
            </div>
            <div className="bg-brand-dark-200 rounded-xl">
                <h2 className="text-xl font-bold text-white p-4 border-b border-brand-dark-300">Transaction History</h2>
                {userTransactions.length > 0 ? (
                    <div className="divide-y divide-brand-dark-300">
                        {userTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 p-8">No transactions yet.</p>
                )}
            </div>
            
            <LoadWalletModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} />
        </div>
    );
};

export default Wallet;