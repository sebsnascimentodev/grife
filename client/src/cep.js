export async function buscarEnderecoPorCep(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  if (!res.ok) throw new Error('Não foi possível consultar o CEP');
  const data = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');

  return {
    rua: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    uf: data.uf,
  };
}
