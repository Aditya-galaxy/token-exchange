import { Heart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
    <footer className="w-full mt-auto">
      <Card className="border-0 rounded-none">
        <CardContent className="flex items-center justify-center py-6 space-x-1 text-sm text-muted-foreground">
          <div className="container mx-auto flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with </span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span> by Aditya Kumar</span>
            </div>
            
            <div className="text-xs text-muted-foreground/60">
              © {currentYear} TokenExchange . All rights reserved.
            </div>
          </div>
          
        </CardContent>
      </Card>
    </footer>
  );
};

export default Footer;