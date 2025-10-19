import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { MessageSquare, Users, Zap, Shield, Sparkles, Waves } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Echo Messages",
      description: "Private conversations that feel instant and natural"
    },
    {
      icon: Users,
      title: "Nexus Communities",
      description: "Create spaces where your community thrives"
    },
    {
      icon: Waves,
      title: "Vibe Rooms",
      description: "Share experiences together in real-time"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed and responsiveness"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your conversations, protected end-to-end"
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "An interface that sparks joy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center animate-gradient"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary-glow via-accent to-primary-glow bg-clip-text text-transparent animate-gradient">
                Connect Beyond Boundaries
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Valvyn brings people together with next-gen communication. 
              Create your Nexus, share your vibes, and build communities that matter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
            Why Valvyn?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover:shadow-elegant transition-all duration-300 group hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="glass rounded-3xl p-12 max-w-4xl mx-auto text-center space-y-6 shadow-elegant">
            <h2 className="text-4xl font-bold">
              Ready to Transform Communication?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands discovering a better way to connect
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all text-lg px-10 py-6">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Valvyn. Next-gen communication platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
