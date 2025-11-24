import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="touch-target flex items-center justify-center"
        >
          <ArrowLeft className="h-6 w-6 text-text-primary" />
        </button>
        <h1 className="text-h4 font-semibold text-text-primary">{title}</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-5">
        <Card className="text-center max-w-md w-full">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-6 bg-warning/10 rounded-full">
              <Construction className="h-16 w-16 text-warning" />
            </div>
            <h2 className="text-h3 font-bold text-text-primary">
              Próximamente
            </h2>
            <p className="text-body text-text-secondary">{description}</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="mt-4"
            >
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoon;
