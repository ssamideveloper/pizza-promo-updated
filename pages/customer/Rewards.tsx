import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Gift, Lock, Check } from 'lucide-react';
import { savePromo, redeemLoyaltyPoints } from '../../services/storage';
import { Link } from 'react-router-dom';

const Rewards = () => {
  const { userPoints, currentUserPhone, loginUser } = useStore();
  const [phoneInput, setPhoneInput] = React.useState('');

  const REWARDS = [
    { cost: 50, title: "Free Drink", desc: "Get a generic promo code for $3 off", value: 3 },
    { cost: 100, title: "$10 Off Order", desc: "A big discount for your next feast", value: 10 },
    { cost: 200, title: "Free Large Pizza", desc: "Equivalent to $20 discount", value: 20 },
  ];

  const handleRedeem = (cost: number, value: number) => {
    if (!currentUserPhone) return;
    const success = redeemLoyaltyPoints(currentUserPhone, cost);
    if (success) {
        // Generate a simplified unique code
        const code = `REWARD-${Math.floor(Math.random() * 10000)}`;
        savePromo({
            id: Date.now().toString(),
            code,
            type: 'fixed',
            value: value,
            active: true,
            description: `Loyalty Reward: $${value} Off`
        });
        alert(`Redeemed! Your code is: ${code}. Write it down or use it at checkout!`);
        window.location.reload(); // Refresh points display
    } else {
        alert("Not enough points!");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if(phoneInput.length > 3) loginUser(phoneInput);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-800 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl mb-12">
         <Gift className="h-16 w-16 mx-auto mb-4 text-secondary" />
         <h1 className="text-4xl font-bold mb-4">Primo Loyalty Rewards</h1>
         <p className="text-xl text-orange-100 mb-8">Earn 1 point for every $1 you spend.</p>
         
         {!currentUserPhone ? (
             <div className="max-w-sm mx-auto bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                 <p className="mb-4 text-sm font-semibold">Enter phone number to view points</p>
                 <form onSubmit={handleLogin} className="flex gap-2">
                     <input 
                        type="tel" 
                        className="flex-grow p-2 rounded text-gray-900 outline-none" 
                        placeholder="555-0199"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                     />
                     <button className="bg-secondary text-red-900 font-bold px-4 rounded hover:bg-yellow-300">Check</button>
                 </form>
             </div>
         ) : (
             <div>
                 <div className="text-6xl font-bold text-secondary mb-2">{userPoints}</div>
                 <div className="text-sm uppercase tracking-widest font-semibold">Current Points</div>
             </div>
         )}
      </div>

      {/* Catalog */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Rewards Catalog</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {REWARDS.map((reward, idx) => {
            const canAfford = userPoints >= reward.cost;
            return (
                <div key={idx} className={`border rounded-xl p-6 flex flex-col ${canAfford ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{reward.title}</h3>
                    <p className="text-gray-500 mb-4 flex-grow">{reward.desc}</p>
                    <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-primary">{reward.cost} Points</span>
                        {currentUserPhone ? (
                            <button 
                                onClick={() => handleRedeem(reward.cost, reward.value)}
                                disabled={!canAfford}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${canAfford ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {canAfford ? 'Redeem' : 'Locked'}
                            </button>
                        ) : (
                            <Lock size={20} className="text-gray-300" />
                        )}
                    </div>
                </div>
            )
        })}
      </div>
      
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Points are automatically added to your phone number upon checkout.</p>
      </div>
    </div>
  );
};

export default Rewards;