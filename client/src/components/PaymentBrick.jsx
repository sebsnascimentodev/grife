import { useEffect, useRef } from 'react';
import { obterChavePublicaMP, processarPagamento } from '../api.js';

export default function PaymentBrick({ valor, email, onAprovado, onErro }) {
  const controllerRef = useRef(null);

  useEffect(() => {
    let cancelado = false;

    async function montar() {
      if (controllerRef.current) {
        await controllerRef.current.unmount();
        controllerRef.current = null;
      }
      if (!window.MercadoPago) {
        onErro('SDK do Mercado Pago não carregou. Verifique sua conexão.');
        return;
      }
      const { publicKey } = await obterChavePublicaMP();
      if (cancelado) return;

      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
      controllerRef.current = await mp.bricks().create('payment', 'payment-brick-container', {
        initialization: { amount: valor, payer: { email: email || undefined } },
        customization: {
          paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all', bankTransfer: 'all' },
        },
        callbacks: {
          onReady: () => {},
          onError: (erro) => onErro(erro?.message || 'Erro no formulário de pagamento'),
          onSubmit: ({ formData }) =>
            new Promise((resolve, reject) => {
              processarPagamento(formData)
                .then((resultado) => {
                  if (['approved', 'in_process', 'pending'].includes(resultado.status)) {
                    onAprovado(resultado);
                    resolve();
                  } else {
                    onErro(`Pagamento recusado (${resultado.status_detail || resultado.status})`);
                    reject();
                  }
                })
                .catch((e) => {
                  onErro(e.message);
                  reject();
                });
            }),
        },
      });
    }

    montar();
    return () => {
      cancelado = true;
      controllerRef.current?.unmount();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return <div id="payment-brick-container" />;
}
