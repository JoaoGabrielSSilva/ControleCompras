import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Copy } from 'lucide-react';

export default function Donation() {
  const PIX_KEY = 'sua-chave-pix@exemplo.com'; // ← Substitua pela sua chave real

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      alert('✅ Chave PIX copiada!');
    } catch {
      alert('Não foi possível copiar. Selecione e copie manualmente.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">❤️ Apoie o Projeto</h2>
          <p className="opacity-90 mb-6">
            Se o app te ajuda, considere uma doação via PIX. 
            Tudo vai para manutenção e melhorias!
          </p>
          
          <div className="bg-white p-4 rounded-lg mx-auto mb-4 max-w-[180px]">
            <img 
              src="/pix-qr.png" 
              alt="QR Code PIX" 
              className="w-full h-auto rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/180x180/00b4d8/ffffff?text=QR+PIX';
              }}
            />
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={PIX_KEY}
              readOnly
              className="flex-1 px-3 py-2 rounded-md text-center text-foreground text-sm bg-white/90"
            />
            <Button variant="secondary" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm opacity-75">
            Toque em copiar e cole no app do seu banco.
          </p>
        </div>
        
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ✨ Obrigado por apoiar projetos independentes!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}