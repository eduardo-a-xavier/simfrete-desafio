const fs = require('fs')

function parseCidades(secao) {
  return secao.trim().split(/\r?\n/).filter(linha => linha.trim() !== '').map(linha => {
    const [nome, min, max] = linha.trim().split(',')
    return { nome: nome.trim(), min: parseInt(min, 10), max: parseInt(max, 10) }
  })
}

function buscarCidade(cidades, cep) {
  return cidades.find(c => cep >= c.min && cep <= c.max) || null
}

function main() {
  const conteudo = fs.readFileSync('cidades_cep.txt', 'utf-8')

  const partes = conteudo.split('--')
  const cidades = parseCidades(partes[0])
  const cep = parseInt(partes[1].trim(), 10)
  const cidade = buscarCidade(cidades, cep)

  if (cidade) {
    console.log(cidade.nome)
  } else {
    console.log('Cidade não encontrada')
  }
}

main()
