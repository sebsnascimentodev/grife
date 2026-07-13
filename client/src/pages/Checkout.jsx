import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { criarPedido } from '../api.js';
import { formatarPreco, calcularSubtotal } from '../utils.js';
import { buscarEnderecoPorCep } from '../cep.js';
import PaymentBrick from '../components/PaymentBrick.jsx';
import AuthForms from '../components/AuthForms.jsx';
import './Checkout.css';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function Checkout() {
  const { itens, limpar } = useCart();
  const { produtos, envio } = useStore();
  const { usuario, autenticado } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const cupomCarrinho = location.state?.cupom ?? null;

  const [cliente, setCliente] = useState({ nome: '', email: '', telefone: '' });

  useEffect(() => {
    if (!usuario) return;
    setCliente((atual) => ({
      ...atual,
      nome: atual.nome || usuario.nome,
      email: atual.email || usuario.email,
    }));
  }, [usuario]);
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', cidade: '', uf: 'SP' });
  const [metodoEnvio, setMetodoEnvio] = useState('padrao');
  const [processandoPedido, setProcessandoPedido] = useState(false);
  const [erro, setErro] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState(null);

  useEffect(() => {
    const cepLimpo = endereco.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setErroCep(null);
      return;
    }
    let cancelado = false;
    const timer = setTimeout(async () => {
      setBuscandoCep(true);
      setErroCep(null);
      try {
        const encontrado = await buscarEnderecoPorCep(cepLimpo);
        if (!cancelado && encontrado) {
          setEndereco((atual) => ({
            ...atual,
            rua: encontrado.rua || atual.rua,
            cidade: encontrado.cidade || atual.cidade,
            uf: encontrado.uf || atual.uf,
          }));
        }
      } catch (e) {
        if (!cancelado) setErroCep(e.message);
      } finally {
        if (!cancelado) setBuscandoCep(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 500);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endereco.cep]);

  const subtotal = calcularSubtotal(itens, produtos);
  const freteGratis = envio && metodoEnvio === 'padrao' && subtotal >= envio.freteGratisMinimo;
  const custoEnvio = envio ? (freteGratis ? 0 : envio[metodoEnvio].custo) : 0;
  const total = Math.round((subtotal + custoEnvio) * 100) / 100;

  const dadosCompletos =
    cliente.nome && cliente.email && cliente.telefone &&
    endereco.cep && endereco.rua && endereco.numero && endereco.cidade;

  if (itens.length === 0) {
    return (
      <div className="container checkout">
        <p className="mono">Sua sacola está vazia.</p>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="container checkout">
        <h1 className="titulo">Checkout</h1>
        <div className="checkout__layout">
          <section className="card checkout__secao checkout__gate">
            <h2 className="mono">Entre ou crie uma conta para finalizar a compra</h2>
            <p className="mono">Navegar, montar a sacola e aplicar cupom continuam livres — só o checkout pede login.</p>
            <AuthForms />
          </section>

          <aside className="card checkout__resumo">
            <h2 className="mono">Resumo do pedido</h2>
            <div className="cart__linha">
              <span className="mono">Subtotal</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>
            <div className="cart__linha cart__linha--total">
              <span className="mono">Total estimado</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  async function aoAprovarPagamento(resultadoPagamento) {
    setErro(null);
    setProcessandoPedido(true);
    try {
      const pedido = await criarPedido({
        cliente,
        endereco,
        itens: itens.map((i) => ({ produtoId: i.produtoId, tamanho: i.tamanho, quantidade: i.quantidade })),
        metodoEnvio,
        cupomCodigo: cupomCarrinho?.codigo ?? null,
        pagamento: {
          metodo: resultadoPagamento.payment_method_id,
          mercadoPagoId: resultadoPagamento.id,
          status: resultadoPagamento.status,
        },
      });
      limpar();
      navigate(`/confirmacao/${pedido.numero.replace('#', '')}`, { state: { pedido } });
    } catch (e) {
      setErro(`Pagamento aprovado, mas houve um erro ao registrar o pedido: ${e.message}`);
    } finally {
      setProcessandoPedido(false);
    }
  }

  return (
    <div className="container checkout">
      <h1 className="titulo">Checkout</h1>
      <div className="checkout__layout">
        <div className="checkout__form">
          <section className="card checkout__secao">
            <h2 className="mono">Dados do cliente</h2>
            <input
              placeholder="Nome completo"
              required
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
            />
            <input
              placeholder="E-mail"
              type="email"
              required
              value={cliente.email}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
            />
            <input
              placeholder="Telefone"
              required
              value={cliente.telefone}
              onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
            />
          </section>

          <section className="card checkout__secao">
            <h2 className="mono">Endereço de entrega</h2>
            <div className="checkout__grid2">
              <input
                placeholder="CEP"
                required
                value={endereco.cep}
                onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
              />
              <input
                placeholder="Cidade"
                required
                value={endereco.cidade}
                onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
              />
            </div>
            {buscandoCep && <p className="mono">Buscando endereço...</p>}
            {erroCep && <p className="erro-texto">{erroCep}</p>}
            <input
              placeholder="Rua"
              required
              value={endereco.rua}
              onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
            />
            <div className="checkout__grid2">
              <input
                placeholder="Número"
                required
                value={endereco.numero}
                onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
              />
              <input
                placeholder="Complemento (opcional)"
                value={endereco.complemento}
                onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
              />
            </div>
            <select value={endereco.uf} onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </section>

          <section className="card checkout__secao">
            <h2 className="mono">Método de envio</h2>
            {envio && (
              <div className="checkout__envio-opcoes">
                <label className={`checkout__opcao ${metodoEnvio === 'padrao' ? 'checkout__opcao--ativa' : ''}`}>
                  <input
                    type="radio"
                    name="envio"
                    checked={metodoEnvio === 'padrao'}
                    onChange={() => setMetodoEnvio('padrao')}
                  />
                  <div>
                    <p>Padrão — {envio.padrao.prazo}</p>
                    <p className="mono">
                      {freteGratis && metodoEnvio === 'padrao' ? 'Grátis' : formatarPreco(envio.padrao.custo)}
                    </p>
                  </div>
                </label>
                <label className={`checkout__opcao ${metodoEnvio === 'expresso' ? 'checkout__opcao--ativa' : ''}`}>
                  <input
                    type="radio"
                    name="envio"
                    checked={metodoEnvio === 'expresso'}
                    onChange={() => setMetodoEnvio('expresso')}
                  />
                  <div>
                    <p>Expresso — {envio.expresso.prazo}</p>
                    <p className="mono">{formatarPreco(envio.expresso.custo)}</p>
                  </div>
                </label>
              </div>
            )}
          </section>

          <section className="card checkout__secao">
            <h2 className="mono">Pagamento</h2>
            {!dadosCompletos && (
              <p className="mono">Preencha seus dados e endereço acima para liberar o pagamento.</p>
            )}
            {dadosCompletos && total > 0 && (
              <PaymentBrick
                key={total}
                valor={total}
                email={cliente.email}
                onAprovado={aoAprovarPagamento}
                onErro={setErro}
              />
            )}
            {processandoPedido && <p className="mono">Registrando pedido...</p>}
            {erro && <p className="erro-texto">{erro}</p>}
          </section>
        </div>

        <aside className="card checkout__resumo">
          <h2 className="mono">Resumo do pedido</h2>
          <div className="cart__linha">
            <span className="mono">Subtotal</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>
          <div className="cart__linha">
            <span className="mono">Frete ({metodoEnvio === 'padrao' ? 'Padrão' : 'Expresso'})</span>
            <span>{formatarPreco(custoEnvio)}</span>
          </div>
          {cupomCarrinho && (
            <div className="cart__linha">
              <span className="mono">Cupom</span>
              <span>{cupomCarrinho.codigo}</span>
            </div>
          )}
          <div className="cart__linha cart__linha--total">
            <span className="mono">Total</span>
            <span>{formatarPreco(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
