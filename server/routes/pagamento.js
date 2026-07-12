import { Router } from 'express';
import { paymentClient } from '../mercadopago.js';

const router = Router();

router.get('/chave-publica', (req, res) => {
  res.json({ publicKey: process.env.MP_PUBLIC_KEY });
});

router.post('/processar', async (req, res) => {
  const formData = req.body;
  if (!formData?.transaction_amount || !formData?.payment_method_id) {
    return res.status(400).json({ erro: 'Dados de pagamento incompletos' });
  }
  try {
    const resultado = await paymentClient.create({
      body: {
        ...formData,
        description: 'Compra GRIFE.',
      },
    });
    res.json(resultado);
  } catch (e) {
    console.error('Erro Mercado Pago:', e.message);
    res.status(502).json({ erro: 'Não foi possível processar o pagamento' });
  }
});

export default router;
