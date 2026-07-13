export function limparCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

export function cpfValido(cpf) {
  const digitos = limparCpf(cpf);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const c of base) {
      soma += Number(c) * peso;
      peso -= 1;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 9));
  const d2 = calcularDigito(digitos.slice(0, 9) + d1);
  return digitos.endsWith(`${d1}${d2}`);
}
