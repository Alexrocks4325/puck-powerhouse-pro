import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Gift, Star, Crown } from "lucide-react";

interface CoinShopProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: {
    coins: number;
    packs: number;
    level: number;
  };
  setPlayerData: (data: any) => void;
}

const CoinShop = ({ isOpen, onClose, playerData, setPlayerData }: CoinShopProps) => {
  const coinPackages = [
    {
      id: 1,
      name: "Starter Pack",
      coins: 1000,
      bonus: 0,
      price: "$0.99",
      icon: Coins,
      popular: false,
      color: "border-bronze"
    },
    {
      id: 2,
      name: "Pro Pack",
      coins: 5000,
      bonus: 500,
      price: "$4.99",
      icon: Star,
      popular: true,
      color: "border-gold"
    },
    {
      id: 3,
      name: "Elite Pack",
      coins: 12000,
      bonus: 2000,
      price: "$9.99",
      icon: Crown,
      popular: false,
      color: "border-primary"
    },
    {
      id: 4,
      name: "Ultimate Pack",
      coins: 25000,
      bonus: 7500,
      price: "$19.99",
      icon: Gift,
      popular: false,
      color: "border-purple-500"
    }
  ];

  const handlePurchase = (packageData: any) => {
    // In a real app, this would integrate with payment processing
    // For demo purposes, we'll just add the coins
    const totalCoins = packageData.coins + packageData.bonus;
    
    setPlayerData(prev => ({
      ...prev,
      coins: prev.coins + totalCoins
    }));

    // Show success message
    alert(`Successfully purchased ${totalCoins.toLocaleString()} coins!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Coin Shop</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Coins className="w-6 h-6 text-gold" />
              <span className="text-xl font-semibold text-gold">
                Current Balance: {playerData.coins.toLocaleString()} coins
              </span>
            </div>
            <p className="text-muted-foreground">
              Purchase coins to buy packs and unlock premium content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coinPackages.map((pkg) => {
              const IconComponent = pkg.icon;
              return (
                <Card 
                  key={pkg.id} 
                  className={`p-6 relative ${pkg.color} ${pkg.popular ? 'ring-2 ring-gold' : ''}`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold text-black">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center space-y-4">
                    <IconComponent className="w-12 h-12 mx-auto text-primary" />
                    
                    <div>
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Coins className="w-5 h-5 text-gold" />
                        <span className="text-2xl font-bold text-gold">
                          {pkg.coins.toLocaleString()}
                        </span>
                        {pkg.bonus > 0 && (
                          <span className="text-sm text-green-500 font-semibold">
                            +{pkg.bonus.toLocaleString()} Bonus!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-foreground">{pkg.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.bonus > 0 && (
                          <div>Total: {(pkg.coins + pkg.bonus).toLocaleString()} coins</div>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={() => handlePurchase(pkg)}
                      className="w-full btn-primary"
                      size="lg"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What can you do with coins?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Buy player packs (Bronze: 250, Standard: 500, Premium: 1000, Elite: 2500)</li>
              <li>• Unlock premium game modes and features</li>
              <li>• Speed up progression and unlock rewards faster</li>
              <li>• Purchase special edition player cards</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinShop;